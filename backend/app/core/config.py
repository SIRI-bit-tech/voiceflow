from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "VoiceFlow CMS"
    BACKEND_CORS_ORIGINS: str = "*"

    DATABASE_URL: str = "postgresql+asyncpg://postgres.tbxoqrvcjdlnwaucujnp:emuesiri%%4012@aws-1-us-east-2.pooler.supabase.com:6543/postgres"
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


# Provide lowercase attribute aliases for convenience/consistency
# This avoids AttributeError when code accesses settings.foo_bar
def _add_lowercase_aliases() -> None:
    setattr(Settings, 'app_name', property(lambda s: s.APP_NAME))
    setattr(Settings, 'backend_cors_origins', property(lambda s: s.BACKEND_CORS_ORIGINS))
    setattr(Settings, 'database_url', property(lambda s: s.DATABASE_URL))
    setattr(Settings, 'redis_url', property(lambda s: s.REDIS_URL))
    setattr(Settings, 'jwt_secret_key', property(lambda s: s.JWT_SECRET_KEY))
    setattr(Settings, 'jwt_algorithm', property(lambda s: s.JWT_ALGORITHM))
    setattr(Settings, 'jwt_access_token_expires_minutes', property(lambda s: s.JWT_ACCESS_TOKEN_EXPIRES_MINUTES))
    setattr(Settings, 'cloudinary_cloud_name', property(lambda s: s.CLOUDINARY_CLOUD_NAME))
    setattr(Settings, 'cloudinary_api_key', property(lambda s: s.CLOUDINARY_API_KEY))
    setattr(Settings, 'cloudinary_api_secret', property(lambda s: s.CLOUDINARY_API_SECRET))
    setattr(Settings, 'admin_security_code', property(lambda s: s.ADMIN_SECURITY_CODE))


_add_lowercase_aliases()

