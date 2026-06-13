from services.qwen_client import qwen_client


class BrandingService:
    @classmethod
    async def suggest_branding(
        cls,
        business_name: str,
        business_type: str = "",
        industry: str = "",
        description: str = "",
        language: str = "ar",
    ) -> dict:
        lang_instruction = "باللغة العربية" if language == "ar" else "in English"

        prompt = f"""أنت خبير هوية بصرية وبراندينج. اقترح هوية متكاملة للمتجر التالي {lang_instruction}:

اسم المتجر: {business_name}
نوع النشاط: {business_type} ({industry if industry else business_type})
الوصف: {description if description else "غير محدد"}

المطلوب اقتراح هوية متكاملة:
1. **الألوان**: لوحة ألوان مناسبة (primary, secondary, accent, background, text)
2. **الخطوط**: اقتراح نوع خط مناسب للعناوين والنصوص
3. **الأسلوب البصري**: وصف قصير للهوية البصرية (حديث/كلاسيك/فاخر/بسيط...)
4. **نبرة العلامة**: كيف يتكلم المتجر مع عملائه (رسمي/ودود/شبابي/فاخر...)
5. **شعار**: وصف مقترح للشعار

الرد بصيغة JSON فقط:
{{
  "colors": {{"primary": "#...", "secondary": "#...", "accent": "#...", "background": "#...", "text": "#..."}},
  "fonts": {{"headings": "...", "body": "..."}},
  "visual_style": "...",
  "brand_voice": "...",
  "logo_description": "..."
}}"""

        messages = [
            {
                "role": "system",
                "content": "You are a professional branding expert and visual identity designer. Suggest complete brand identity based on business info. Return only valid JSON.",
            },
            {"role": "user", "content": prompt},
        ]

        result = await qwen_client.chat_completion(
            messages=messages,
            max_tokens=800,
            temperature=0.6,
        )

        import json

        try:
            data = json.loads(result)
            return {
                "colors": data.get("colors", {}),
                "fonts": data.get("fonts", {}),
                "visual_style": data.get("visual_style", data.get("visualStyle", "")),
                "brand_voice": data.get("brand_voice", data.get("brandVoice", "")),
                "logo_description": data.get("logo_description", data.get("logoDescription", "")),
            }
        except json.JSONDecodeError:
            return {
                "colors": {"primary": "#6366F1", "secondary": "#8B5CF6", "accent": "#10B981", "background": "#FFFFFF", "text": "#111827"},
                "fonts": {"headings": "Cairo", "body": "Cairo"},
                "visual_style": "حديث ونظيف",
                "brand_voice": "ودود ومحترف",
                "logo_description": "شعار بسيط يجمع بين اسم المتجر وأيقونة تعبر عن المجال",
            }


branding_service = BrandingService()
