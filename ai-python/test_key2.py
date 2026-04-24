import httpx

API_KEY = "sk-9388c4e0210a4a7fb4afd05519a5e102"

providers = [
    {
        "name": "SiliconFlow",
        "url": "https://api.siliconflow.cn/v1/chat/completions",
        "model": "Qwen/Qwen2.5-72B-Instruct",
    },
    {
        "name": "DeepInfra",
        "url": "https://api.deepinfra.com/v1/openai/chat/completions",
        "model": "Qwen/Qwen2.5-72B-Instruct",
    },
    {
        "name": "Fireworks AI",
        "url": "https://api.fireworks.ai/inference/v1/chat/completions",
        "model": "accounts/fireworks/models/qwen2p5-72b-instruct",
    },
    {
        "name": "Novita AI",
        "url": "https://api.novita.ai/v3/openai/chat/completions",
        "model": "qwen/qwen-2.5-72b-instruct",
    },
    {
        "name": "302.AI",
        "url": "https://api.302.ai/v1/chat/completions",
        "model": "qwen-turbo",
    },
    {
        "name": "AiHubMix",
        "url": "https://api.aihubmix.com/v1/chat/completions",
        "model": "qwen-turbo",
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
