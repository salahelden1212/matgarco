# Matgarco AI Service

Scalable AI microservice powered by Qwen (DashScope/Alibaba Cloud) for the Matgarco multi-tenant e-commerce platform.

## Features

| Feature | Endpoint | Description |
|---|---|---|
| Product Descriptions | `POST /api/generate-description` | Generate professional product descriptions in Arabic/English |
| SEO Metadata | `POST /api/generate-seo` | Auto-generate SEO titles, descriptions, keywords, slugs |
| Translation | `POST /api/translate` | Translate between AR, EN, FR, DE, ES, ZH |
| General Chat | `POST /api/chat` | Open-ended AI completion |
| Analytics Insights | `POST /api/analytics/insights` | AI-powered store performance analysis |
| Product Recommendations | `POST /api/analytics/product-recommendations` | Data-driven product management suggestions |
| Customer Insights | `POST /api/analytics/customer-insights` | Customer behavior analysis and segmentation |
| Smart Assistant | `POST /api/assistant/chat` | Context-aware merchant assistant |
| Action Suggestions | `POST /api/assistant/suggest-actions` | AI-suggested store actions |

## Quick Start

### 1. Setup (one-time)
```bash
cd ai-python
setup.bat
```

### 2. Configure
Edit `.env`:
```env
QWEN_API_KEY=sk-your-api-key-here
QWEN_MODEL=qwen-turbo
```

### 3. Start
```bash
start.bat
```

Service runs on `http://localhost:8000`

### 4. Test
```bash
test.bat
```

Or visit http://localhost:8000/docs for interactive Swagger UI.

## Architecture

```
ai-python/
├── config.py              # Environment settings with validation
├── main.py                # FastAPI app entry point
├── services/              # Business logic
│   ├── qwen_client.py     # Singleton Qwen API client
│   ├── description.py     # Product description generation
│   ├── seo.py             # SEO metadata generation
│   ├── translation.py     # Translation service
│   ├── chat.py            # General chat completion
│   ├── analytics.py       # Analytics & insights
│   └── assistant.py       # Smart assistant
├── models/                # Pydantic request/response schemas
└── routes/                # API route handlers
```

## Integration

The Node.js backend (`backend-node/`) proxies all AI requests through:
- `POST /api/ai/*` routes
- Configured via `AI_SERVICE_URL=http://localhost:8000` in `.env`

The React dashboard (`dashboard-react/`) accesses AI via:
- `aiAPI` object in `src/lib/api.ts`
- `AIAssistant` chatbot component in the dashboard layout

## API Key Issue

If you get `Incorrect API key provided` errors:
1. Go to https://dashscope.console.aliyun.com/
2. Create a new API key
3. Update `QWEN_API_KEY` in `ai-python/.env`
4. Restart the AI service
