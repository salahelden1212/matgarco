from fastapi import APIRouter

from models import HealthResponse
from config import settings

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        service="Matgarco AI Service",
        version="1.0.0",
        model=settings.QWEN_MODEL,
    )


@router.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Matgarco AI Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "GET /health",
            "generate-description": "POST /api/generate-description",
            "generate-seo": "POST /api/generate-seo",
            "translate": "POST /api/translate",
            "chat": "POST /api/chat",
            "analytics-insights": "POST /api/analytics/insights",
            "product-recommendations": "POST /api/analytics/product-recommendations",
            "customer-insights": "POST /api/analytics/customer-insights",
            "assistant-chat": "POST /api/assistant/chat",
            "suggest-actions": "POST /api/assistant/suggest-actions",
        },
    }
