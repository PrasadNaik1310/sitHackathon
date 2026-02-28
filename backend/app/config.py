from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/gst_credit_db"
    SYNC_DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/gst_credit_db"

    # JWT
    SECRET_KEY: str = "super-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Government API
    GOV_API_BASE_URL: str = "https://gov-api-backend-production.up.railway.app"
    GOV_API_EMAIL: str = "mayankbajaj773@gmail.com"
    GOV_API_PASSWORD: str = "Mayank@1904"
    GOV_API_TIMEOUT: int = 10
    GOV_CACHE_TTL_SECONDS: int = 3600

    # Credit Scoring Weights
    EXTERNAL_SCORE_WEIGHT: float = 0.6
    INTERNAL_SCORE_WEIGHT: float = 0.4

    # Exposure Caps (in INR)
    PER_USER_EXPOSURE_CAP: float = 10_000_000.0
    PER_GST_EXPOSURE_CAP: float = 25_000_000.0
    PORTFOLIO_CAP: float = 500_000_000.0

    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 10
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    # App
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
