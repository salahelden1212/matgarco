from fastapi import APIRouter
from models import BrandingRequest, BrandingResponse
from services.branding import branding_service

router = APIRouter(tags=["Branding"])


@router.post("/api/suggest-branding", response_model=BrandingResponse)
async def suggest_branding(request: BrandingRequest):
    result = await branding_service.suggest_branding(
        business_name=request.businessName,
        business_type=request.businessType or "",
        industry=request.industry or "",
        description=request.description or "",
        language=request.language or "ar",
    )
    return BrandingResponse(success=True, data=result)
