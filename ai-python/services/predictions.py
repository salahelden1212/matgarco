import json
from services.qwen_client import qwen_client


class SalesPredictionService:
    @classmethod
    async def predict_sales(
        cls,
        sales_data: list[dict],
        products_data: list[dict],
        language: str = "ar",
    ) -> str:
        sales_json = json.dumps(sales_data[:30], indent=2, ensure_ascii=False)
        products_json = json.dumps(products_data[:20], indent=2, ensure_ascii=False)

        if language == "ar":
            prompt = f"""أنت خبير توقعات مبيعات للتجارة الإلكترونية.

بيانات المبيعات السابقة:
{sales_json}

بيانات المنتجات:
{products_json}

بناءً على هذه البيانات، قدم تحليل يتضمن:

1. **توقعات المبيعات للشهر القادم** — تقدير الإيرادات المتوقعة
2. **المنتجات المتوقع رواجها** — توقع المنتجات الأكثر مبيعاً
3. **المخاطر المحتملة** — أي مؤشرات سلبية تحتاج انتباه
4. **توصيات لتحسين المبيعات** — إجراءات عملية لزيادة الإيرادات
5. **موسمية الطلب** — تحليل مواسم الذروة والركود

اكتب التحليل بالعربية بشكل عملي ومحدد مع أرقام ونسب.
"""
        else:
            prompt = f"""You are an e-commerce sales forecasting expert.

Historical sales data:
{sales_json}

Products data:
{products_json}

Based on this data, provide:

1. **Sales forecast for next month** — Estimated revenue
2. **Products expected to trend** — Best-selling predictions
3. **Potential risks** — Negative indicators
4. **Recommendations** — Actionable steps to boost sales
5. **Seasonal analysis** — Peak and slow seasons

Provide data-driven analysis with specific numbers and percentages.
"""

        messages = [
            {
                "role": "system",
                "content": "You are an e-commerce sales forecasting expert. Provide data-driven predictions with specific numbers.",
            },
            {"role": "user", "content": prompt},
        ]

        return await qwen_client.chat_completion(
            messages=messages,
            max_tokens=1500,
            temperature=0.5,
        )


sales_prediction_service = SalesPredictionService()
