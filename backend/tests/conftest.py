import os

# Settings are required at import time; tests never reach these services.
os.environ.setdefault("JWT_SECRET", "test-secret")
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("RESEND_API_KEY", "test")
os.environ.setdefault("MINIO_URL", "http://localhost:9000")
os.environ.setdefault("MINIO_ACCESS_KEY", "test")
os.environ.setdefault("MINIO_SECRET_KEY", "test")
os.makedirs("uploads", exist_ok=True)  # main.py mounts it

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base, get_db
import app.models.user  # noqa: F401  registers the tables
import app.models.otp  # noqa: F401
import app.models.dashboard  # noqa: F401
from app.main import app


@pytest.fixture
def db():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, autoflush=False)
    session = Session()
    yield session
    session.close()
    engine.dispose()


@pytest.fixture
def client(db):
    app.dependency_overrides[get_db] = lambda: db
    yield TestClient(app)
    app.dependency_overrides.clear()
