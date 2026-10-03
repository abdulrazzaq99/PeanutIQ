# PeanutIQ Backend

FastAPI + PostgreSQL. Serves the website and the mobile app. Deploys to Vercel; runs locally with uvicorn.

## Deploy to Vercel

1. **New project:** in Vercel, import the GitHub repo and set **Root Directory** to `backend`.
   Framework preset: **Other**. `vercel.json` sends every request to `api/index.py` (FastAPI).
2. **Database:** in the project's **Storage** tab, add **Neon** (Postgres). It sets `DATABASE_URL`.
   Use the *pooled* connection string if asked.
3. **Photo storage:** in **Storage**, create a **Blob** store (public) and connect it to the
   project. It sets `BLOB_READ_WRITE_TOKEN`; scan photos are then saved there.
4. **Environment variables** (Settings → Environment Variables):

   | Name | Value |
   |---|---|
   | `JWT_SECRET` | a long random string (`python3 -c "import secrets; print(secrets.token_urlsafe(48))"`) |
   | `RESEND_API_KEY` | only needed for the website's email-code sign-in |
   | `RESEND_FROM_EMAIL` | optional, e.g. `PeanutIQ <noreply@yourdomain.com>` |

5. **Create the tables** from your computer, against the Neon database (repeat after any new migration):

   ```bash
   cd backend
   pip install -r requirements.txt
   DATABASE_URL="<the Neon connection string>" JWT_SECRET=x alembic upgrade head
   ```

6. **Deploy** (push to GitHub, or `vercel --prod` from `backend/`). Check `https://<project>.vercel.app/health`.

The mobile app then uses `https://<project>.vercel.app/api/v1`:

```bash
flutter build apk --release --dart-define=API_URL=https://<project>.vercel.app/api/v1
```

Vercel limits request bodies to 4.5 MB; the app resizes scan photos to about 1 MB before upload.

## Run locally

```bash
cd backend
docker compose up -d                 # Postgres on port 5433 (and MinIO)
cp .env.example .env                 # set DATABASE_URL to port 5433, JWT_SECRET
pip install -r requirements-dev.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

`--host 0.0.0.0` lets phones on the same Wi-Fi reach it at `http://<this computer's IP>:8000/api/v1`
(Android emulator: `http://10.0.2.2:8000/api/v1`). Without `BLOB_READ_WRITE_TOKEN`, scan photos are
saved in `uploads/` and served at `/uploads`.

## AI scans

- **Disease scan:** PeanutIQ's own trained model (`app/ml/disease.onnx`, see `ml/README.md`) detects the
  problem; Gemini writes the explanation and advice and screens out photos that aren't crops. If the model
  is under 50% sure, Gemini diagnoses instead; if Gemini is busy, built-in advice is used.
  `GET /api/v1/scans/disease-model` returns the model's classes and accuracy.
- **Seed scan:** Gemini counts the seeds by condition; grade and percentages are computed by fixed rules.

## Make a user an admin or researcher

```bash
DATABASE_URL="<database>" JWT_SECRET=x python promote_user.py someone@example.com admin
```

## Tests

```bash
pip install -r requirements-dev.txt
pytest
```

## Auth endpoints

| Endpoint | Used by | Notes |
|---|---|---|
| `POST /auth/request-otp`, `POST /auth/verify-otp` | website | email code |
| `POST /auth/register` | mobile app | `{name, identifier, password (8+), farm_location, language_preference}` → user (does not sign in) |
| `POST /auth/login` | mobile app | `{identifier, password}` → `{access_token, token_type, user}` |
