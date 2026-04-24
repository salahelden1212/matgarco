from fastapi import APIRouter, HTTPException

from models import (
    AnalyticsInsightsRequest,
    AnalyticsInsightsResponse,
    ProductRecommendationsRequest,
    ProductRecommendationsResponse,
    CustomerInsightsRequest,
    CustomerInsightsResponse,
)
from services.analytics import analytics_insights_service

router = APIRouter(prefix="/api", tags=["Analytics"])


@router.post("/analytics/insights", response_model=AnalyticsInsightsResponse)
async def generate_analytics_insights(request: AnalyticsInsightsRequest):
    """Generate AI insights from store analytics data."""
    try:
        insights = await analytics_insights_service.generate_insights(
            analytics_data=request.analyticsData,
            question=request.question,
            language=request.language,
        )

        return AnalyticsInsightsResponse(success=True, insights=insights)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/analytics/product-recommendations",
    response_model=ProductRecommendationsResponse,
)
async def generate_product_recommendations(request: ProductRecommendationsRequest):
    """Generate product management recommendations."""
    try:
        recommendations = await analytics_insights_service.generate_product_recommendations(
            products_data=request.products,
            orders_data=request.orders,
        )

        return ProductRecommendationsResponse(
            success=True, recommendations=recommendations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analytics/customer-insights", response_model=CustomerInsightsResponse)
async def generate_customer_insights(request: CustomerInsightsRequest):
    """Generate customer behavior insights."""
    try:
        insights = await analytics_insights_service.generate_customer_insights(
            customers_data=request.customers,
            orders_data=request.orders,
        )

        return CustomerInsightsResponse(success=True, insights=insights)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
