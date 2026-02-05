from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Get the directory where this config.py file is located
_ENV_FILE = Path(__file__).parent / ".env"

class Settings(BaseSettings):
    database_hostname: str = "localhost"
    database_port: str = "5432"
    database_password: str
    database_name: str
    database_username: str

    secret_key: str
    algorithm: str
    access_token_expire_minutes: int

    gemini_api_key: str | None = None
    tavily_api_key: str | None = None
    groq_api_key: str | None = None
    mongodb_uri: str = "mongodb://localhost:27017/ai_hospital"

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="forbid"
    )


settings = Settings()
