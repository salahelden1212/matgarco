from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from services.predictions import sales_prediction_service

router = APIRouter(prefix="/api", tags=["Sales Predictions"])


class PredictionRequest(BaseModel):
    salesData: list[dict] = Field(default_factory=list)
    productsData: list[dict] = Field(default_factory=list)
    language: Optional[str] = Field("ar")


class PredictionResponse(BaseModel):
    success: bool
    predictions: str


@router.post("/predict-sales", response_model=PredictionResponse)
async def predict_sales(request: PredictionRequest):
    try:
        predictions = await sales_prediction_service.predict_sales(
            sales_data=request.salesData,
            products_data=request.productsData,
            language=request.language or "ar",
        )
        return PredictionResponse(success=True, predictions=predictions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
