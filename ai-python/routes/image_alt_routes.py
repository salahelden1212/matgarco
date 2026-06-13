from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from services.image_alt import image_alt_text_service

router = APIRouter(prefix="/api", tags=["Image Alt Text"])


class ImageAltRequest(BaseModel):
    productName: str = Field(..., min_length=1)
    imageContext: Optional[str] = Field("")
    language: Optional[str] = Field("ar")


class ImageAltResponse(BaseModel):
    success: bool
    altText: str


@router.post("/generate-alt-text", response_model=ImageAltResponse)
async def generate_alt_text(request: ImageAltRequest):
    try:
        alt_text = await image_alt_text_service.generate_alt_text(
            product_name=request.productName,
            image_context=request.imageContext or "",
            language=request.language or "ar",
        )
        return ImageAltResponse(success=True, altText=alt_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
