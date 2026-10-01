import io
import uuid

from app.api.dependencies import get_current_user
from app.core.config import settings
from app.main import app
from app.models.dashboard import ActivityLog
from app.models.user import User


def test_scans_are_logged_by_their_kind(client, db, tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(settings, "BLOB_READ_WRITE_TOKEN", None)
    user = User(id=uuid.uuid4(), identifier="farmer@example.com")
    db.add(user)
    db.commit()
    app.dependency_overrides[get_current_user] = lambda: user
    try:
        for kind in ["Disease Intelligence", "Seed Intelligence"]:
            res = client.post(
                "/api/v1/scans/",
                data={"type": kind, "title": "t", "status": "Healthy", "confidence_score": "0.9"},
                files={"file": ("leaf.jpg", io.BytesIO(b"jpeg"), "image/jpeg")},
            )
            assert res.status_code == 201, res.text
    finally:
        app.dependency_overrides.pop(get_current_user, None)
    actions = [a.action for a in db.query(ActivityLog).all()]
    assert sorted(actions) == ["Disease Analysis", "Seed Quality Scan"]
