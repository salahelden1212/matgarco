import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")

    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "deepseek/deepseek-chat-v3")
    LLM_API_URL: str = os.getenv(
        "LLM_API_URL",
        "https://openrouter.ai/api/v1/chat/completions",
    )
    LLM_REFERER: str = os.getenv("LLM_REFERER", "http://localhost:5000")
    LLM_TITLE: str = os.getenv("LLM_TITLE", "Matgarco")

    AI_SERVICE_API_KEY: str = os.getenv("AI_SERVICE_API_KEY", "")
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))

    BACKEND_API_URL: str = os.getenv("BACKEND_API_URL", "http://localhost:5000")

    @classmethod
    def validate(cls):
        if not cls.LLM_API_KEY:
            raise ValueError("LLM_API_KEY is required")
        if not cls.LLM_API_KEY.startswith("sk-or-v1"):
            raise ValueError(
                f"Invalid LLM_API_KEY format. Expected 'sk-or-v1...', got '{cls.LLM_API_KEY[:10]}...'"
            )


settings = Settings()
