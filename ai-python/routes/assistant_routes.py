from fastapi import APIRouter, HTTPException

from models import (
    AssistantRequest,
    AssistantResponse,
    ActionSuggestionRequest,
    ActionSuggestionResponse,
)
from services.assistant import assistant_service

router = APIRouter(prefix="/api", tags=["Assistant"])


@router.post("/assistant/chat", response_model=AssistantResponse)
async def assistant_chat(request: AssistantRequest):
    """Chat with the Matgarco AI assistant."""
    try:
        response = await assistant_service.chat(
            message=request.message,
            store_context=request.storeContext,
            conversation_history=request.conversationHistory,
        )

        return AssistantResponse(success=True, response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/assistant/suggest-actions", response_model=ActionSuggestionResponse
)
async def suggest_actions(request: ActionSuggestionRequest):
    """Get AI-suggested actions for the store."""
    try:
        suggestions = await assistant_service.suggest_actions(
            store_context=request.storeContext,
        )

        return ActionSuggestionResponse(success=True, suggestions=suggestions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
