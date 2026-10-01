import httpx

from app.core.config import settings
from app.services import media_storage


def test_without_blob_photos_go_to_the_uploads_folder(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(settings, "BLOB_READ_WRITE_TOKEN", None)
    url = media_storage.save_scan_image(b"jpeg-bytes", "leaf.JPG", "image/jpeg", "http://192.168.1.5:8000/")
    assert url.startswith("http://192.168.1.5:8000/uploads/") and url.endswith(".jpg")
    saved = tmp_path / "uploads" / url.rsplit("/", 1)[1]
    assert saved.read_bytes() == b"jpeg-bytes"


def test_with_a_blob_token_photos_go_to_vercel_blob(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(settings, "BLOB_READ_WRITE_TOKEN", "vercel_blob_rw_test")
    sent = {}

    def fake_put(url, **request):
        sent.update(request, url=url)
        return httpx.Response(200, json={"url": "https://store.public.blob.vercel-storage.com/scans/x.png"},
                              request=httpx.Request("PUT", url))

    monkeypatch.setattr(media_storage.httpx, "put", fake_put)
    url = media_storage.save_scan_image(b"png-bytes", "leaf.png", "image/png", "http://ignored/")

    assert url == "https://store.public.blob.vercel-storage.com/scans/x.png"
    assert sent["url"] == "https://vercel.com/api/blob/"
    assert sent["params"]["pathname"].startswith("scans/") and sent["params"]["pathname"].endswith(".png")
    assert sent["content"] == b"png-bytes"
    assert sent["headers"]["authorization"] == "Bearer vercel_blob_rw_test"
    assert sent["headers"]["x-vercel-blob-access"] == "public"
    assert sent["headers"]["x-content-type"] == "image/png"
    assert sent["headers"]["x-api-version"] == "11"
    assert not (tmp_path / "uploads").exists()


def test_a_blob_failure_is_raised_not_swallowed(monkeypatch):
    monkeypatch.setattr(settings, "BLOB_READ_WRITE_TOKEN", "vercel_blob_rw_test")
    client = httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(403, json={"error": "denied"})))
    try:
        media_storage.upload_to_blob("scans/a.jpg", b"x", "image/jpeg", client=client)
    except httpx.HTTPStatusError as e:
        assert e.response.status_code == 403
    else:
        raise AssertionError("expected an error")


def test_only_two_settings_are_required():
    from app.core.config import Settings

    s = Settings(_env_file=None, JWT_SECRET="x", DATABASE_URL="sqlite://")
    assert s.RESEND_API_KEY == "" and s.MINIO_URL is None and s.BLOB_READ_WRITE_TOKEN is None


def test_login_codes_are_random_when_deployed_and_fixed_locally(monkeypatch):
    from app.services import otp_service

    monkeypatch.setattr(settings, "VERCEL", None)
    assert otp_service.generate_otp() == "123456"
    monkeypatch.setattr(settings, "VERCEL", "1")
    codes = {otp_service.generate_otp() for _ in range(20)}
    assert len(codes) > 1 and all(len(c) == 6 and c.isdigit() for c in codes)
