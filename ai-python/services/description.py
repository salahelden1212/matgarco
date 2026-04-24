from services.qwen_client import qwen_client


class DescriptionService:
    @staticmethod
    def _build_prompt(
        product_name: str,
        category: str = "general",
        price: float | None = None,
        tags: list[str] | None = None,
        language: str = "ar",
    ) -> str:
        if language == "ar":
            prompt = f"""أنت مساعد ذكي متخصص في كتابة وصف المنتجات للتجارة الإلكترونية.

اكتب وصف احترافي وجذاب للمنتج التالي:

اسم المنتج: {product_name}
الفئة: {category}
"""
            if price is not None:
                prompt += f"السعر: {price} جنيه\n"

            if tags:
                prompt += f"الوسوم: {', '.join(tags)}\n"

            prompt += """
متطلبات الوصف:
- يكون بالعربية الفصحى
- يكون جذاب ومقنع للعملاء
- يبرز مميزات المنتج وفوائده
- يكون مناسب للمتاجر الإلكترونية
- الطول: 3-5 جمل
- لا تستخدم رموز تعبيرية (emojis)
- اكتب الوصف فقط بدون أي نص إضافي أو عناوين
"""
        else:
            prompt = f"""You are an AI assistant specialized in writing e-commerce product descriptions.

Write a professional and compelling description for the following product:

Product Name: {product_name}
Category: {category}
"""
            if price is not None:
                prompt += f"Price: {price}\n"

            if tags:
                prompt += f"Tags: {', '.join(tags)}\n"

            prompt += """
Requirements:
- Be compelling and professional
- Highlight product features and benefits
- Suitable for e-commerce stores
- Length: 3-5 sentences
- Do not use emojis
- Write only the description, no additional text or headings
"""

        return prompt

    @classmethod
    async def generate_product_description(
        cls,
        product_name: str,
        category: str = "general",
        price: float | None = None,
        tags: list[str] | None = None,
        language: str = "ar",
    ) -> str:
        prompt = cls._build_prompt(product_name, category, price, tags, language)

        messages = [
            {
                "role": "system",
                "content": "You are an expert e-commerce copywriter. Always respond with ONLY the requested content, no extra text.",
            },
            {"role": "user", "content": prompt},
        ]

        return await qwen_client.chat_completion(
            messages=messages,
            max_tokens=500,
            temperature=0.7,
        )


description_service = DescriptionService()
