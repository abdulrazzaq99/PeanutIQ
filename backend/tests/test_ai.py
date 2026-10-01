import io
import json
import uuid

import httpx
import pytest

from app.api.dependencies import get_current_user
from app.core.config import settings
from app.main import app
from app.models.knowledge import Article
from app.models.user import User
from app.services import gemini, weather
from app.services.advisor import clean, system_prompt


@pytest.fixture
def farmer(db):
    user = User(id=uuid.uuid4(), identifier="ali@example.com", name="Ali Khan", farm_location="Chakwal, Punjab")
    db.add(user)
    db.commit()
    app.dependency_overrides[get_current_user] = lambda: user
    yield user
    app.dependency_overrides.pop(get_current_user, None)


@pytest.fixture
def fake_gemini(monkeypatch):
    calls = []

    def generate(system, parts, history=None, json_schema=None, **_):
        calls.append({"system": system, "parts": parts, "history": history, "schema": json_schema})
        if json_schema:
            return json.dumps({"transcript": "When should I water?", "reply": "**Water** lightly.\n* Morning is best"})
        return "**Water** lightly at flowering.\n- Morning is best"

    monkeypatch.setattr(gemini, "generate", generate)
    return calls


# --- Gemini client -------------------------------------------------------------------------

def _transport(responses):
    seen = []

    def handler(request):
        seen.append(request.url.path.split("/")[-1].split(":")[0])
        status, body = responses.pop(0)
        return httpx.Response(status, json=body)

    return httpx.MockTransport(handler), seen


OK = {"candidates": [{"content": {"parts": [{"text": "Irrigate lightly."}]}}]}
BUSY = {"error": {"code": 503, "status": "UNAVAILABLE"}}


def test_busy_models_fall_back_to_the_next(monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "k")
    monkeypatch.setattr(settings, "GEMINI_MODELS", "a,b,c")
    transport, seen = _transport([(503, BUSY), (404, {}), (200, OK)])
    text = gemini.generate("sys", [gemini.Part(text="hi")], client=httpx.Client(transport=transport))
    assert text == "Irrigate lightly."
    assert seen == ["a", "b", "c"]


def test_a_second_round_is_tried_before_giving_up(monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "k")
    monkeypatch.setattr(settings, "GEMINI_MODELS", "a")
    monkeypatch.setattr(gemini.time, "sleep", lambda s: None)
    transport, seen = _transport([(503, BUSY), (200, OK)])
    assert gemini.generate("s", [gemini.Part(text="hi")], client=httpx.Client(transport=transport)) == "Irrigate lightly."
    transport, _ = _transport([(503, BUSY), (503, BUSY)])
    with pytest.raises(gemini.AIUnavailable):
        gemini.generate("s", [gemini.Part(text="hi")], client=httpx.Client(transport=transport))


def test_no_key_means_unavailable(monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", None)
    with pytest.raises(gemini.AIUnavailable):
        gemini.generate("s", [gemini.Part(text="hi")])


def test_request_shape(monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "secret")
    monkeypatch.setattr(settings, "GEMINI_MODELS", "m")
    sent = {}

    def handler(request):
        sent["key"] = request.headers["x-goog-api-key"]
        sent["body"] = json.loads(request.content)
        return httpx.Response(200, json=OK)

    gemini.generate(
        "SYS",
        [gemini.Part(data=b"img", mime_type="image/jpeg"), gemini.Part(text="what is this")],
        history=[gemini.Turn("user", "hello"), gemini.Turn("model", "hi")],
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )
    body = sent["body"]
    assert sent["key"] == "secret"
    assert body["systemInstruction"]["parts"][0]["text"] == "SYS"
    assert [c["role"] for c in body["contents"]] == ["user", "model", "user"]
    assert body["contents"][-1]["parts"][0]["inline_data"] == {"mime_type": "image/jpeg", "data": "aW1n"}


# --- Prompts -------------------------------------------------------------------------------

def test_prompt_carries_farmer_context_and_language(farmer):
    ur = system_prompt(farmer, "ur")
    assert "Ali Khan" in ur and "Chakwal, Punjab" in ur and "Urdu" in ur
    assert "English" in system_prompt(farmer, "en")


def test_markdown_is_cleaned_for_plain_text_bubbles():
    assert clean("**Water** lightly.\n* Morning\n- Evening\n## Tip") == "Water lightly.\n• Morning\n• Evening\nTip"


# --- Endpoints -----------------------------------------------------------------------------

def test_chat_replies_in_plain_text_with_history(client, farmer, fake_gemini):
    res = client.post("/api/v1/assistant/chat", json={
        "message": "When should I water?", "language": "ur",
        "history": [{"role": "model", "text": "Welcome!"}, {"role": "user", "text": "Hi"}, {"role": "model", "text": "Hello"}],
    })
    assert res.status_code == 200
    assert res.json() == {"reply": "Water lightly at flowering.\n• Morning is best", "transcript": None}
    call = fake_gemini[0]
    assert "Urdu" in call["system"]
    # A leading model turn (the greeting) is dropped: Gemini wants the user first.
    assert [t.role for t in call["history"]] == ["user", "model"]


def test_voice_returns_transcript_and_reply(client, farmer, fake_gemini):
    res = client.post("/api/v1/assistant/media", data={"language": "en"},
                      files={"file": ("voice.m4a", io.BytesIO(b"aac"), "application/octet-stream")})
    assert res.status_code == 200
    assert res.json() == {"reply": "Water lightly.\n• Morning is best", "transcript": "When should I water?"}
    assert fake_gemini[0]["parts"][0].mime_type == "audio/mp4"
    assert fake_gemini[0]["schema"] is not None


def test_photo_is_sent_as_an_image(client, farmer, fake_gemini):
    res = client.post("/api/v1/assistant/media", data={"language": "en", "history": "not json"},
                      files={"file": ("leaf.jpg", io.BytesIO(b"jpeg"), "image/jpeg")})
    assert res.status_code == 200
    assert fake_gemini[0]["parts"][0].mime_type == "image/jpeg"
    assert "photo" in fake_gemini[0]["system"]


def test_other_files_and_big_files_are_refused(client, farmer, fake_gemini):
    assert client.post("/api/v1/assistant/media", files={"file": ("a.pdf", io.BytesIO(b"x"), "application/pdf")}).status_code == 415
    big = io.BytesIO(b"x" * (4 * 1024 * 1024 + 1))
    assert client.post("/api/v1/assistant/media", files={"file": ("a.jpg", big, "image/jpeg")}).status_code == 413
    assert fake_gemini == []


def test_busy_ai_is_a_502_not_a_503(client, farmer, monkeypatch):
    # 503 would send the app to its maintenance screen.
    def busy(*a, **k):
        raise gemini.AIUnavailable("overloaded")
    monkeypatch.setattr(gemini, "generate", busy)
    res = client.post("/api/v1/assistant/chat", json={"message": "hi"})
    assert res.status_code == 502
    assert res.json() == {"detail": "AI assistant is busy. Please try again."}


def test_daily_limit(client, farmer, fake_gemini, monkeypatch):
    monkeypatch.setattr(settings, "AI_DAILY_LIMIT", 2)
    for _ in range(2):
        assert client.post("/api/v1/assistant/chat", json={"message": "hi"}).status_code == 200
    res = client.post("/api/v1/assistant/chat", json={"message": "hi"})
    assert res.status_code == 429 and res.json() == {"detail": "Daily AI limit reached"}


def test_signed_out_users_cannot_use_ai(client):
    assert client.post("/api/v1/assistant/chat", json={"message": "hi"}).status_code == 401


def test_knowledge_ask_uses_published_articles_only(client, farmer, fake_gemini, db):
    db.add_all([
        Article(title="Leaf Spot Control", category="Disease", excerpt="e", content="Spray chlorothalonil.",
                author="Dr A", is_published=True),
        Article(title="Draft Secret", category="Disease", excerpt="e", content="unpublished", author="Dr B",
                is_published=False),
    ])
    db.commit()
    res = client.post("/api/v1/knowledge/ask", json={"query": "leaf spot?", "language": "en"})
    assert res.status_code == 200 and res.json()["answer"].startswith("Water lightly")
    system = fake_gemini[0]["system"]
    assert "Leaf Spot Control" in system and "Draft Secret" not in system


# --- Weather -------------------------------------------------------------------------------

def test_weather_codes_map_to_app_conditions():
    assert weather.condition(0) == "sunny"
    assert weather.condition(0, wind_kmh=35) == "breezy"
    assert weather.condition(2) == "partlyCloudy"
    assert weather.condition(3) == "cloudy"
    assert weather.condition(45) == "fog"
    assert weather.condition(53) == "drizzle"
    assert weather.condition(63) == "rain" and weather.condition(81) == "rain"
    assert weather.condition(95) == "thunderstorm"


def test_forecast_for_the_farm_district(monkeypatch):
    weather._cache.clear()
    seen = {}

    def handler(request):
        seen.update(dict(request.url.params))
        return httpx.Response(200, json={
            "current": {"temperature_2m": 31.6, "weather_code": 0, "wind_speed_10m": 8},
            "daily": {"time": ["2026-10-01", "2026-10-02", "2026-10-03"],
                      "weather_code": [0, 61, 3], "temperature_2m_max": [33.2, 29.4, 30.0],
                      "temperature_2m_min": [19.1, 18.0, 17.6], "wind_speed_10m_max": [10, 12, 31]},
        })

    result = weather.forecast("Attock, Punjab", client=httpx.Client(transport=httpx.MockTransport(handler)))
    assert (seen["latitude"], seen["longitude"]) == ("33.77", "72.36")
    assert result["current"] == {"temp_c": 32, "condition": "sunny"}
    assert [d["condition"] for d in result["days"]] == ["sunny", "rain", "cloudy"]
    assert result["days"][1] == {"date": "2026-10-02", "max_c": 29, "min_c": 18, "condition": "rain"}


def test_weather_endpoint_failure_is_502(client, farmer, monkeypatch):
    def down(*a, **k):
        raise httpx.ConnectError("down")
    monkeypatch.setattr(weather, "forecast", down)
    assert client.get("/api/v1/dashboard/weather").status_code == 502
