import io
import uuid

import pytest

from app.api.dependencies import get_current_user
from app.core.config import settings
from app.main import app
from app.models.scan import ScanReport
from app.models.user import User
from app.services import gemini, scan_analysis
from app.services.scan_analysis import NotTheRightPhoto, finish_disease, finish_seed, seed_grade


SEED_RAW = {
    "is_peanut_seed_photo": True, "healthy": 9, "underdeveloped": 1, "damaged": 2, "diseased": 0,
    "size_uniformity_pct": 80, "color_consistency_pct": 140, "confidence_pct": 85,
    "summary": "Mostly good seed.", "actions": [{"title": "Sort out broken", "detail": "Remove 2 broken."}] * 5,
}

DISEASE_RAW = {
    "is_crop_photo": True, "category": "disease", "condition_en": "Early Leaf Spot",
    "condition": "ابتدائی پتوں کے دھبے", "confidence_pct": 80, "affected_pct": 30, "severity_stage": 2,
    "outbreak_risk": "medium", "explanation": "Brown spots with yellow halos.", "urgent_action": "Spray.",
    "treatments": [{"title": "Fungicide", "detail": "Chlorothalonil 2 ml/L."}], "prevention": "Rotate crops.",
}


def test_seed_numbers_come_from_counts():
    r = finish_seed(SEED_RAW)
    assert r["total_seeds"] == 12
    assert r["percentages"] == {"healthy": 75, "underdeveloped": 8, "damaged": 17, "diseased": 0}
    assert sum(r["percentages"].values()) == 100
    assert r["grade"] == "B"
    assert r["germination_pct"] == round(75 * 0.95 + 8 * 0.5)
    assert r["color_consistency_pct"] == 100  # clamped
    assert len(r["actions"]) == 3


def test_grades():
    assert [seed_grade(p) for p in (90, 85, 70, 50, 49)] == ["A", "A", "B", "C", "D"]


def test_not_seeds_or_no_seeds_is_refused():
    with pytest.raises(NotTheRightPhoto):
        finish_seed({**SEED_RAW, "is_peanut_seed_photo": False})
    with pytest.raises(NotTheRightPhoto):
        finish_seed({**SEED_RAW, "healthy": 0, "underdeveloped": 0, "damaged": 0, "diseased": 0})


def test_disease_result_and_status():
    r = finish_disease(DISEASE_RAW)
    assert r["condition_en"] == "Early Leaf Spot" and r["severity_stage"] == 2
    assert scan_analysis.disease_status(r) == "Moderate"
    assert scan_analysis.disease_status({**r, "outbreak_risk": "high"}) == "High Risk"
    assert scan_analysis.disease_status({**r, "category": "healthy"}) == "Healthy"
    assert finish_disease({**DISEASE_RAW, "severity_stage": 9, "outbreak_risk": "x"})["severity_stage"] == 4
    with pytest.raises(NotTheRightPhoto):
        finish_disease({**DISEASE_RAW, "is_crop_photo": False})


@pytest.fixture
def farmer(db, tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(settings, "BLOB_READ_WRITE_TOKEN", None)
    user = User(id=uuid.uuid4(), identifier="ali@example.com", name="Ali", farm_location="Chakwal, Punjab")
    db.add(user)
    db.commit()
    app.dependency_overrides[get_current_user] = lambda: user
    yield user
    app.dependency_overrides.pop(get_current_user, None)


def post(client, analyze=True, kind="Seed Intelligence", lang="en"):
    data = {"type": kind, "language": lang}
    if analyze:
        data["analyze"] = "true"
    else:
        data.update(title="Seed Quality Analysis", status="Healthy", confidence_score="94.2")
    return client.post("/api/v1/scans/", data=data, files={"file": ("seeds.jpg", io.BytesIO(b"jpeg"), "image/jpeg")})


def test_app_scan_is_analysed_and_saved(client, farmer, db, monkeypatch):
    seen = {}

    def fake(system, parts, schema, **_):
        seen.update(system=system, mime=parts[0].mime_type, schema=schema)
        return SEED_RAW

    monkeypatch.setattr(gemini, "generate_json", fake)
    res = post(client, lang="ur")
    assert res.status_code == 201, res.text
    body = res.json()
    assert body["title"] == "Seed Lot Grade B" and body["status"] == "Healthy"
    assert body["confidence_score"] == 85
    assert body["analysis"]["total_seeds"] == 12
    assert "Urdu" in seen["system"] and "Chakwal" in seen["system"] and seen["mime"] == "image/jpeg"
    assert db.query(ScanReport).one().analysis["grade"] == "B"


def test_disease_scan(client, farmer, monkeypatch):
    monkeypatch.setattr(gemini, "generate_json", lambda *a, **k: DISEASE_RAW)
    body = post(client, kind="Disease Intelligence").json()
    assert body["title"] == "Early Leaf Spot Detection" and body["status"] == "Moderate"
    assert body["analysis"]["condition"] == "ابتدائی پتوں کے دھبے"


def test_wrong_photo_is_refused_and_not_saved(client, farmer, db, monkeypatch):
    monkeypatch.setattr(gemini, "generate_json", lambda *a, **k: {**SEED_RAW, "is_peanut_seed_photo": False})
    res = post(client)
    assert res.status_code == 422
    assert "peanut seeds" in res.json()["detail"]
    assert db.query(ScanReport).count() == 0


def test_busy_ai_is_502_and_not_saved(client, farmer, db, monkeypatch):
    def busy(*a, **k):
        raise gemini.AIUnavailable("busy")
    monkeypatch.setattr(gemini, "generate_json", busy)
    assert post(client).status_code == 502
    assert db.query(ScanReport).count() == 0


def test_website_scans_without_analysis_still_work(client, farmer, monkeypatch):
    def never(*a, **k):
        raise AssertionError("no AI without analyze")
    monkeypatch.setattr(gemini, "generate_json", never)
    body = post(client, analyze=False).json()
    assert body["title"] == "Seed Quality Analysis" and body["analysis"] is None
