import httpx
from config import settings


class QwenClient:
    _instance = None
    _client: httpx.AsyncClient | None = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=60.0)
        return self._client

    async def chat_completion(
        self,
        messages: list[dict],
        model: str | None = None,
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> str:
        client = self._get_client()

        payload = {
            "model": model or settings.QWEN_MODEL,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        headers = {
            "Authorization": f"Bearer {settings.QWEN_API_KEY}",
            "Content-Type": "application/json",
        }

        response = await client.post(
            settings.QWEN_API_URL,
            json=payload,
            headers=headers,
        )

        if response.status_code != 200:
            error_body = response.text
            raise Exception(
                f"Qwen API error ({response.status_code}): {error_body}"
            )

        data = response.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")

        if not content:
            raise Exception("Empty response from Qwen API")

        return content.strip()

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()


qwen_client = QwenClient()
