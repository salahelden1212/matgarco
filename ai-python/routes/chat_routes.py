from fastapi import APIRouter, HTTPException

from models import ChatRequest, ChatResponse
from services.chat import chat_service

router = APIRouter(prefix="/api", tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """General AI chat completion."""
    try:
        response = await chat_service.chat_completion(
            prompt=request.prompt,
            system_prompt=request.systemPrompt,
            max_tokens=request.maxTokens,
            temperature=request.temperature,
        )

        return ChatResponse(success=True, response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
