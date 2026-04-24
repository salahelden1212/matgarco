# 🚀 إعداد ميزة AI Product Description

## خطوات التشغيل

### الخطوة 1: تأكد من تشغيل خدمة AI

```bash
# Windows (PowerShell)
ollama serve

# أو إذا كنت تستخدم Docker
docker run -d -p 8000:8000 ai-service
```

### الخطوة 2: تشغيل Backend

```bash
cd backend-node
npm install
npm run dev
```

✅ يجب أن يعمل على: `http://localhost:3000`

### الخطوة 3: تشغيل Frontend Dashboard

```bash
cd dashboard-react
npm install
npm run dev
```

✅ يجب أن يعمل على: `http://localhost:5173`

---

## معمارية التطبيق

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Dashboard (React)               │
│                     EditProduct.tsx                      │
│  ┌─────────────────────────────────────────────────┐    │
│  │ زر "إنشاء بـ AI"  ✨                             │    │
│  └────────────────────┬────────────────────────────┘    │
└─────────────────────┼────────────────────────────────────┘
                      │
                      ▼ (axios)
        ┌─────────────────────────────┐
        │   Backend API (Node.js)     │
        │  POST /products/:id/        │
        │  generate-description       │
        └────────────┬────────────────┘
                     │
                     ▼ (fetch)
        ┌──────────────────────────────┐
        │   Python AI Service           │
        │   (FastAPI + Ollama)          │
        │ POST /api/generate-description│
        └──────────────────────────────┘
                     │
                     ▼
        ┌──────────────────────────────┐
        │   Ollama LLM Model            │
        │   (Llama 3 / Mistral)         │
        └──────────────────────────────┘
```

---

## متغيرات البيئة

### Backend (.env)

```env
# قاعدة البيانات
MONGODB_URI=mongodb://localhost:27017/matgarco

# خادم التطبيق
PORT=3000
NODE_ENV=development

# خدمة AI
AI_SERVICE_URL=http://localhost:8000

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
```

### Python AI Service (.env)

```env
# Ollama
OLLAMA_HOST=http://localhost:11434
MODEL_NAME=llama3
# أو
MODEL_NAME=mistral

# FastAPI
PORT=8000
DEBUG=True
```

---

## اختبار الميزة

### 1. عبر Dashboard (UI)
```
1. الذهاب لـ: http://localhost:5173/dashboard/products
2. فتح أي منتج
3. الضغط على زر "إنشاء بـ AI" ✨
4. انتظر النتيجة
```

### 2. عبر API (cURL)
```bash
curl -X POST http://localhost:3000/api/products/{productId}/generate-description \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. عبر Postman
```
Method: POST
URL: http://localhost:3000/api/products/{productId}/generate-description
Headers:
  - Authorization: Bearer <JWT_TOKEN>
  - Content-Type: application/json
```

---

## استكشاف الأخطاء

### ❌ خطأ: "Failed to connect to AI service"

**الحل:**
```bash
# تأكد من تشغيل Python AI Service
ollama serve

# أو تحقق من الـ URL الصحيح في .env
AI_SERVICE_URL=http://localhost:8000
```

### ❌ خطأ: "Product not found"

**الحل:**
- تأكد من وجود Product ID صحيح
- تأكد من أن المنتج يخص نفس Merchant المسجل

### ❌ الزر "إنشاء بـ AI" معطل

**الحل:**
```bash
# تأكد من تثبيت المكتبات
cd dashboard-react
npm install

# أعد تشغيل dev server
npm run dev
```

---

## الأداء

| العملية | الوقت المتوقع |
|--------|-------------|
| توليد الوصف | 3-10 ثواني |
| حفظ المنتج | < 1 ثانية |
| الإجمالي | ~5-15 ثانية |

**ملاحظة:** الوقت يعتمد على حجم النموذج المستخدم و مواصفات الجهاز

---

## الخصوصية والأمان

✅ البيانات لا تُرسل لخوادم خارجية
✅ Ollama تعمل محلياً فقط
✅ Authentication مطلوب لكل طلب
✅ Tenant Isolation مفعل

---

## الملفات المهمة

```
backend-node/
├── src/
│   ├── controllers/
│   │   └── product.controller.ts ✅ (generateProductDescription)
│   └── routes/
│       └── product.routes.ts ✅ (POST /:id/generate-description)
│
dashboard-react/
├── src/
│   ├── lib/
│   │   └── api.ts ✅ (productAPI.generateDescription)
│   └── pages/products/
│       └── EditProduct.tsx ✅ (UI Button + Handler)

ai-python/
├── main.py
├── requirements.txt
└── README.md
```

---

## تشغيل سريع (Quick Start)

```bash
# 1. تشغيل AI
ollama serve &

# 2. تشغيل Backend
cd backend-node && npm run dev &

# 3. تشغيل Dashboard
cd dashboard-react && npm run dev

# ثم افتح: http://localhost:5173
```

---

## المساعدة والدعم

اذا واجهت أي مشاكل:
1. تحقق من أن جميع الخدمات تعمل
2. افحص console logs
3. تحقق من المتغيرات البيئية
4. أعد تشغيل الخدمات

✅ الآن أنت جاهز لاستخدام ميزة AI!
