from pydantic import BaseModel, Field
from typing import Optional


class DescriptionRequest(BaseModel):
    productName: str = Field(..., min_length=1, description="Product name")
    category: Optional[str] = Field("general", description="Product category")
    price: Optional[float] = Field(None, description="Product price")
    tags: Optional[list[str]] = Field(default_factory=list, description="Product tags")
    language: Optional[str] = Field("ar", description="Output language (ar/en)")


class DescriptionResponse(BaseModel):
    success: bool
    description: str
    language: str


class SEORequest(BaseModel):
    productName: str = Field(..., min_length=1, description="Product name")
    description: Optional[str] = Field("", description="Product description")
    category: Optional[str] = Field("general", description="Product category")
    language: Optional[str] = Field("ar", description="Output language (ar/en)")


class SEOData(BaseModel):
    seoTitle: str
    seoDescription: str
    seoKeywords: list[str]
    slug: str


class SEOResponse(BaseModel):
    success: bool
    data: SEOData


class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to translate")
    sourceLang: Optional[str] = Field("en", description="Source language code")
    targetLang: Optional[str] = Field("ar", description="Target language code")


class TranslationResponse(BaseModel):
    success: bool
    translatedText: str
    sourceLang: str
    targetLang: str


class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="User prompt")
    systemPrompt: Optional[str] = Field(
        "You are a helpful assistant.", description="System prompt"
    )
    maxTokens: Optional[int] = Field(1000, description="Max tokens")
    temperature: Optional[float] = Field(0.7, description="Temperature")


class ChatResponse(BaseModel):
    success: bool
    response: str


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    model: str


class AnalyticsInsightsRequest(BaseModel):
    analyticsData: dict = Field(..., description="Store analytics data")
    question: Optional[str] = Field("", description="Specific question about the data")
    language: Optional[str] = Field("ar", description="Output language")


class AnalyticsInsightsResponse(BaseModel):
    success: bool
    insights: str


class ProductRecommendationsRequest(BaseModel):
    products: list[dict] = Field(..., description="Products data")
    orders: list[dict] = Field(..., description="Orders data")


class ProductRecommendationsResponse(BaseModel):
    success: bool
    recommendations: str


class CustomerInsightsRequest(BaseModel):
    customers: list[dict] = Field(..., description="Customers data")
    orders: list[dict] = Field(..., description="Orders data")


class CustomerInsightsResponse(BaseModel):
    success: bool
    insights: str


class AssistantRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User message")
    storeContext: Optional[dict] = Field(None, description="Store context")
    conversationHistory: Optional[list[dict]] = Field(
        None, description="Conversation history"
    )


class AssistantResponse(BaseModel):
    success: bool
    response: str


class ActionSuggestionRequest(BaseModel):
    storeContext: dict = Field(..., description="Store context")


class ActionSuggestion(BaseModel):
    action: str
    reason: str
    priority: str
    link: str


class ActionSuggestionResponse(BaseModel):
    success: bool
    suggestions: list[ActionSuggestion]
