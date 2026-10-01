#!/bin/sh
set -e

# Bring the database schema up to date, then serve the API.
alembic upgrade head

# --proxy-headers: behind a reverse proxy (HTTPS when deployed), links use the public address.
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port "${PORT:-8000}" \
    --proxy-headers \
    --forwarded-allow-ips "${FORWARDED_ALLOW_IPS:-*}"
