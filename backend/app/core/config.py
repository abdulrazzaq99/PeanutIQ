from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn, AnyHttpUrl
from typing import Optional

class Settings(BaseSettings):
    # Security
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours

    # Database
    DATABASE_URL: str

    # Resend
    RESEND_API_KEY: str
    RESEND_FROM_EMAIL: str = "PeanutIQ <onboarding@resend.dev>"

    # MinIO / S3
    MINIO_URL: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    AWS_BUCKET_NAME: str = "peanutiq-uploads"

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

settings = Settings()
