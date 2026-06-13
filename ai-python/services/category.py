from services.qwen_client import qwen_client


class CategoryService:
    @staticmethod
    def _build_prompt(
        product_name: str,
        description: str = "",
        language: str = "ar",
    ) -> str:
        if language == "ar":
            prompt = f"""أنت خبير تصنيف منتجات للتجارة الإلكترونية.

بناءً على اسم المنتج والوصف، اقترح تصنيفات مناسبة:

اسم المنتج: {product_name}
"""
            if description:
                prompt += f"الوصف: {description}\n"

            prompt += """
أرجو إرجاع البيانات بصيغة JSON كالتالي:
{
  "category": "التصنيف الرئيسي المقترح",
  "subcategory": "التصنيف الفرعي المقترح",
  "tags": ["وسم1", "وسم2", "وسم3", "وسم4", "وسم5"],
  "reason": "سبب اختيار هذه التصنيفات"
}

اكتب JSON فقط بدون أي نص إضافي.
"""
        else:
            prompt = f"""You are an e-commerce product categorization expert.

Based on the product name and description, suggest appropriate categories:

Product Name: {product_name}
"""
            if description:
                prompt += f"Description: {description}\n"

            prompt += """
Return the data in JSON format:
{
  "category": "Suggested main category",
  "subcategory": "Suggested subcategory",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "reason": "Reason for choosing these categories"
}

Return only JSON, no additional text.
"""

        return prompt

    @classmethod
    async def suggest_categories(
        cls,
        product_name: str,
        description: str = "",
        language: str = "ar",
    ) -> dict:
        prompt = cls._build_prompt(product_name, description, language)

        messages = [
            {
                "role": "system",
                "content": "You are an e-commerce categorization expert. Always respond with valid JSON only.",
            },
            {"role": "user", "content": prompt},
        ]

        result = await qwen_client.chat_completion(
            messages=messages,
            max_tokens=300,
            temperature=0.3,
        )

        import json

        try:
            return json.loads(result)
        except json.JSONDecodeError:
            return {
                "category": "عام",
                "subcategory": "",
                "tags": [product_name],
                "reason": "تم استخدام التصنيف الافتراضي",
            }


category_service = CategoryService()
