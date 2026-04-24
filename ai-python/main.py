from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routes import (
    health_router,
    description_router,
    seo_router,
    translation_router,
    chat_router,
    analytics_router,
    assistant_router,
)


def create_app() -> FastAPI:
    settings.validate()

    app = FastAPI(
        title="Matgarco AI Service",
        description="Scalable AI service powered by Qwen (DashScope)",
        version="1.0.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(description_router)
    app.include_router(seo_router)
    app.include_router(translation_router)
    app.include_router(chat_router)
    app.include_router(analytics_router)
    app.include_router(assistant_router)

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
        log_level=settings.LOG_LEVEL,
    )
