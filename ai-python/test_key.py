import httpx
import json

API_KEY = "sk-9388c4e0210a4a7fb4afd05519a5e102"

providers = [
    {
        "name": "DashScope",
        "url": "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
        "model": "qwen-turbo",
    },
    {
        "name": "OpenRouter",
        "url": "https://openrouter.ai/api/v1/chat/completions",
        "model": "qwen/qwen-turbo",
    },
    {
        "name": "Together AI",
        "url": "https://api.together.xyz/v1/chat/completions",
        "model": "Qwen/Qwen2.5-72B-Instruct",
    },
    {
        "name": "Groq",
        "url": "https://api.groq.com/openai/v1/chat/completions",
        "model": "qwen-2.5-32b",
    },
]

payload = {
    "model": None,
    "messages": [{"role": "user", "content": "Say hello"}],
    "max_tokens": 50,
}

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

for provider in providers:
    payload["model"] = provider["model"]
    print(f"\n{'='*50}")
    print(f"Testing: {provider['name']}")
    print(f"URL: {provider['url']}")
    print(f"Model: {provider['model']}")
    print(f"{'='*50}")
    
    try:
        r = httpx.post(provider["url"], headers=headers, json=payload, timeout=15)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text[:300]}")
    except Exception as e:
        print(f"Error: {e}")
