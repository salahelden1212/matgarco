from services.qwen_client import qwen_client


class MarketingService:
    @classmethod
    async def generate_marketing_copy(
        cls,
        product_name: str,
        description: str = "",
        audience: str = "",
        language: str = "ar",
    ) -> str:
        if language == "ar":
            prompt = f"""أنت خبير تسويق إلكتروني ومتخصص في كتابة المحتوى التسويقي للمنتجات.

اسم المنتج: {product_name}
"""
            if description:
                prompt += f"الوصف: {description}\n"
            if audience:
                prompt += f"الجمهور المستهدف: {audience}\n"

            prompt += """
اكتب محتوى تسويقي جذاب للمنتج يتضمن:

1. **شعار إعلاني** (Slogan) — جملة قصيرة جذابة (أقل من 10 كلمات)
2. **وصف تسويقي** — فقرة قصيرة مقنعة (3-4 جمل)
3. **نقاط البيع الرئيسية** — 3-5 نقاط تبرز مميزات المنتج
4. **دعوة لاتخاذ إجراء** (CTA) — عبارة تحفيزية للشراء

اكتب المحتوى بالعربية الفصحى بشكل احترافي. لا تستخدم رموز تعبيرية.
"""
        else:
            prompt = f"""You are an expert e-commerce marketing copywriter.

Product Name: {product_name}
"""
            if description:
                prompt += f"Description: {description}\n"
            if audience:
                prompt += f"Target audience: {audience}\n"

            prompt += """
Write compelling marketing copy including:

1. **Slogan** — Short catchy phrase (under 10 words)
2. **Marketing Description** — Persuasive paragraph (3-4 sentences)
3. **Key Selling Points** — 3-5 bullet points
4. **Call to Action** (CTA) — Motivational purchase prompt

Write professionally. Do not use emojis.
"""

        messages = [
            {
                "role": "system",
                "content": "You are an expert e-commerce marketing copywriter. Write compelling, conversion-focused copy.",
            },
            {"role": "user", "content": prompt},
        ]

        return await qwen_client.chat_completion(
            messages=messages,
            max_tokens=800,
            temperature=0.7,
        )


marketing_service = MarketingService()
