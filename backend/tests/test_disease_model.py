import io
import uuid

import pytest
from PIL import Image

from app.api.dependencies import get_current_user
from app.main import app
from app.models.user import User
from app.services import disease_model, gemini, scan_analysis
from app.services.disease_model import Prediction
from tests.test_scan_analysis import DISEASE_RAW

USER = User(name="Ali", farm_location="Chakwal, Punjab")


def jpeg(color=(40, 140, 40), size=(640, 480)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, "JPEG")
    return buf.getvalue()


@pytest.fixture
def model(monkeypatch):
    """A stand-in for the trained model: tests set what it predicts."""
    state = {"label": "early_leaf_spot", "confidence": 0.9}
    monkeypatch.setattr(disease_model, "available", lambda: True)
    monkeypatch.setattr(disease_model, "predict", lambda data: Prediction(
        state["label"], state["confidence"], {state["label"]: state["confidence"]}))
    return state


def test_preprocess_matches_training_size():
    x = disease_model.preprocess(jpeg(size=(1000, 600)))
    assert x.shape == (1, 3, 224, 224)
    assert 0.0 <= x.min() and x.max() <= 1.0


def test_unreadable_bytes_are_a_value_error():
    with pytest.raises(ValueError):
        disease_model.predict(b"not an image")


def test_model_decides_and_gemini_writes_the_advice(model, monkeypatch):
    seen = {}

    def fake(system, parts, schema, **_):
        seen["system"] = system
        return {**DISEASE_RAW, "condition_en": "Rust", "category": "disease", "confidence_pct": 40}

    monkeypatch.setattr(gemini, "generate_json", fake)
    r = scan_analysis.analyze_disease(jpeg(), "image/jpeg", "ur", USER)
    assert 'classified this photo as "Early Leaf Spot" (90% confidence)' in seen["system"]
    assert r["condition_en"] == "Early Leaf Spot"  # the model's answer wins
    assert r["condition"] == "ابتدائی پتوں کے دھبے"
    assert r["confidence_pct"] == 90
    assert r["detected_by"] == "model" and r["advice_source"] == "gemini"
    assert r["treatments"] == DISEASE_RAW["treatments"]
    assert r["model"]["label"] == "early_leaf_spot"


def test_unsure_model_lets_gemini_diagnose(model, monkeypatch):
    model.update(label="rust", confidence=0.35)
    seen = {}

    def fake(system, parts, schema, **_):
        seen["system"] = system
        return {**DISEASE_RAW, "condition_en": "Collar Rot", "condition": "Collar Rot"}

    monkeypatch.setattr(gemini, "generate_json", fake)
    r = scan_analysis.analyze_disease(jpeg(), "image/jpeg", "en", USER)
    assert "trained image model" not in seen["system"]
    assert r["condition_en"] == "Collar Rot" and r["detected_by"] == "gemini"
    assert r["model"]["confidence"] == 0.35  # still recorded


def test_busy_gemini_falls_back_to_built_in_advice(model, monkeypatch):
    model.update(label="caterpillar", confidence=0.97)

    def busy(*a, **k):
        raise gemini.AIUnavailable("busy")

    monkeypatch.setattr(gemini, "generate_json", busy)
    r = scan_analysis.analyze_disease(jpeg(), "image/jpeg", "ur", USER)
    assert r["condition"] == "سرخ بالوں والی سنڈی" and r["category"] == "pest"
    assert r["advice_source"] == "built-in"
    assert r["urgent_action"] and len(r["treatments"]) == 2
    assert "محکمہ زراعت" in r["treatments"][1]["detail"]  # spray steps carry the safety note
    assert scan_analysis.disease_status(r) == "High Risk"


def test_busy_gemini_and_unsure_model_is_unavailable(model, monkeypatch):
    model.update(confidence=0.2)
    monkeypatch.setattr(gemini, "generate_json", lambda *a, **k: (_ for _ in ()).throw(gemini.AIUnavailable("x")))
    with pytest.raises(gemini.AIUnavailable):
        scan_analysis.analyze_disease(jpeg(), "image/jpeg", "en", USER)


def test_healthy_prediction_is_consistent(model, monkeypatch):
    model.update(label="healthy", confidence=0.95)
    monkeypatch.setattr(gemini, "generate_json", lambda *a, **k: {**DISEASE_RAW, "severity_stage": 3, "outbreak_risk": "high"})
    r = scan_analysis.analyze_disease(jpeg(), "image/jpeg", "en", USER)
    assert (r["category"], r["severity_stage"], r["outbreak_risk"]) == ("healthy", 0, "low")
    assert scan_analysis.disease_status(r) == "Healthy"


def test_not_a_crop_is_still_refused(model, monkeypatch):
    monkeypatch.setattr(gemini, "generate_json", lambda *a, **k: {**DISEASE_RAW, "is_crop_photo": False})
    with pytest.raises(scan_analysis.NotTheRightPhoto):
        scan_analysis.analyze_disease(jpeg(), "image/jpeg", "en", USER)


def test_built_in_advice_exists_for_every_class_and_language():
    from app.services import disease_advice
    for label in disease_model.CONDITIONS:
        for lang in ("en", "ur"):
            a = disease_advice.built_in(label, lang)
            assert a["explanation"] and a["urgent_action"] and a["treatments"] and a["prevention"], (label, lang)
        assert set(disease_advice.NAMES[label]) == {"en", "ur"}


@pytest.mark.skipif(not disease_model.available(), reason="model not trained yet")
def test_the_real_model_runs():
    p = disease_model.predict(jpeg())
    assert p.label in disease_model.CONDITIONS
    assert abs(sum(p.probabilities.values()) - 1) < 0.01


def test_model_info_endpoint(client, db, monkeypatch):
    user = User(id=uuid.uuid4(), identifier="a@example.com")
    db.add(user)
    db.commit()
    app.dependency_overrides[get_current_user] = lambda: user
    try:
        monkeypatch.setattr(disease_model, "metrics", lambda: {"test": {"accuracy": 0.9}})
        assert client.get("/api/v1/scans/disease-model").json() == {"test": {"accuracy": 0.9}}
        monkeypatch.setattr(disease_model, "metrics", lambda: None)
        assert client.get("/api/v1/scans/disease-model").status_code == 404
    finally:
        app.dependency_overrides.pop(get_current_user, None)
