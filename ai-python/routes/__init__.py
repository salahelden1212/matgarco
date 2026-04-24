from routes.health import router as health_router
from routes.ai_routes import router as description_router
from routes.seo_routes import router as seo_router
from routes.translation_routes import router as translation_router
from routes.chat_routes import router as chat_router
from routes.analytics_routes import router as analytics_router
from routes.assistant_routes import router as assistant_router

__all__ = [
    "health_router",
    "description_router",
    "seo_router",
    "translation_router",
    "chat_router",
    "analytics_router",
    "assistant_router",
]
