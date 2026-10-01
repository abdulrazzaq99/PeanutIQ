"""The farming assistant (Gemini): text, voice and photo messages."""
import json
from typing import Literal

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, Field, ValidationError
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services import gemini
from app.services.advisor import clean, system_prompt
from app.services.ai_quota import use_quota

router = APIRouter()

# Vercel rejects request bodies over 4.5 MB.
MAX_MEDIA_BYTES = 4 * 1024 * 1024
BUSY = "AI assistant is busy. Please try again."


class ChatTurn(BaseModel):
    role: Literal["user", "model"]
    text: str = Field(max_length=4000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    language: Literal["en", "ur"] = "en"
    history: list[ChatTurn] = Field(default_factory=list, max_length=20)


class ChatReply(BaseModel):
    reply: str
    transcript: str | None = None


def _history(turns: list[ChatTurn]) -> list[gemini.Turn]:
    # Gemini expects the conversation to start with the user.
    while turns and turns[0].role != "user":
        turns = turns[1:]
    return [gemini.Turn(t.role, t.text) for t in turns]


@router.post("/chat", response_model=ChatReply)
def chat(request: ChatRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    use_quota(db, user)
    try:
        reply = gemini.generate(
            system_prompt(user, request.language),
            [gemini.Part(text=request.message)],
            history=_history(request.history),
        )
    except gemini.AIUnavailable:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, detail=BUSY)
    return ChatReply(reply=clean(reply))


VOICE_SCHEMA = {
    "type": "OBJECT",
    "properties": {"transcript": {"type": "STRING"}, "reply": {"type": "STRING"}},
    "required": ["transcript", "reply"],
}


@router.post("/media", response_model=ChatReply)
def media(
    file: UploadFile = File(...),
    language: Literal["en", "ur"] = Form("en"),
    history: str = Form("[]"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """A photo (image/*) or a voice message (audio/*). Voice replies include what was heard."""
    content_type = (file.content_type or "").lower()
    if content_type == "audio/x-m4a" or (file.filename or "").lower().endswith(".m4a"):
        content_type = "audio/mp4"
    is_audio = content_type.startswith("audio/")
    if not (is_audio or content_type.startswith("image/")):
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Send a photo or a voice message")
    data = file.file.read(MAX_MEDIA_BYTES + 1)
    if len(data) > MAX_MEDIA_BYTES:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File is too large")
    try:
        turns = [ChatTurn(**t) for t in json.loads(history)][-20:]
    except (ValueError, TypeError, ValidationError):
        turns = []

    use_quota(db, user)
    part = gemini.Part(data=data, mime_type=content_type)
    try:
        if is_audio:
            result = gemini.generate_json(
                system_prompt(user, language)
                + "\n- The farmer sent a voice message. First write down exactly what they said "
                "(transcript, in the language they spoke), then reply to it.",
                [part],
                VOICE_SCHEMA,
                history=_history(turns),
            )
            return ChatReply(reply=clean(str(result.get("reply", ""))), transcript=str(result.get("transcript", "")).strip() or None)
        reply = gemini.generate(
            system_prompt(user, language, photo=True),
            [part, gemini.Part(text="What do you see, and what should I do?")],
            history=_history(turns),
        )
        return ChatReply(reply=clean(reply))
    except (gemini.AIUnavailable, ValueError):
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, detail=BUSY)
