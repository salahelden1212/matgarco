import hashlib
import json
import asyncio
import time
from typing import Any

import httpx
from config import settings


class CacheEntry:
    def __init__(self, value: str, ttl: int = 3600):
        self.value = value
        self.expires_at = time.time() + ttl


class CircuitBreaker:
    def __init__(self, failure_threshold: int = 3, recovery_timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = 0
        self.state = "closed"  # closed, open, half-open

    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = "open"

    def record_success(self):
        self.failure_count = 0
        self.state = "closed"

    def allow_request(self) -> bool:
        if self.state == "closed":
            return True
        if self.state == "open":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "half-open"
                return True
            return False
        if self.state == "half-open":
            return True
        return True

    def __repr__(self):
        return f"CircuitBreaker(state={self.state}, failures={self.failure_count})"


class QwenClient:
    _instance = None
    _client: httpx.AsyncClient | None = None
    _cache: dict[str, CacheEntry] = {}
    _cache_hits = 0
    _cache_misses = 0

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.circuit_breaker = CircuitBreaker()
        return cls._instance

    def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=60.0)
        return self._client

    def _cache_key(self, messages: list[dict], model: str | None, max_tokens: int, temperature: float) -> str:
        raw = json.dumps({"messages": messages, "model": model, "max_tokens": max_tokens, "temperature": temperature}, sort_keys=True)
        return hashlib.sha256(raw.encode()).hexdigest()

    def _get_cached(self, key: str) -> str | None:
        entry = self._cache.get(key)
        if entry is None:
            self._cache_misses += 1
            return None
        if time.time() > entry.expires_at:
            del self._cache[key]
            self._cache_misses += 1
            return None
        self._cache_hits += 1
        return entry.value

    def _set_cache(self, key: str, value: str, ttl: int = 3600):
        if len(self._cache) > 500:
            cutoff = time.time()
            self._cache = {k: v for k, v in self._cache.items() if v.expires_at > cutoff}
        self._cache[key] = CacheEntry(value, ttl)

    async def _attempt_request(self, payload: dict, headers: dict) -> str:
        client = self._get_client()
        response = await client.post(settings.LLM_API_URL, json=payload, headers=headers)

        if response.status_code != 200:
            raise Exception(f"LLM API error ({response.status_code}): {response.text}")

        data = response.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        if not content:
            raise Exception("Empty response from LLM API")

        return content.strip()

    async def chat_completion(
        self,
        messages: list[dict],
        model: str | None = None,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        use_cache: bool = True,
        max_retries: int = 2,
    ) -> str:
        cache_key = self._cache_key(messages, model, max_tokens, temperature)

        if use_cache:
            cached = self._get_cached(cache_key)
            if cached is not None:
                return cached

        if not self.circuit_breaker.allow_request():
            fallback = self._generate_fallback(messages)
            return fallback

        payload = {
            "model": model or settings.LLM_MODEL,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        headers = {
            "Authorization": f"Bearer {settings.LLM_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": settings.LLM_REFERER,
            "X-Title": settings.LLM_TITLE,
        }

        last_error = None
        for attempt in range(max_retries + 1):
            try:
                result = await self._attempt_request(payload, headers)
                self.circuit_breaker.record_success()
                if use_cache:
                    self._set_cache(cache_key, result)
                return result
            except Exception as e:
                last_error = e
                if attempt < max_retries:
                    wait = 2 ** attempt
                    await asyncio.sleep(wait)

        self.circuit_breaker.record_failure()
        fallback = self._generate_fallback(messages)
        return fallback

    def _generate_fallback(self, messages: list[dict]) -> str:
        user_msg = next((m["content"] for m in messages if m["role"] == "user"), "")
        sys_msg = next((m["content"] for m in messages if m["role"] == "system"), "")

        if "product" in user_msg.lower() or "منتج" in user_msg:
            lines = user_msg.strip().split("\n")
            name = ""
            for l in lines:
                if "اسم المنتج" in l or "Product Name" in l:
                    name = l.split(":", 1)[-1].strip()
                    break
            if "عربي" in sys_msg or "بالعربية" in sys_msg or "الوصف" in user_msg:
                return f"{name} — منتج عالي الجودة يتميز بتصميم عملي وأداء ممتاز. مناسب للاستخدام اليومي ويجمع بين الأناقة والمتانة. اطلبه الآن واستمتع بتجربة تسوق فريدة."
            return f"{name} — A high-quality product with excellent design and performance. Suitable for daily use, combining style and durability. Order now for a unique shopping experience."

        if "translate" in user_msg.lower() or "ترجم" in user_msg:
            return user_msg[:200]

        return ""

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    @property
    def cache_stats(self) -> dict:
        total = self._cache_hits + self._cache_misses
        return {
            "hits": self._cache_hits,
            "misses": self._cache_misses,
            "size": len(self._cache),
            "hit_rate": round(self._cache_hits / total * 100, 1) if total else 0,
            "circuit_breaker": repr(self.circuit_breaker),
        }


qwen_client = QwenClient()
