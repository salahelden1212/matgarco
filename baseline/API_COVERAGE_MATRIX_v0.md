# API Coverage Matrix v0

Date: 2026-04-17
Scope: Day 1 baseline mapping (Backend endpoints vs Frontend consumers)

## 1) Legend

- Full: كل endpoints في domain لها consumer واضح.
- Partial: بعض endpoints لها consumer وبعضها غير مستخدم حاليا.
- External: endpoint مقصود لاستهلاك طرف خارجي (webhook/provider) وليس frontend.

## 2) Coverage Summary by Domain

Total discovered backend endpoints: 119

| Domain | Backend Endpoints | Frontend Coverage | Status | Notes |
|---|---:|---|---|---|
| Auth | 10 | 9 used in dashboard/super-admin | Partial | verify-email غير مربوط في الواجهات حاليا |
| Merchants | 10 | 7 used (dashboard + storefront) | Partial | suspend/activate/get-all على مسار merchants غير مستخدمة بالواجهات |
| Products | 8 | 6 used (dashboard) | Partial | featured وslug direct endpoints غير مستخدمة بالواجهات |
| Orders | 7 | 7 used (dashboard + storefront) | Full | create/list/detail/status/payment/cancel/tracking كلها مستخدمة |
| Customers | 4 | 4 used (dashboard) | Full | - |
| Upload | 2 | 2 used (dashboard) | Full | single + multiple image upload مستخدمان |
| Staff | 5 | 5 used (dashboard) | Full | - |
| Notifications | 4 | 4 used (dashboard) | Full | - |
| Search | 1 | 1 used (dashboard) | Full | - |
| Theme | 7 | 6 used (dashboard + storefront preview) | Partial | published theme عبر /api/theme/storefront/:subdomain غير مستخدم حاليا |
| Storefront | 5 | 5 used (storefront-next) | Full | منتجات/فئات/ثيم/public preview source |
| Super Admin | 35 | 31 used (super-admin-react) | Partial | 4 endpoints غير مربوطة بالواجهة حاليا |
| Subscriptions | 7 | 7 used (dashboard) | Full | - |
| Payments | 3 | create-intention used, status unused, webhook external | Partial | webhook endpoint مقصود لخدمة Paymob |
| Payouts | 7 | 6 used (dashboard + super-admin) | Partial | mark-paid endpoint غير مربوط بالواجهة حاليا |
| Store Themes | 3 | 1 used (dashboard) | Partial | install مستخدم، my-active/update-active غير مربوطين |
| Public Themes | 1 | 1 used (dashboard) | Full | themes browse مستخدم في TemplatePanel |

## 3) Active Consumer Map (Key)

## dashboard-react

Primary API sources:

- [dashboard-react/src/lib/api.ts](dashboard-react/src/lib/api.ts#L1)
- [dashboard-react/src/lib/axios.ts](dashboard-react/src/lib/axios.ts#L1)
- [dashboard-react/src/components/ImageUpload.tsx](dashboard-react/src/components/ImageUpload.tsx#L61)
- [dashboard-react/src/pages/settings/Settings.tsx](dashboard-react/src/pages/settings/Settings.tsx#L199)
- [dashboard-react/src/pages/store-design/panels/TemplatePanel.tsx](dashboard-react/src/pages/store-design/panels/TemplatePanel.tsx#L39)

Active endpoint groups consumed:

- /api/auth/* (عدا verify-email)
- /api/merchants/* (core merchant flows)
- /api/products/* (CRUD + duplicate)
- /api/orders/*
- /api/customers/*
- /api/staff/*
- /api/notifications/*
- /api/search
- /api/theme/* (dashboard draft/publish)
- /api/subscriptions/*
- /api/payouts/my + bank-info + paymob-config
- /api/upload/single + /api/upload/multiple
- /api/themes/browse
- /api/store-themes/install/:themeId

## storefront-next

Primary API sources:

- [storefront-next/src/lib/api.ts](storefront-next/src/lib/api.ts#L1)
- [storefront-next/src/app/store/[subdomain]/checkout/CheckoutClient.tsx](storefront-next/src/app/store/[subdomain]/checkout/CheckoutClient.tsx#L89)

Active endpoint groups consumed:

- /api/storefront/:subdomain/products
- /api/storefront/:subdomain/products/slug/:slug
- /api/storefront/:subdomain/categories
- /api/storefront/:subdomain/theme
- /api/storefront/theme-preview/:themeId
- /api/theme/storefront/:subdomain/preview
- /api/merchants/subdomain/:subdomain
- /api/orders (create)
- /api/orders/:id (confirmation/details)
- /api/payments/create-intention

## super-admin-react

Primary API sources:

- [super-admin-react/src/lib/api.ts](super-admin-react/src/lib/api.ts#L1)
- [super-admin-react/src/pages/Home.tsx](super-admin-react/src/pages/Home.tsx#L30)
- [super-admin-react/src/pages/ThemesList.tsx](super-admin-react/src/pages/ThemesList.tsx#L55)
- [super-admin-react/src/pages/SupportCenter.tsx](super-admin-react/src/pages/SupportCenter.tsx#L47)
- [super-admin-react/src/pages/Payouts.tsx](super-admin-react/src/pages/Payouts.tsx#L58)

Active endpoint groups consumed:

- /api/auth/login
- /api/super-admin/kpis
- /api/super-admin/dashboard/charts
- /api/super-admin/finance/advanced
- /api/super-admin/merchants + /:id + impersonate
- /api/super-admin/themes (all major CRUD/version/plans/merchants)
- /api/super-admin/settings
- /api/super-admin/announcements
- /api/super-admin/staff
- /api/super-admin/tickets (list/detail/reply/status)
- /api/super-admin/subscriptions/all
- /api/super-admin/plans
- /api/payouts/pending + process + history

## landing-next

- لا يوجد استهلاك backend APIs حاليا (صفحات تسويقية static).

## 4) Confirmed Unconsumed Endpoints (v0)

ملاحظة: "unconsumed" هنا يعني غير مرتبط بواجهة أمامية حاليا، وقد يكون مقصودًا للاستخدام اليدوي أو الخارجي أو لتطوير لاحق.

| Method | Endpoint | Domain | Status/Note |
|---|---|---|---|
| POST | /api/auth/verify-email | Auth | غير مربوط بأي frontend حاليا |
| GET | /api/merchants/ | Merchants | غير مستخدم في الواجهات (يوجد بديل عبر super-admin domain) |
| POST | /api/merchants/:id/suspend | Merchants | غير مستخدم في الواجهات |
| POST | /api/merchants/:id/activate | Merchants | غير مستخدم في الواجهات |
| GET | /api/products/featured | Products | غير مستخدم حاليا |
| GET | /api/products/slug/:slug | Products | غير مستخدم حاليا |
| GET | /api/theme/storefront/:subdomain | Theme | storefront يعتمد حاليا على /api/storefront/:subdomain/theme |
| PUT | /api/super-admin/merchants/:id/status | Super Admin | غير مربوط بالواجهة الحالية |
| POST | /api/super-admin/merchants/:id/notify | Super Admin | غير مربوط بالواجهة الحالية |
| PATCH | /api/super-admin/merchants/:id/plan | Super Admin | غير مربوط بالواجهة الحالية |
| PATCH | /api/super-admin/tickets/:id/assign | Super Admin | غير مربوط بالواجهة الحالية |
| GET | /api/payments/status/:orderId | Payments | غير مربوط بالواجهات الحالية |
| PATCH | /api/payouts/:id/mark-paid | Payouts | غير مربوط بالواجهة الحالية |
| GET | /api/store-themes/my-active | Store Themes | غير مربوط بالواجهة الحالية |
| PUT | /api/store-themes/my-active | Store Themes | غير مربوط بالواجهة الحالية |

## 5) External/Non-Frontend Endpoint

| Method | Endpoint | Reason |
|---|---|---|
| POST | /api/payments/webhook | endpoint مخصص لنداءات Paymob server-to-server وليس للواجهات |

## 6) Risks Observed from Coverage

- وجود endpoints غير مربوطة في domains أساسية (merchants/super-admin/payouts/store-themes) قد يعني:
  - ميزات غير مكتملة UI
  - أو legacy routes تحتاج cleanup
- مسار theme published في domain theme غير مستخدم بينما يوجد مسار موازٍ في storefront domain؛ هذا يحتاج قرار توحيد contract.
- verify-email endpoint غير مربوط frontend رغم وجوده backend.

## 7) Recommended Day 2 Action from this Matrix

- توحيد source endpoints للثيم (theme vs storefront theme routes).
- حسم endpoints غير المربوطة: إما ربطها UI أو إعلانها internal-only رسميًا.
- تحديث API contracts document v1 بناءً على هذا matrix.
