from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn, AnyHttpUrl, field_validator
from typing import Optional

class Settings(BaseSettings):
    # Security
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours

    # Database
    DATABASE_URL: str

    # Resend (email codes for the website's sign-in)
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "PeanutIQ <onboarding@resend.dev>"

    # MinIO / S3
    MINIO_URL: Optional[str] = None
    MINIO_ACCESS_KEY: Optional[str] = None
    MINIO_SECRET_KEY: Optional[str] = None
    AWS_BUCKET_NAME: str = "peanutiq-uploads"

    @field_validator("DATABASE_URL")
    @classmethod
    def use_installed_driver(cls, url: str) -> str:
        # SQLAlchemy 2.1 maps a bare postgresql:// to psycopg 3, which isn't installed;
        # hosting providers also hand out postgres://. Point both at psycopg2.
        for prefix in ("postgres://", "postgresql://"):
            if url.startswith(prefix):
                return "postgresql+psycopg2://" + url[len(prefix):]
        return url

    # Vercel Blob for scan photos. Set automatically when a Blob store is connected
    # to the Vercel project; when empty, photos go to the local uploads/ folder.
    BLOB_READ_WRITE_TOKEN: Optional[str] = None

    # Gemini (assistant, voice, photos, Knowledge Base "Ask AI"). Models are tried in order;
    # Google often answers 503 "high demand", so later ones are fallbacks.
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODELS: str = "gemini-flash-latest,gemini-3.1-flash-lite,gemini-3.8-flash"
    # AI requests per farmer per day (cost protection).
    AI_DAILY_LIMIT: int = 100

    # Set by Vercel on every deployment.
    VERCEL: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

settings = Settings()
