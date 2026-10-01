FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY alembic.ini promote_user.py docker-entrypoint.sh ./
COPY alembic ./alembic
COPY app ./app

# Run as a normal user; uploaded scan photos live in /app/uploads (a volume in compose).
RUN useradd --create-home --uid 1000 peanutiq \
    && mkdir -p /app/uploads \
    && chown -R peanutiq:peanutiq /app \
    && chmod +x docker-entrypoint.sh
USER peanutiq

EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')" || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
