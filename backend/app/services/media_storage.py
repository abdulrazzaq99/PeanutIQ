"""Where scan photos are stored.

- Vercel (BLOB_READ_WRITE_TOKEN set): Vercel Blob, which returns a public https URL.
  Vercel's own disk is read-only and wiped between requests, so it can't hold uploads.
- Locally: the uploads/ folder, served by main.py at /uploads.
"""
import os
import uuid

import httpx

from app.core.config import settings

UPLOAD_DIR = "uploads"

# Same request the official Vercel SDK (vercel.blob.put) sends.
BLOB_API_URL = "https://vercel.com/api/blob/"
BLOB_API_VERSION = "11"


def uses_blob() -> bool:
    return bool(settings.BLOB_READ_WRITE_TOKEN)


def save_scan_image(data: bytes, filename: str | None, content_type: str | None, base_url: str) -> str:
    """Stores the photo and returns the URL clients load it from."""
    extension = os.path.splitext(filename or "")[1].lower() or ".jpg"
    name = f"{uuid.uuid4()}{extension}"
    if uses_blob():
        return upload_to_blob(f"scans/{name}", data, content_type or "image/jpeg")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with open(os.path.join(UPLOAD_DIR, name), "wb") as out:
        out.write(data)
    # The address the client used, so a phone on the network gets a link it can open.
    return f"{base_url.rstrip('/')}/{UPLOAD_DIR}/{name}"


def upload_to_blob(pathname: str, data: bytes, content_type: str, client: httpx.Client | None = None) -> str:
    request = dict(
        params={"pathname": pathname},
        content=data,
        headers={
            "authorization": f"Bearer {settings.BLOB_READ_WRITE_TOKEN}",
            "x-api-version": BLOB_API_VERSION,
            "x-vercel-blob-access": "public",
            "x-content-type": content_type,
            "x-add-random-suffix": "0",
        },
        timeout=30,
    )
    if client is not None:
        response = client.put(BLOB_API_URL, **request)
    else:
        response = httpx.put(BLOB_API_URL, **request)
    response.raise_for_status()
    return response.json()["url"]
