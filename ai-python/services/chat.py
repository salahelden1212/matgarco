from services.qwen_client import qwen_client


class ChatService:
    @classmethod
    async def chat_completion(
        cls,
        prompt: str,
        system_prompt: str = "You are a helpful assistant.",
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> str:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ]

        return await qwen_client.chat_completion(
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )

    @classmethod
    async def chat_with_history(
        cls,
        messages: list[dict],
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> str:
        return await qwen_client.chat_completion(
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )


chat_service = ChatService()
