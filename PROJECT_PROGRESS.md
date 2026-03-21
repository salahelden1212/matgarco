# Matgarco - Multi-Tenant SaaS E-commerce Platform
**تاريخ البدء:** 30 يناير 2026  
**آخر تحديث:** 17 مارس 2026

---

## 📊 ملخص سريع

| المكون | الحالة | النسبة |
|--------|--------|--------|
| Backend API | ✅ مكتمل | 100% |
| Merchant Dashboard | ✅ مكتمل | 100% |
| Customer Storefront | 🟡 أساسي جاهز | 80% |
| Payment (Paymob) | ❌ لم يبدأ | 0% |
| Landing Page | ❌ لم يبدأ | 0% |
| Super Admin | ❌ لم يبدأ | 0% |
| AI Service | ❌ لم يبدأ | 0% |

---

## ✅ Phase 1 — Backend API (100% ✓)

### الكود الفعلي:
- **11 Controller** | **7 Models** | **11 Route Files** | **~55+ endpoint**

### Controllers:
| Controller | Endpoints | الحالة |
|-----------|-----------|--------|
| `auth.controller.ts` | Register, Login, Refresh, Logout, Me, Verify Email, Forgot/Reset Password | ✅ |
| `merchant.controller.ts` | CRUD + Stats + Subdomain check + Onboarding + Suspend/Activate | ✅ |
| `product.controller.ts` | CRUD + Duplicate + Featured + Slug + Search + Filters | ✅ |
| `order.controller.ts` | Create (checkout) + List + Details + Status + Payment + Cancel + Tracking | ✅ |
| `customer.controller.ts` | List + Details + Update + Orders | ✅ |
| `upload.controller.ts` | Single + Multiple image upload (Multer + Cloudinary) | ✅ |
| `theme.controller.ts` | Get + Save Draft + Publish + Reset + Apply Template + Storefront Published/Preview | ✅ |
| `staff.controller.ts` | List + Create + Update + Delete + Reset Password (مع RBAC) | ✅ |
| `notification.controller.ts` | List + Mark Read + Mark All Read + Delete | ✅ |
| `search.controller.ts` | Global Search (products, orders, customers) | ✅ |
| `storefront.controller.ts` | Products + Product by Slug + Categories (public, no auth) | ✅ |

### Models:
| Model | الوصف |
|-------|-------|
| `User.ts` | Auth, roles (super_admin, merchant_owner, merchant_staff, customer), OAuth |
| `Merchant.ts` | Store info, subscription, limits, stats, subdomain |
| `Product.ts` | Variants, SEO, images, inventory, categories |
| `Order.ts` | Items, timeline, commission, shipping, payment |
| `Customer.ts` | Contact, addresses, order stats |
| `ThemeSettings.ts` | Draft/Published theme, colors, fonts, sections, header/footer config |
| `Notification.ts` | In-app notifications for merchant events |

### Middleware:
- `auth.middleware.ts` — JWT auth + `authorize()` + `checkPermission()` (RBAC)
- `tenantIsolation.middleware.ts` — merchantId filtering
- `upload.middleware.ts` — Multer + Cloudinary
- `validation.middleware.ts` — Zod schema validation
- `error.middleware.ts` — Global error handler + AppError class

### Security:
- [x] JWT (access 15m + refresh 7d)
- [x] bcrypt password hashing
- [x] Zod input validation
- [x] Helmet + CORS
- [x] Tenant isolation middleware
- [x] Role-based access control (RBAC)
- [x] Permission-based staff access

---

## ✅ Phase 2 — Merchant Dashboard (100% ✓)

### Tech Stack:
- React 18.2 + Vite 5 + TypeScript
- Tailwind CSS 3 | React Router v6 | Zustand | TanStack Query
- Lucide React icons | Sonner toasts | Recharts

### الصفحات الكاملة:

#### Authentication ✅
- [x] Login page (error handling كامل)
- [x] Register page (خطوتين: بيانات المستخدم + بيانات المتجر)
- [x] Auto-login بعد التسجيل
- [x] Protected routes + RequirePermission component
- [x] Axios interceptor لتجديد الـ token تلقائياً

#### Onboarding Wizard ✅
- [x] StepStoreInfo — اسم المتجر والوصف
- [x] StepTemplate — اختيار القالب
- [x] StepColors — ألوان المتجر
- [x] StepSocial — روابط السوشيال
- [x] StepDone — رسالة الإكمال

#### Layout ✅
- [x] Sidebar navigation (RTL عربي) + Mobile hamburger
- [x] Active state ذكي (startsWith)
- [x] Top bar مع SearchBar + NotificationBell
- [x] Logo image في الـ sidebar

#### Overview (Dashboard Home) ✅
- [x] Stats cards (orders, revenue, products, customers)
- [x] Revenue AreaChart (Recharts — آخر 7 أيام)
- [x] Orders BarChart (بالحالة)
- [x] Recent orders + Quick actions

#### Products Management ✅
- [x] ProductsList — Grid + List view, search, filters, pagination, delete, image carousel
- [x] AddProduct — Form كامل + Image upload (5 صور) + Tags, category, status, inventory
- [x] EditProduct — Pre-filled + image sync
- [x] ViewProduct — صفحة تفاصيل
- [x] ImageUpload component — reusable (upload, preview, remove, reorder)

#### Orders Management ✅
- [x] OrdersList — Table + search + status/payment filters + pagination + quick actions
- [x] OrderDetails — Status progress bar + items table + pricing + customer + shipping + tracking + timeline + modals (update status, tracking, cancel)
- [x] Print support

#### Customers Management ✅
- [x] CustomersList — Table + search + pagination
- [x] CustomerDetails — بيانات + order history + stats

#### Store Design ✅
- [x] StoreDesignPage — واجهة تصميم المتجر مع preview panel
- [x] 7 Customization Panels:
  - StoreInfoPanel (اسم، وصف، لوجو)
  - TemplatePanel (اختيار من 6 قوالب)
  - ColorsPanel (ألوان المتجر)
  - TypographyPanel (خطوط)
  - SectionsPanel (ترتيب وتفعيل أقسام الصفحة الرئيسية)
  - SeoPanel (عنوان، وصف، كلمات مفتاحية)
  - SocialPanel (روابط السوشيال)
- [x] Draft/Publish system (حفظ مسودة → نشر)

#### Reports ✅
- [x] Reports page (30KB — تحليلات شاملة)

#### Staff Management ✅
- [x] StaffPage — إدارة الموظفين مع RBAC
- [x] إضافة / تعديل / حذف / إعادة تعيين كلمة مرور
- [x] Permission system (products, orders, customers, reports, settings, staff)

#### Settings ✅
- [x] Settings page (39KB — شاملة)
- [x] بيانات المتجر، لوجو، ألوان، تواصل
- [x] Notification bell + panel

#### Components المشتركة ✅
- [x] SearchBar — بحث شامل (products, orders, customers)
- [x] NotificationPanel — عرض وإدارة الإشعارات
- [x] Can component — conditional rendering حسب الصلاحيات
- [x] RequirePermission — route-level permission guard

---

## 🟡 Phase 3 — Customer Storefront (80%)

### Tech Stack:
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS | Lucide React

### ✅ ما هو مكتمل:

#### Middleware & Infrastructure ✅
- [x] Subdomain routing middleware (subdomain + path-based)
- [x] Theme engine (CSS variables injection, Google Fonts)
- [x] Preview mode support
- [x] CartProvider (Context + useReducer + localStorage persistence)
- [x] ThemeDocumentSync (dir/lang sync)
- [x] PreviewLinkInterceptor (keeps ?preview=1 on navigation)

#### 6 Store Templates ✅
| Template | الوصف | النوع |
|----------|-------|-------|
| **Spark** | Clean, modern, versatile | Light |
| **Volt** | Dark, sporty, powerful | Dark |
| **Épure** | Warm, fashion-forward | Light |
| **Bloom** | Soft, feminine, beauty | Light |
| **Noir** | Luxury, sophisticated | Dark |
| **Mosaic** | Colorful, creative, handmade | Light |

كل template فيه: `Header.tsx` + `Footer.tsx` + `HomePage.tsx` + `ProductCard.tsx`
- Spark عنده 8 sections: AnnouncementBar, Hero, FeaturedProducts, CategoriesGrid, PromoBanner, NewArrivals, TrustBadges, Newsletter

#### Store Pages ✅
- [x] `/store/[subdomain]` — Homepage (dynamic template loading)
- [x] `/store/[subdomain]/products` — Product listing (search, sort, pagination)
- [x] `/store/[subdomain]/products/[slug]` — Product detail + related products
- [x] `/store/[subdomain]/cart` — Cart page (items, quantities, total)
- [x] `/store/[subdomain]/checkout` — Checkout form (customer info + shipping + payment)
- [x] `/store/[subdomain]/orders/[id]` — Order confirmation page

#### API Client ✅
- [x] `fetchStorefrontTheme()` + `fetchPreviewTheme()`
- [x] `fetchProducts()` (with params: page, limit, category, search, sort, featured)
- [x] `fetchProductBySlug()`
- [x] `fetchMerchantBySubdomain()`

### ❌ ما هو ناقص:
- [ ] اختبار Checkout → Order flow كامل (ممكن يحتاج تعديلات)
- [ ] صفحة "عن المتجر" (About)
- [ ] Wishlist functionality
- [ ] Product reviews display
- [ ] Mobile-first optimization وتحسينات الأداء

---

## ❌ Phase 4 — Payment Integration (0%)

### 💳 نموذج الدفع الطبقي (Tiered Payment Model):

| الخطة | طريقة الدفع | العمولة | من الذي يهيئها؟ |
|-------|------------|---------|------------|
| **Free Trial** | Matgarco فقط (حسابنا على Paymob) | 3% | لا شيء - تلقائي |
| **Starter** | Matgarco فقط | 2% | لا شيء - تلقائي |
| **Professional** | Matgarco أو حساب Paymob خاص | 0% | يدخل API Key في الإعدادات |
| **Business** | أي منصة دفع + ربط خاص | 0% | مرونة كاملة |

### طرق الدفع:
- 💵 الدفع عند الاستلام (COD) — **جاهز في الـ checkout** ✅
- 💳 كروت ائتمان (Visa / Mastercard) — عبر Paymob
- 📱 محافظ إلكترونية (Vodafone Cash, Orange, Etisalat)
- 🏪 Fawry (رقم مرجعي)

### المطلوب:
- [ ] إنشاء حساب Paymob للمنصة
- [ ] Backend: إضافة `paymentConfig` في Merchant model
- [ ] Backend: `getPaymentConfig()` — routing حسب الخطة
- [ ] Backend: Paymob API integration (create intention, webhooks)
- [ ] Backend: Webhook endpoint لتأكيد الدفع
- [ ] Storefront: إضافة خيارات الدفع في checkout
- [ ] Dashboard (Professional+): حقل "ربط حساب Paymob" + Test Connection
- [ ] Dashboard: تحويلات التاجر (Payouts) — لاحقاً

---

## ❌ Phase 5 — Shipping Integration (0%)

### 🚚 نموذج الشحن الطبقي:

| الخطة | الشحن | التجربة |
|-------|-------|---------|
| **Free / Starter** | يدوي (التاجر يشحن بنفسه ويدخل tracking) أو عبر Matgarco (حساب Bosta مركزي) | بسيط |
| **Professional** | Matgarco أو حساب Bosta خاص | يدخل API Key |
| **Business** | أي شركة شحن (Aramex, J&T, DHL...) | ربط كامل |

### المطلوب:
- [ ] Phase 5a: الشحن اليدوي (tracking number فقط) — **جاهز جزئياً** في OrderDetails
- [ ] Phase 5b: Bosta API integration (حساب مركزي)
- [ ] Phase 5c: ربط حساب Bosta خاص (Professional+)
- [ ] Dashboard: إعدادات الشحن (مناطق، أسعار، شركات)

---

## ❌ Phase 6 — Subscription Management (0%)

### المطلوب:
- [ ] Backend: Subscription model + plan enforcement
- [ ] Backend: Upgrade/Downgrade/Cancel endpoints
- [ ] Backend: إنفاد حدود الخطة (products limit, AI credits)
- [ ] Dashboard: صفحة الاشتراك (الخطة الحالية، الاستخدام، الترقية)
- [ ] Dashboard: Invoices list
- [ ] Integration مع Paymob لدفع الاشتراكات

---

## ❌ Phase 7 — Landing Page (0%)

### المطلوب:
- [ ] Next.js 14 project
- [ ] Homepage (Hero, Features, Testimonials, CTA)
- [ ] Pricing page (مقارنة الخطط)
- [ ] Features page + About page + Contact page
- [ ] Responsive + Animations
- [ ] SEO optimization

---

## ❌ Phase 8 — AI Features (0%)

### المطلوب:
- [ ] FastAPI + Ollama setup
- [ ] Product description generator
- [ ] SEO optimizer
- [ ] Category suggester
- [ ] Backend: AI proxy + credit system
- [ ] Dashboard: AI tools integration in product form

---

## ❌ Phase 9 — Super Admin Dashboard (0%)

### المطلوب:
- [ ] React SPA project setup
- [ ] Admin auth (super_admin role)
- [ ] Dashboard (KPIs, revenue charts)
- [ ] Merchants management (list, details, suspend/activate)
- [ ] Revenue analytics
- [ ] Subscriptions overview

---

## ❌ Phase 10 — Email & Notifications (0%)

### المطلوب:
- [ ] Nodemailer / SendGrid setup
- [ ] Order confirmation email
- [ ] Password reset email
- [ ] Arabic RTL email templates
- [ ] In-app notifications — **Backend جاهز** ✅

---

## ❌ Phase 11 — Advanced Features (Future)

- [ ] Product reviews system
- [ ] Discount / coupon system
- [ ] Wishlist
- [ ] Advanced inventory management
- [ ] CSV export
- [ ] Multi-language support (AR/EN)
- [ ] SMS notifications

---

## ❌ Phase 12 — Testing & Deployment

### Testing:
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E testing
- [ ] Performance testing

### Deployment:
- [ ] Domain (matgarco.com) + DNS
- [ ] MongoDB Atlas production
- [ ] Backend → Railway / DO
- [ ] Frontend → Vercel
- [ ] SSL + Wildcard subdomain
- [ ] Sentry error tracking
- [ ] Backup strategy

---

## 🏗️ Architecture Overview

### Backend Stack
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js 4.x + TypeScript 5.x
- **Database:** MongoDB 7.x + Mongoose ODM
- **Auth:** JWT (access 15m + refresh 7d) + RBAC
- **Validation:** Zod schemas
- **Build:** tsx (esbuild) for hot reload
- **Media:** Cloudinary (cloud: dkafalsne)

### Dashboard Stack
- **Framework:** React 18.2 + Vite 5.4
- **Language:** TypeScript
- **Routing:** React Router v6
- **State:** Zustand + TanStack Query
- **Styling:** Tailwind CSS 3.x
- **Charts:** Recharts
- **Icons:** Lucide React
- **Toasts:** Sonner

### Storefront Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Cart:** Context + useReducer + localStorage
- **Templates:** 6 (Spark, Volt, Épure, Bloom, Noir, Mosaic)

### Multi-Tenancy Model
- **Type:** Single Database, Shared Schema
- **Isolation:** Middleware filters by merchantId
- **Routing:** Subdomain-based (shop.matgarco.com) + Path-based fallback
- **Security:** JWT contains merchantId + RBAC permissions

---

## 📈 Subscription Plans

| Plan | Price | Products | Commission | AI Credits |
|------|-------|----------|------------|------------|
| Free Trial | Free (14 days) | 20 | 3% | 5/month |
| Starter | 250 EGP/month | 100 | 2% | 20/month |
| Professional | 450 EGP/month | Unlimited | 0% | 50/month |
| Business | 699 EGP/month | Unlimited | 0% | 100/month |

---

## 📝 Development Notes

### Environment Setup
```bash
# Backend (Port 5000)
cd backend-node
npm run dev

# Frontend Dashboard (Port 3002)
cd dashboard-react
npx vite --port 3002

# Storefront (Port 3001)
cd storefront-next
npx next dev -p 3001
```

### Demo Account
- **Email:** demo@matgarco.com
- **Password:** Demo1234
- **Merchant:** Demo Store (Professional plan)

### Important Files
- **Backend Config:** `backend-node/.env`
- **Frontend Config:** `dashboard-react/.env` → `VITE_API_URL=http://localhost:5000/api`
- **Storefront Config:** `storefront-next/.env.example`
- **API Client:** `dashboard-react/src/lib/axios.ts`
- **Auth Store:** `dashboard-react/src/store/authStore.ts`
- **Theme Engine:** `storefront-next/src/lib/theme.ts`
- **Template Registry:** `storefront-next/src/lib/templates/registry.ts`

---

## 🐛 Known Issues & Fixes (Resolved)
1. ~~Double password hashing~~ → Fixed
2. ~~403 Forbidden on dashboard~~ → Linked user.merchantId
3. ~~Cloudinary upload error~~ → Fixed cloud name
4. ~~Product creation 400~~ → Relaxed Zod schema
5. ~~Image not showing in cards~~ → Handle string + object formats
6. ~~Stock showing 0~~ → Added toJSON transform
7. ~~Edit form fields empty~~ → Fixed response parsing
8. ~~Sidebar active state wrong~~ → Changed to startsWith()

---

## 📌 ملاحظات مهمة

> [!IMPORTANT]
> **الأولوية القادمة:**
> 1. اختبار Checkout flow كامل (Storefront → Backend → Order)
> 2. Payment Integration (Paymob — platform-level أولاً)
> 3. Landing Page

> [!NOTE]
> **قرار تصميمي:** نموذج الدفع والشحن طبقي.
> Free/Starter يستخدم حسابات المنصة. Professional+ يقدر يربط حسابه الخاص.
> ده بيعطي التاجر البسيط تجربة "plug and play" وبيعطي التاجر المحترف المرونة.

---

**Last Updated:** 17 مارس 2026  
**Next Milestone:** Phase 4 — Payment Integration (Paymob)
