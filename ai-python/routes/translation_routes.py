from fastapi import APIRouter, HTTPException

from models import TranslationRequest, TranslationResponse
from services.translation import translation_service

router = APIRouter(prefix="/api", tags=["Translation"])


@router.post("/translate", response_model=TranslationResponse)
async def translate(request: TranslationRequest):
    """Translate text between languages."""
    try:
        translated = await translation_service.translate(
            text=request.text,
            source_lang=request.sourceLang,
            target_lang=request.targetLang,
        )

        return TranslationResponse(
            success=True,
            translatedText=translated,
            sourceLang=request.sourceLang,
            targetLang=request.targetLang,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
