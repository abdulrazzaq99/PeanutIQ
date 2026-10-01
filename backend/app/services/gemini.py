"""Minimal Gemini client (REST, via httpx).

Google frequently answers 503 "high demand" or 429, so each request tries the configured
models in order, with one short retry round, before giving up.
"""
import base64
import json
import logging
import time
from dataclasses import dataclass

import httpx

from app.core.config import settings

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
RETRYABLE = {404, 429, 500, 502, 503, 504}  # 404: a model retired for this key
log = logging.getLogger("peanutiq.gemini")


class AIUnavailable(Exception):
    """No model answered (not configured, overloaded, or blocked)."""


@dataclass
class Part:
    text: str | None = None
    data: bytes | None = None
    mime_type: str | None = None

    def to_json(self) -> dict:
        if self.data is not None:
            return {"inline_data": {"mime_type": self.mime_type, "data": base64.b64encode(self.data).decode()}}
        return {"text": self.text or ""}


@dataclass
class Turn:
    role: str  # "user" | "model"
    text: str


def models() -> list[str]:
    return [m.strip() for m in settings.GEMINI_MODELS.split(",") if m.strip()]


def generate(
    system: str,
    parts: list[Part],
    history: list[Turn] | None = None,
    json_schema: dict | None = None,
    client: httpx.Client | None = None,
    deadline_seconds: float = 45,
) -> str:
    """Returns the model's text (a JSON string when json_schema is given)."""
    if not settings.GEMINI_API_KEY:
        raise AIUnavailable("AI is not configured")

    body: dict = {
        "systemInstruction": {"parts": [{"text": system}]},
        "contents": [
            *({"role": t.role, "parts": [{"text": t.text}]} for t in (history or [])),
            {"role": "user", "parts": [p.to_json() for p in parts]},
        ],
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 1024},
    }
    if json_schema:
        body["generationConfig"]["responseMimeType"] = "application/json"
        body["generationConfig"]["responseSchema"] = json_schema

    http = client or httpx.Client()
    started = time.monotonic()
    last_error = "no model answered"
    try:
        for round_ in range(2):
            for model in models():
                # Every attempt gets only the time that's left, so the whole request stays
                # within the deadline (the app gives up waiting at 60 s).
                remaining = deadline_seconds - (time.monotonic() - started)
                if remaining < 3:
                    log.warning("gemini gave up: deadline reached; last error %s", last_error)
                    raise AIUnavailable("timed out")
                try:
                    res = http.post(
                        API_URL.format(model=model),
                        headers={"x-goog-api-key": settings.GEMINI_API_KEY},
                        json=body,
                        timeout=httpx.Timeout(min(30.0, remaining), connect=5.0),
                    )
                except httpx.HTTPError as e:
                    last_error = f"{model}: {e.__class__.__name__}"
                    log.warning("gemini %s", last_error)
                    continue
                if res.status_code in RETRYABLE:
                    last_error = f"{model}: HTTP {res.status_code}"
                    log.warning("gemini %s", last_error)
                    continue
                if res.status_code != 200:
                    log.error("gemini %s: HTTP %s %s", model, res.status_code, res.text[:300])
                    raise AIUnavailable(f"{model}: HTTP {res.status_code}")
                text = _text_of(res.json())
                if text:
                    return text
                last_error = f"{model}: empty or blocked reply"
            if round_ == 0:
                time.sleep(1.5)
    finally:
        if client is None:
            http.close()
    log.warning("gemini gave up: %s", last_error)
    raise AIUnavailable(last_error)


def _text_of(data: dict) -> str:
    for candidate in data.get("candidates") or []:
        texts = [p.get("text", "") for p in (candidate.get("content") or {}).get("parts") or [] if not p.get("thought")]
        text = "".join(texts).strip()
        if text:
            return text
    return ""


def generate_json(system: str, parts: list[Part], schema: dict, **kwargs) -> dict:
    return json.loads(generate(system, parts, json_schema=schema, **kwargs))
