from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from services.store_seo import store_seo_service

router = APIRouter(tags=["Store SEO"])


class StoreSEORequest(BaseModel):
    storeName: str = Field(..., min_length=1, description="Store name")
    description: Optional[str] = Field("", description="Store description")
    industry: Optional[str] = Field("", description="Store industry")
    language: Optional[str] = Field("ar", description="Output language")


class StoreSEOResponse(BaseModel):
    success: bool
    data: dict


@router.post("/api/generate-store-seo", response_model=StoreSEOResponse)
async def generate_store_seo(request: StoreSEORequest):
    result = await store_seo_service.generate_store_seo(
        store_name=request.storeName,
        description=request.description or "",
        industry=request.industry or "",
        language=request.language or "ar",
    )
    return StoreSEOResponse(success=True, data=result)
