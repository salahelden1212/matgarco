from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from middleware import verify_api_key, rate_limit_middleware
from routes import (
    health_router,
    description_router,
    seo_router,
    translation_router,
    chat_router,
    analytics_router,
    assistant_router,
    category_router,
    image_alt_router,
    marketing_router,
    predictions_router,
    tags_router,
    branding_router,
    store_seo_router,
)


def create_app() -> FastAPI:
    settings.validate()

    app = FastAPI(
        title="Matgarco AI Service",
        description="Scalable AI service powered by OpenRouter (DeepSeek / multi-model)",
        version="1.0.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.middleware("http")(rate_limit_middleware)

    app.include_router(health_router)
    app.include_router(description_router, dependencies=[Depends(verify_api_key)])
    app.include_router(seo_router, dependencies=[Depends(verify_api_key)])
    app.include_router(translation_router, dependencies=[Depends(verify_api_key)])
    app.include_router(chat_router, dependencies=[Depends(verify_api_key)])
    app.include_router(analytics_router, dependencies=[Depends(verify_api_key)])
    app.include_router(assistant_router, dependencies=[Depends(verify_api_key)])
    app.include_router(category_router, dependencies=[Depends(verify_api_key)])
    app.include_router(image_alt_router, dependencies=[Depends(verify_api_key)])
    app.include_router(marketing_router, dependencies=[Depends(verify_api_key)])
    app.include_router(predictions_router, dependencies=[Depends(verify_api_key)])
    app.include_router(tags_router, dependencies=[Depends(verify_api_key)])
    app.include_router(branding_router, dependencies=[Depends(verify_api_key)])
    app.include_router(store_seo_router, dependencies=[Depends(verify_api_key)])

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
