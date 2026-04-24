from services.qwen_client import qwen_client


class TranslationService:
    @classmethod
    async def translate(
        cls,
        text: str,
        source_lang: str = "en",
        target_lang: str = "ar",
    ) -> str:
        lang_names = {
            "ar": "العربية",
            "en": "English",
            "fr": "Français",
            "de": "Deutsch",
            "es": "Español",
            "zh": "中文",
        }

        source_name = lang_names.get(source_lang, source_lang)
        target_name = lang_names.get(target_lang, target_lang)

        prompt = f"""Translate the following text from {source_name} to {target_name}.

Text to translate:
{text}

Return only the translated text, no additional explanation."""

        messages = [
            {
                "role": "system",
                "content": f"You are a professional translator. Translate from {source_name} to {target_name}. Return only the translation.",
            },
            {"role": "user", "content": prompt},
        ]

        return await qwen_client.chat_completion(
            messages=messages,
            max_tokens=2000,
            temperature=0.3,
        )


translation_service = TranslationService()
