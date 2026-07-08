from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Global configuration settings loaded from environment variables or .env file.
    """
    ENV: str = "development"
    INTERNAL_GATEWAY_SECRET: str = "my-super-secret-internal-key-for-ai-worker"
    GROQ_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
