import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")

    QWEN_API_KEY: str = os.getenv("QWEN_API_KEY", "")
    QWEN_MODEL: str = os.getenv("QWEN_MODEL", "qwen-turbo")
    QWEN_API_URL: str = os.getenv(
        "QWEN_API_URL",
        "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    )

    BACKEND_API_URL: str = os.getenv("BACKEND_API_URL", "http://localhost:5000")

    @classmethod
    def validate(cls):
        if not cls.QWEN_API_KEY:
            raise ValueError("QWEN_API_KEY is required")
        if not cls.QWEN_API_KEY.startswith("sk-"):
            raise ValueError(
                f"Invalid QWEN_API_KEY format. Expected 'sk-...', got '{cls.QWEN_API_KEY[:10]}...'"
            )


settings = Settings()
