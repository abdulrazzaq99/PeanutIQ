# PeanutIQ Backend

FastAPI + PostgreSQL + MinIO, run with Docker. Serves the website and the mobile app.

## Run

```bash
cd backend
cp .env.example .env      # optional: set JWT_SECRET, RESEND_API_KEY, passwords
docker compose up -d --build
```

- The API is at `http://<this machine's IP>:8000/api/v1` for every device on the network.
  The Android emulator reaches it at `http://10.0.2.2:8000/api/v1`. Health check: `/health`.
- The database schema is migrated automatically each time the API container starts.
- Scan photos are kept in the `uploads_data` volume; the database is in `postgres_data`.
- Logs: `docker compose logs -f api`. Stop: `docker compose down` (add `-v` to wipe all data).

Without a `.env`, development defaults are used. Only the website's email-code sign-in needs a
real `RESEND_API_KEY`; the app's password sign-in works without one.

## Make a user an admin or researcher

```bash
docker compose exec api python promote_user.py someone@example.com admin
```

## Deploy

The `api` image runs anywhere Docker does. On a server:
- set a long random `JWT_SECRET` and new database and MinIO passwords in `.env`;
- put it behind a reverse proxy with HTTPS (Caddy, Nginx, or the host's load balancer).
  The API trusts the proxy's forwarded headers, so photo links use the public `https://` address;
- or point `DATABASE_URL` at a managed Postgres and run just the `api` service.

## Tests

```bash
pip install -r requirements.txt
pytest
```

## Auth endpoints

| Endpoint | Used by | Notes |
|---|---|---|
| `POST /auth/request-otp`, `POST /auth/verify-otp` | website | email code |
| `POST /auth/register` | mobile app | `{name, identifier, password (8+), farm_location, language_preference}` → user (does not sign in) |
| `POST /auth/login` | mobile app | `{identifier, password}` → `{access_token, token_type, user}` |
