import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI First CRM HCP Module"
    # Using sqlite by default for local dev if Postgres isn't available
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./crm.db")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

    class Config:
        env_file = ".env"

settings = Settings()
