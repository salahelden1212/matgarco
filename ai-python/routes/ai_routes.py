from fastapi import APIRouter, HTTPException

from models import DescriptionRequest, DescriptionResponse
from services.description import description_service

router = APIRouter(prefix="/api", tags=["Description"])


@router.post("/generate-description", response_model=DescriptionResponse)
async def generate_description(request: DescriptionRequest):
    """Generate product description using AI."""
    try:
        description = await description_service.generate_product_description(
            product_name=request.productName,
            category=request.category,
            price=request.price,
            tags=request.tags,
            language=request.language,
        )

        return DescriptionResponse(
            success=True,
            description=description,
            language=request.language or "ar",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
