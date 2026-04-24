from fastapi import APIRouter, HTTPException

from models import SEORequest, SEOResponse
from services.seo import seo_service

router = APIRouter(prefix="/api", tags=["SEO"])


@router.post("/generate-seo", response_model=SEOResponse)
async def generate_seo(request: SEORequest):
    """Generate SEO metadata for a product."""
    try:
        seo_data = await seo_service.generate_seo(
            product_name=request.productName,
            description=request.description,
            category=request.category,
            language=request.language,
        )

        return SEOResponse(success=True, data=seo_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
