from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from services.category import category_service

router = APIRouter(prefix="/api", tags=["Category"])


class CategoryRequest(BaseModel):
    productName: str = Field(..., min_length=1, description="Product name")
    description: Optional[str] = Field("", description="Product description")
    language: Optional[str] = Field("ar", description="Output language (ar/en)")


class CategoryResponse(BaseModel):
    success: bool
    data: dict


@router.post("/suggest-categories", response_model=CategoryResponse)
async def suggest_categories(request: CategoryRequest):
    """Suggest product categories using AI."""
    try:
        suggestions = await category_service.suggest_categories(
            product_name=request.productName,
            description=request.description or "",
            language=request.language or "ar",
        )

        return CategoryResponse(success=True, data=suggestions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
