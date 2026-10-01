from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from app.core.config import settings

# Serverless functions on Vercel are frozen between requests, so pooled connections go stale:
# open one per request there (use the database's pooled connection string).
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    **({"poolclass": NullPool} if settings.VERCEL else {}),
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
