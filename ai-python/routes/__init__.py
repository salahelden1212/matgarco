from routes.health import router as health_router
from routes.ai_routes import router as description_router
from routes.seo_routes import router as seo_router
from routes.translation_routes import router as translation_router
from routes.chat_routes import router as chat_router
from routes.analytics_routes import router as analytics_router
from routes.assistant_routes import router as assistant_router
from routes.category_routes import router as category_router
from routes.image_alt_routes import router as image_alt_router
from routes.marketing_routes import router as marketing_router
from routes.predictions_routes import router as predictions_router
from routes.tags_routes import router as tags_router
from routes.branding_routes import router as branding_router
from routes.store_seo_routes import router as store_seo_router

__all__ = [
    "health_router",
    "description_router",
    "seo_router",
    "translation_router",
    "chat_router",
    "analytics_router",
    "assistant_router",
    "category_router",
    "image_alt_router",
    "marketing_router",
    "predictions_router",
    "tags_router",
    "branding_router",
    "store_seo_router",
]
