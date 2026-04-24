from services.qwen_client import qwen_client


class SEOService:
    @staticmethod
    def _build_prompt(
        product_name: str,
        description: str = "",
        category: str = "general",
        language: str = "ar",
    ) -> str:
        if language == "ar":
            prompt = f"""أنت خبير SEO متخصص في المتاجر الإلكترونية.

قم بإنشاء عناصر SEO للمنتج التالي:

اسم المنتج: {product_name}
الفئة: {category}
"""
            if description:
                prompt += f"الوصف: {description}\n"

            prompt += """
أرجو إرجاع البيانات بصيغة JSON كالتالي:
{
  "seoTitle": "عنوان SEO (60 حرف كحد أقصى)",
  "seoDescription": "وصف SEO (160 حرف كحد أقصى)",
  "seoKeywords": ["كلمة1", "كلمة2", "كلمة3", "كلمة4", "كلمة5"],
  "slug": "product-url-slug"
}

اكتب JSON فقط بدون أي نص إضافي.
"""
        else:
            prompt = f"""You are an SEO expert specializing in e-commerce.

Create SEO elements for the following product:

Product Name: {product_name}
Category: {category}
"""
            if description:
                prompt += f"Description: {description}\n"

            prompt += """
Return the data in JSON format:
{
  "seoTitle": "SEO Title (max 60 chars)",
  "seoDescription": "SEO Description (max 160 chars)",
  "seoKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "slug": "product-url-slug"
}

Return only JSON, no additional text.
"""

        return prompt

    @classmethod
    async def generate_seo(
        cls,
        product_name: str,
        description: str = "",
        category: str = "general",
        language: str = "ar",
    ) -> dict:
        prompt = cls._build_prompt(product_name, description, category, language)

        messages = [
            {
                "role": "system",
                "content": "You are an SEO expert. Always respond with valid JSON only.",
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
                "seoTitle": product_name,
                "seoDescription": description[:160] if description else product_name,
                "seoKeywords": [product_name, category],
                "slug": product_name.lower().replace(" ", "-"),
            }


seo_service = SEOService()
