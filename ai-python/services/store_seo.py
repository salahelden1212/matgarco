from services.qwen_client import qwen_client


class StoreSEOService:
    @classmethod
    async def generate_store_seo(
        cls,
        store_name: str,
        description: str = "",
        industry: str = "",
        language: str = "ar",
    ) -> dict:
        lang = "باللغة العربية" if language == "ar" else "in English"

        prompt = f"""أنت خبير SEO للمتاجر الإلكترونية. صمم تحسين محركات بحث كامل للمتجر التالي {lang}:

اسم المتجر: {store_name}
الوصف: {description if description else 'متجر إلكتروني'}
المجال: {industry if industry else 'تجارة إلكترونية'}

المطلوب إنشاء البيانات التالية بصيغة JSON:

1. عنوان SEO (Title) —不超过 60 حرف، يجذب الزوار
2. وصف Meta (Description) —不超过 160 حرف، مقنع للنقر
3. كلمات مفتاحية (5-8 كلمات مناسبة)
4. وصف Open Graph قصير للمشاركة
5. اقتراح رابط canonical

الرد بصيغة JSON فقط:
{{
  "seoTitle": "...",
  "seoDescription": "...",
  "seoKeywords": ["..."],
  "ogDescription": "...",
  "canonicalUrl": "https://...",
  "seoScore": 85,
  "suggestions": ["نصيحة 1", "نصيحة 2"]
}}"""

        messages = [
            {
                "role": "system",
                "content": "You are a senior SEO consultant for e-commerce stores. Generate optimized SEO metadata. Return only valid JSON.",
            },
            {"role": "user", "content": prompt},
        ]

        result = await qwen_client.chat_completion(
            messages=messages,
            max_tokens=600,
            temperature=0.3,
        )

        import json

        try:
            return json.loads(result)
        except json.JSONDecodeError:
            return {
                "seoTitle": f"{store_name} | تسوق أونلاين",
                "seoDescription": description[:157] + "..." if len(description) > 160 else description or f"تسوق من {store_name} - أفضل المنتجات والعروض",
                "seoKeywords": [store_name, "تسوق", "أونلاين", "متجر", "منتجات"],
                "ogDescription": description[:150] if description else f"اكتشف {store_name}",
                "canonicalUrl": "",
                "seoScore": 70,
                "suggestions": ["أضف وصفاً أفضل للمتجر", "حسن الكلمات المفتاحية"],
            }


store_seo_service = StoreSEOService()
