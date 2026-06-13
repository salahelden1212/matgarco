from services.qwen_client import qwen_client


class ImageAltTextService:
    @classmethod
    async def generate_alt_text(
        cls,
        product_name: str,
        image_context: str = "",
        language: str = "ar",
    ) -> str:
        if language == "ar":
            prompt = f"""أنت خبير كتابة نصوص بديلة للصور (Alt Text) لتحسين SEO المتاجر الإلكترونية.

اسم المنتج: {product_name}
"""
            if image_context:
                prompt += f"سياق الصورة: {image_context}\n"

            prompt += """
اكتب نص بديل مناسب للصورة (Alt Text) يكون:
- وصفي ودقيق
- محسن لمحركات البحث
- مناسب لضعاف البصر
- طوله 5-15 كلمة
- باللغة العربية

اكتب النص البديل فقط بدون أي نص إضافي.
"""
        else:
            prompt = f"""You are an expert in writing image alt text for e-commerce SEO.

Product Name: {product_name}
"""
            if image_context:
                prompt += f"Image context: {image_context}\n"

            prompt += """
Write a suitable alt text for the image that is:
- Descriptive and accurate
- SEO-optimized
- Accessible for visually impaired
- 5-15 words long

Return only the alt text, no additional text.
"""

        messages = [
            {
                "role": "system",
                "content": "You are an SEO and accessibility expert. Return only the alt text.",
            },
            {"role": "user", "content": prompt},
        ]

        return await qwen_client.chat_completion(
            messages=messages,
            max_tokens=100,
            temperature=0.3,
        )


image_alt_text_service = ImageAltTextService()
