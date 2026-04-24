# AI Integration Plan - Matgarco Platform

## Executive Summary

This document outlines the comprehensive AI integration strategy for the Matgarco multi-tenant e-commerce platform. The AI system is built as a **Python FastAPI microservice** powered by **Qwen (DashScope/Alibaba Cloud)**, serving as a central AI hub for all intelligent features across the platform.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Matgarco Platform                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │   Dashboard   │    │  Storefront  │    │  Super Admin     │   │
│  │   (React)     │    │  (Next.js)   │    │  (React)         │   │
│  └──────┬───────┘    └──────┬───────┘    └────────┬─────────┘   │
│         │                   │                      │             │
│         └───────────────────┼──────────────────────┘             │
│                             │                                    │
│                    ┌────────▼────────┐                           │
│                    │  Backend Node.js │                           │
│                    │  (Express API)   │                           │
│                    └────────┬────────┘                           │
│                             │                                    │
│                    ┌────────▼────────┐                           │
│                    │  AI Service      │                           │
│                    │  (Python FastAPI)│──► Qwen API (DashScope)  │
│                    │  :8000           │                           │
│                    └─────────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Product Description Generation (Core)

### What It Does
Generates professional, SEO-optimized product descriptions in Arabic or English based on product name, category, price, and tags.

### Implementation

**AI Service Endpoint:** `POST /api/generate-description`

**Request:**
```json
{
  "productName": "iPhone 15 Pro",
  "category": "Electronics",
  "price": 50000,
  "tags": ["smartphone", "apple", "premium"],
  "language": "ar"
}
```

**Response:**
```json
{
  "success": true,
  "description": "هاتف ذكي متقدم من آبل بمواصفات عالية...",
  "language": "ar"
}
```

### Integration Points

| Location | File | How |
|---|---|---|
| Add Product Page | `dashboard-react/src/pages/products/AddProduct.tsx` | Button next to description field, generates before saving |
| Edit Product Page | `dashboard-react/src/pages/products/EditProduct.tsx` | Button next to description field, updates existing product |
| Backend Route | `backend-node/src/routes/product.routes.ts` | `POST /api/products/generate-description` (draft) and `POST /api/products/:id/generate-description` (existing) |

### UX Flow
1. Merchant enters product name (required)
2. Optionally enters category, price, tags
3. Clicks "إنشاء بـ AI" button
4. AI generates description in 2-5 seconds
5. Description appears in textarea, merchant can edit before saving

---

## 2. AI Smart Assistant / Chatbot (Core)

### What It Does
An AI-powered assistant embedded in the dashboard that helps merchants manage their store, answer questions, and provide guidance.

### Capabilities
- **Store Management Guidance**: How to add products, manage orders, configure themes
- **Business Advice**: Pricing strategies, marketing tips, inventory management
- **Platform Support**: How to use Matgarco features, subscription info
- **Context-Aware**: Knows the merchant's store name, plan, product count, orders, revenue
- **Multi-turn Conversations**: Maintains conversation history for context

### Implementation

**AI Service Endpoints:**
- `POST /api/assistant/chat` - Chat with the assistant
- `POST /api/assistant/suggest-actions` - Get AI-suggested actions for the store

**Request:**
```json
{
  "message": "كيف أزيد مبيعات متجري؟",
  "storeContext": {
    "storeName": "متجر الأناقة",
    "plan": "Professional",
    "totalProducts": 45,
    "totalOrders": 120,
    "totalRevenue": 85000
  },
  "conversationHistory": [
    {"role": "user", "content": "مرحباً"},
    {"role": "assistant", "content": "أهلاً بك! كيف يمكنني مساعدتك؟"}
  ]
}
```

### Integration Points

| Location | File | How |
|---|---|---|
| Dashboard Layout | `dashboard-react/src/components/layout/DashboardLayout.tsx` | Floating chat button in bottom-left corner |
| AI Assistant Component | `dashboard-react/src/components/AIAssistant.tsx` | Full chat UI with message history |
| Backend Route | `backend-node/src/routes/ai.routes.ts` | `POST /api/ai/assistant/chat` |

### UI Design
- **Floating Button**: "مساعد متجركو" with Sparkles icon, bottom-left
- **Chat Window**: 32rem tall, RTL support, message bubbles
- **Minimizable**: Can minimize to a compact pill showing message count
- **Loading States**: Spinner while AI is thinking
- **Error Handling**: Friendly error messages if AI fails

### Example Interactions

**User**: "كيف أزيد مبيعات متجري؟"
**Assistant**: "بناءً على بيانات متجرك (45 منتج، 120 طلب، 85,000 جنيه إيرادات)، إليك التوصيات:
1. أضف منتجات جديدة في الفئات الأكثر طلباً
2. حسّن وصف المنتجات باستخدام AI
3. فعّل خصومات على المنتجات الراكدة
4. راجع طلباتك المعلقة وأسرع في معالجتها..."

**User**: "ما هي خطة Business؟"
**Assistant**: "خطة Business (699 جنيه/شهر) تتضمن: منتجات غير محدودة، موظفين غير محدودين، 200 رصيد AI شهرياً، بدون عمولة منصة، إمكانية استخدام Paymob الخاص بك..."

---

## 3. Reports & Analytics with AI Insights (Core)

### What It Does
Analyzes store data (products, orders, customers) and provides AI-powered insights, recommendations, and predictions to support decision-making.

### Three Types of Analysis

#### 3.1 Store Performance Insights
Analyzes overall store metrics and provides:
- Performance summary
- Positive highlights
- Areas for improvement
- Actionable recommendations (3-5 specific items)
- Future predictions based on trends
- Warning indicators

#### 3.2 Product Recommendations
Analyzes products and orders to suggest:
- Top-performing products and why
- Stagnant products needing intervention
- New product opportunities
- Inventory management tips
- Pricing strategies

#### 3.3 Customer Insights
Analyzes customer data to provide:
- Customer segmentation (new, repeat, loyal, dormant)
- Marketing recommendations per segment
- Loyalty program suggestions
- Retention rate analysis

### Implementation

**AI Service Endpoints:**
- `POST /api/analytics/insights` - General store insights
- `POST /api/analytics/product-recommendations` - Product-specific recommendations
- `POST /api/analytics/customer-insights` - Customer behavior analysis

**Request (Insights):**
```json
{
  "analyticsData": {
    "storeName": "متجر الأناقة",
    "plan": "Professional",
    "stats": { "totalOrders": 120, "totalRevenue": 85000, "totalProducts": 45 },
    "products": {
      "total": 45,
      "byStatus": { "active": 30, "draft": 10, "archived": 5 },
      "topProducts": [...],
      "lowStock": [...]
    },
    "orders": {
      "total": 50,
      "byStatus": { "delivered": 35, "pending": 10, "cancelled": 5 },
      "totalRevenue": 45000,
      "recentOrders": [...]
    },
    "customers": { "total": 80 }
  },
  "question": "",
  "language": "ar"
}
```

### Integration Points

| Location | File | How |
|---|---|---|
| Reports Page | `dashboard-react/src/pages/reports/Reports.tsx` | "تحليل الذكاء الاصطناعي" section with "حلل بياناتي" button |
| Backend Route | `backend-node/src/routes/ai.routes.ts` | `POST /api/ai/analytics/insights` |
| Backend Controller | `backend-node/src/controllers/ai.controller.ts` | Fetches data from MongoDB, sends to AI service |

### UX Flow
1. Merchant opens Reports page
2. Sees charts and KPIs (existing functionality)
3. At bottom, sees "تحليل الذكاء الاصطناعي" section
4. Clicks "حلل بياناتي" button
5. AI analyzes all store data (products, orders, customers)
6. Returns comprehensive report in Arabic with:
   - Performance summary
   - Strengths and weaknesses
   - 3-5 actionable recommendations
   - Predictions and warnings

---

## 4. SEO Optimization (Recommended)

### What It Does
Auto-generates SEO metadata for products: title, description, keywords, and URL slug.

### Implementation

**AI Service Endpoint:** `POST /api/generate-seo`

**Request:**
```json
{
  "productName": "iPhone 15 Pro",
  "description": "هاتف ذكي متقدم من آبل...",
  "category": "Electronics",
  "language": "ar"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "seoTitle": "iPhone 15 Pro - أحدث هاتف من آبل بكاميرا احترافية",
    "seoDescription": "اشتري iPhone 15 Pro بأفضل سعر. كاميرا 48MP، معالج A17 Pro، شاشة Super Retina XDR. شحن سريع وضمان سنتين.",
    "seoKeywords": ["iPhone 15 Pro", "آبل", "هاتف ذكي", "كاميرا احترافية", "أحدث هاتف"],
    "slug": "iphone-15-pro"
  }
}
```

### Integration Points

| Location | File | How |
|---|---|---|
| Backend Route | `backend-node/src/routes/ai.routes.ts` | `POST /api/ai/seo` |
| Product Model | `backend-node/src/models/Product.ts` | `seo` subdocument: `{title, description, keywords[]}` |
| AI Tracking | `backend-node/src/models/Product.ts` | `aiGenerated.seo: boolean` flag |

### Future Enhancement
- Auto-generate SEO for all products in bulk
- SEO score checker for existing products
- Competitor SEO analysis

---

## 5. Additional AI Capabilities

### 5.1 Translation Service
Translate product descriptions, store content, etc. between languages.

**Endpoint:** `POST /api/translate`

Supports: Arabic, English, French, German, Spanish, Chinese

### 5.2 General Chat Completion
Open-ended AI for any custom use case.

**Endpoint:** `POST /api/chat`

---

## File Structure

### AI Python Service (`ai-python/`)
```
ai-python/
├── .env                          # QWEN_API_KEY, QWEN_MODEL, etc.
├── .env.example
├── config.py                     # Settings class with validation
├── main.py                       # FastAPI app entry point
├── requirements.txt              # Python dependencies
├── setup.bat                     # Windows setup script
├── start.bat                     # Windows start script
├── test.bat                      # Windows test script
├── README.md
├── services/
│   ├── __init__.py
│   ├── qwen_client.py            # Singleton Qwen API client
│   ├── description.py            # Product description generation
│   ├── seo.py                    # SEO metadata generation
│   ├── translation.py            # Translation service
│   ├── chat.py                   # General chat completion
│   ├── analytics.py              # Analytics insights service
│   └── assistant.py              # Smart assistant service
├── models/
│   └── __init__.py               # Pydantic request/response models
└── routes/
    ├── __init__.py
    ├── health.py                 # Health check endpoints
    ├── ai_routes.py              # Description endpoints
    ├── seo_routes.py             # SEO endpoints
    ├── translation_routes.py     # Translation endpoints
    ├── chat_routes.py            # Chat endpoints
    ├── analytics_routes.py       # Analytics endpoints
    └── assistant_routes.py       # Assistant endpoints
```

### Backend Node.js (`backend-node/`)
```
backend-node/src/
├── controllers/
│   ├── ai.controller.ts          # NEW: All AI proxy controllers
│   └── product.controller.ts     # Updated: AI description generation
├── routes/
│   ├── ai.routes.ts              # NEW: /api/ai/* routes
│   └── product.routes.ts         # Updated: description routes
└── app.ts                        # Updated: mounted /api/ai
```

### Dashboard React (`dashboard-react/`)
```
dashboard-react/src/
├── components/
│   ├── AIAssistant.tsx           # NEW: Chatbot component
│   └── layout/DashboardLayout.tsx # Updated: includes AIAssistant
├── pages/
│   ├── products/
│   │   ├── AddProduct.tsx        # Updated: AI description button
│   │   └── EditProduct.tsx       # Updated: AI description button
│   └── reports/
│       └── Reports.tsx           # Updated: AI insights section
└── lib/
    └── api.ts                    # Updated: aiAPI object
```

---

## API Endpoints Summary

### AI Python Service (Port 8000)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/generate-description` | Generate product description |
| POST | `/api/generate-seo` | Generate SEO metadata |
| POST | `/api/translate` | Translate text |
| POST | `/api/chat` | General chat |
| POST | `/api/analytics/insights` | Store analytics insights |
| POST | `/api/analytics/product-recommendations` | Product recommendations |
| POST | `/api/analytics/customer-insights` | Customer insights |
| POST | `/api/assistant/chat` | Assistant chat |
| POST | `/api/assistant/suggest-actions` | Suggested store actions |

### Backend Node.js (Port 5000)
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/products/generate-description` | Generate description (draft) |
| POST | `/api/products/:id/generate-description` | Generate + save description |
| POST | `/api/ai/seo` | Generate SEO for product |
| POST | `/api/ai/analytics/insights` | Get store insights |
| POST | `/api/ai/analytics/product-recommendations` | Get product recommendations |
| POST | `/api/ai/analytics/customer-insights` | Get customer insights |
| POST | `/api/ai/assistant/chat` | Chat with assistant |
| POST | `/api/ai/assistant/suggest-actions` | Get suggested actions |

---

## Setup & Running

### 1. AI Python Service
```bash
cd ai-python

# Setup (one-time)
setup.bat
# Or manually:
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Configure
# Edit .env with your QWEN_API_KEY

# Start
start.bat
# Or: python main.py
```

### 2. Backend Node.js
```bash
cd backend-node

# Ensure .env has:
# AI_SERVICE_URL=http://localhost:8000

npm run dev
```

### 3. Dashboard React
```bash
cd dashboard-react

npm run dev
```

### 4. Test
```bash
cd ai-python
test.bat
# Or visit http://localhost:8000/docs for Swagger UI
```

---

## AI Credits System

Each subscription plan has AI credits:

| Plan | AI Credits/Month |
|---|---|
| Free Trial | 5 |
| Starter | 20 |
| Professional | 50 |
| Business | 200 |

**Credit Usage (estimated):**
- Product description: 1 credit
- SEO generation: 1 credit
- Analytics insights: 3 credits
- Assistant chat: 0.5 credits per message

**Implementation**: Track `aiCreditsUsed` on Merchant model. Check before each AI call. Reset monthly.

---

## Error Handling

| Scenario | User Message |
|---|---|
| AI service down | "خدمة الذكاء الاصطناعي غير متاحة حالياً" |
| Invalid API key | "خطأ في تكوين خدمة AI - تواصل مع الدعم" |
| Rate limit | "تم تجاوز الحد الشهري - قم بترقية خطتك" |
| Timeout | "انتهت مهلة الطلب - حاول مرة أخرى" |
| Empty response | "لم يتم توليد محتوى - حاول مرة أخرى" |

---

## Security

- AI service runs on internal port (8000), not exposed publicly
- Backend proxies all AI requests with authentication
- Tenant isolation ensures merchants only access their data
- API key stored in `.env`, never in code
- Input validation on all endpoints

---

## Future Enhancements

1. **Image Analysis**: Analyze product images to auto-generate descriptions
2. **Batch Operations**: Generate descriptions for multiple products at once
3. **Email Templates**: AI-generated marketing emails
4. **Social Media Posts**: Auto-generate social media content from products
5. **Voice Assistant**: Voice-enabled store management
6. **Predictive Analytics**: Sales forecasting, demand prediction
7. **A/B Testing**: AI-optimized product page variations
8. **Chatbot for Storefront**: Customer-facing chatbot on storefront
9. **Review Analysis**: AI analysis of customer reviews
10. **Competitor Analysis**: AI-powered market research
