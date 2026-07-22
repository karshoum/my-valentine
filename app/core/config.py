from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Wakalat Baradis Platform"
    ENVIRONMENT: str = "development"

    DATABASE_URL: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12

    # Private file storage (passports, bankak receipts, ...).
    LOCAL_STORAGE_PATH: str = "storage/private"
    SIGNED_URL_SECRET: str
    SIGNED_URL_EXPIRE_SECONDS: int = 600

    CORS_ORIGINS: list[str] = ["*"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
