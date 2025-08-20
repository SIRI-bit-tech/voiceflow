from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "VoiceFlow CMS"
    BACKEND_CORS_ORIGINS: str = "*"

    DATABASE_URL: str = "postgresql+asyncpg://vf:vfpass@localhost:5432/voiceflow"
    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET_KEY: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRES_MINUTES: int = 60

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    # Admin configuration
    ADMIN_SECURITY_CODE: str = "ADMIN_SECURE_2024"


settings = Settings()


