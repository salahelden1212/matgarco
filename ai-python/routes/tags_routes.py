from fastapi import APIRouter
from models import TagsRequest, TagsResponse
from services.tags import tags_service

router = APIRouter(tags=["Tags"])


@router.post("/api/generate-tags", response_model=TagsResponse)
async def generate_tags(request: TagsRequest):
    result = await tags_service.generate_tags(
        product_name=request.productName,
        category=request.category or "",
        features=request.features or [],
        language=request.language or "ar",
    )
    return TagsResponse(success=True, data=result)
