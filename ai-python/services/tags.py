from services.qwen_client import qwen_client


class TagsService:
    @classmethod
    async def generate_tags(
        cls,
        product_name: str,
        category: str = "",
        features: list[str] | None = None,
        language: str = "ar",
    ) -> dict:
        lang_instruction = "باللغة العربية" if language == "ar" else "in English"
        features_text = "، ".join(features) if features else "غير محدد"

        prompt = f"""اقترح tags/كلمات مفتاحية للمنتج التالي {lang_instruction}:

اسم المنتج: {product_name}
التصنيف: {category}
المميزات: {features_text}

المطلوب:
1. 5-8 tags قصيرة ومركزة
2. 3-5 كلمات مفتاحية للبحث (SEO)
3. تصنيف المنتج في 3 فئات عامة مناسبة

الرد بصيغة JSON فقط:
{{"tags": [...], "seo_keywords": [...], "categories": [...]}}"""

        messages = [
            {
                "role": "system",
                "content": "You are an e-commerce SEO and tagging expert. Suggest relevant tags, keywords, and categories. Return only valid JSON.",
            },
            {"role": "user", "content": prompt},
        ]

        result = await qwen_client.chat_completion(
            messages=messages,
            max_tokens=500,
            temperature=0.4,
        )

        import json

        try:
            data = json.loads(result)
            return {
                "tags": data.get("tags", []),
                "seo_keywords": data.get("seo_keywords", data.get("seoKeywords", [])),
                "categories": data.get("categories", []),
            }
        except json.JSONDecodeError:
            return {
                "tags": [product_name, category] if category else [product_name],
                "seo_keywords": [product_name, category] if category else [product_name],
                "categories": [category] if category else [],
            }


tags_service = TagsService()
