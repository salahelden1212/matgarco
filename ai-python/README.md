# Matgarco AI Service

AI-powered features using Qwen via DashScope API.

## Tech Stack

- **Framework:** FastAPI
- **Language:** Python 3.11+
- **LLM:** Qwen (DashScope API) with fallback responses
- **Image Processing:** Pillow

## Quick Start

### 1. Create Virtual Environment

```bash
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and set your **QWEN_API_KEY** (from DashScope/Alibaba Cloud).

### 4. Run Server

```bash
python main.py
# or
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## Authentication

All endpoints except `/health` require an API key in the `Authorization` header:

```
Authorization: Bearer your-ai-service-secret-key
```

Set `AI_SERVICE_API_KEY` in `.env`. In development, auth can be skipped by leaving the key empty.

## Features

- **Product Description Generator** - Generate engaging product descriptions (AR/EN)
- **SEO Optimizer** - Create SEO-friendly titles, descriptions, and keywords
- **Category Suggester** - Suggest relevant product categories and tags
- **Translation** - Translate text between languages
- **AI Assistant** - Smart assistant for store management
- **Analytics Insights** - Data-driven store analysis
- **Product Recommendations** - AI-powered product suggestions
- **Customer Insights** - Customer behavior analysis
- **Action Suggestions** - Actionable store improvement tips

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/generate-description` | Generate product description |
| POST | `/api/generate-seo` | Generate SEO metadata |
| POST | `/api/suggest-categories` | Suggest product categories |
| POST | `/api/translate` | Translate text |
| POST | `/api/chat` | General chat completion |
| POST | `/api/analytics/insights` | Analytics insights |
| POST | `/api/analytics/product-recommendations` | Product recommendations |
| POST | `/api/analytics/customer-insights` | Customer insights |
| POST | `/api/assistant/chat` | AI assistant chat |
| POST | `/api/assistant/suggest-actions` | Action suggestions |
| GET | `/cache-stats` | Cache statistics |

## Features

- In-memory caching with TTL
- Circuit breaker pattern (3 failures → 60s recovery)
- Automatic retry with exponential backoff
- Fallback responses when API is unavailable
- Rate limiting (configurable)
- API key authentication

## License

MIT
