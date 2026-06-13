from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from services.marketing import marketing_service

router = APIRouter(prefix="/api", tags=["Marketing"])


class MarketingRequest(BaseModel):
    productName: str = Field(..., min_length=1)
    description: Optional[str] = Field("")
    audience: Optional[str] = Field("")
    language: Optional[str] = Field("ar")


class MarketingResponse(BaseModel):
    success: bool
    marketingCopy: str


@router.post("/generate-marketing-copy", response_model=MarketingResponse)
async def generate_marketing_copy(request: MarketingRequest):
    try:
        copy = await marketing_service.generate_marketing_copy(
            product_name=request.productName,
            description=request.description or "",
            audience=request.audience or "",
            language=request.language or "ar",
        )
        return MarketingResponse(success=True, marketingCopy=copy)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
