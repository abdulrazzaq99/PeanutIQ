from jose import jwt

from app.core.config import settings
from app.models.user import User, UserRole

ACCOUNT = {
    "name": " Ali Khan ",
    "identifier": "Ali@Example.com",
    "password": "secret123",
    "farm_location": "Chakwal, Punjab",
    "language_preference": "urdu",
}


def register(client, **changes):
    return client.post("/api/v1/auth/register", json={**ACCOUNT, **changes})


def login(client, identifier="ali@example.com", password="secret123"):
    return client.post("/api/v1/auth/login", json={"identifier": identifier, "password": password})


def test_register_creates_a_farmer_without_signing_in(client, db):
    res = register(client)
    assert res.status_code == 201
    body = res.json()
    assert body["identifier"] == "ali@example.com"
    assert body["name"] == "Ali Khan"
    assert body["role"] == "farmer"
    assert body["farm_location"] == "Chakwal, Punjab"
    assert body["language_preference"] == "urdu"
    assert "access_token" not in body
    assert "password" not in body and "password_hash" not in body
    stored = db.query(User).one()
    assert stored.password_hash and stored.password_hash != "secret123"


def test_register_ignores_a_requested_role(client, db):
    register(client, role="admin")
    assert db.query(User).one().role == UserRole.farmer


def test_register_refuses_a_taken_email_in_any_case(client):
    register(client)
    res = register(client, identifier="ALI@example.com")
    assert res.status_code == 400
    assert res.json() == {"detail": "Email already registered"}


def test_register_refuses_an_email_that_only_has_code_sign_in(client, db):
    db.add(User(identifier="ali@example.com"))
    db.commit()
    assert register(client).status_code == 400


def test_register_validates_fields(client):
    assert register(client, password="short").status_code == 422
    assert register(client, password="x" * 73).status_code == 422
    assert register(client, identifier="not-an-email").status_code == 422
    assert register(client, name="   ").status_code == 422


def test_login_returns_the_same_shape_as_verify_otp(client):
    register(client)
    res = login(client, identifier=" ALI@example.com ")
    assert res.status_code == 200
    body = res.json()
    assert body["token_type"] == "bearer"
    assert body["user"]["identifier"] == "ali@example.com"
    # The token works like an OTP one: its subject is the user's id.
    claims = jwt.decode(body["access_token"], settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    assert claims["sub"] == body["user"]["id"]


def test_login_failures_all_look_the_same(client, db):
    register(client)
    db.add(User(identifier="codeonly@example.com"))
    db.commit()
    for identifier, password in [
        ("ali@example.com", "wrong-pass"),
        ("nobody@example.com", "secret123"),
        ("codeonly@example.com", "secret123"),
    ]:
        res = login(client, identifier, password)
        assert res.status_code == 401, identifier
        assert res.json() == {"detail": "Incorrect email or password"}


def test_login_refuses_a_deactivated_account(client, db):
    register(client)
    user = db.query(User).one()
    user.is_active = False
    db.commit()
    assert login(client).status_code == 401


def test_postgres_urls_use_the_installed_driver():
    from app.core.config import Settings

    for url in ["postgresql://u:p@db:5432/x", "postgres://u:p@db:5432/x"]:
        assert Settings(DATABASE_URL=url).DATABASE_URL == "postgresql+psycopg2://u:p@db:5432/x"
    assert Settings(DATABASE_URL="sqlite://").DATABASE_URL == "sqlite://"
