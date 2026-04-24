# Baseline Snapshot Document

Date: 2026-04-17
Scope: Day 1 - تثبيت خط الأساس الفني
Owner: Tech Lead + Backend Lead

## 1) الهدف

تجميد نسخة مرجعية دقيقة للحالة الحالية من:

- Build Health
- Backend Routes Inventory
- Frontend Pages Map
- Integration Reality Check
- Confirmed Gaps only

## 2) Snapshot Method

مصادر هذا المستند:

- فحص build فعلي لكل التطبيقات الأساسية.
- استخراج endpoints من route files وربطها mount prefixes من backend app.
- تتبع استهلاك APIs داخل dashboard/storefront/super-admin.
- مراجعة route maps الفعلية في تطبيقات الواجهات.

## 3) Build Baseline (Actual)

| Project | Result | Notes |
|---|---|---|
| backend-node | PASS | TypeScript build ناجح |
| dashboard-react | PASS | build ناجح مع warning chunk size كبير |
| storefront-next | PASS | build ناجح مع warnings مرتبطة webpack cache path |
| landing-next | PASS | build ناجح مع warning أن images.domains deprecated |
| super-admin-react | PASS | build ناجح مع warning chunk size كبير |
| shared-types | FAIL | TS18003 بسبب عدم وجود src inputs |

Evidence:

- [backend-node/package.json](backend-node/package.json)
- [dashboard-react/package.json](dashboard-react/package.json)
- [storefront-next/package.json](storefront-next/package.json)
- [landing-next/package.json](landing-next/package.json)
- [super-admin-react/package.json](super-admin-react/package.json)
- [shared-types/tsconfig.json](shared-types/tsconfig.json#L1)
- [landing-next/next.config.js](landing-next/next.config.js#L4)

## 4) Backend Routes Baseline

Total API Endpoints discovered: 119

| Domain | Count |
|---|---:|
| Auth | 10 |
| Merchants | 10 |
| Products | 8 |
| Orders | 7 |
| Customers | 4 |
| Upload | 2 |
| Staff | 5 |
| Notifications | 4 |
| Search | 1 |
| Theme | 7 |
| Storefront | 5 |
| Super Admin | 35 |
| Subscriptions | 7 |
| Payments | 3 |
| Payouts | 7 |
| Store Themes | 3 |
| Public Themes | 1 |

Route mount source:

- [backend-node/src/app.ts](backend-node/src/app.ts#L1)

Detailed route files:

- [backend-node/src/routes/auth.routes.ts](backend-node/src/routes/auth.routes.ts)
- [backend-node/src/routes/merchant.routes.ts](backend-node/src/routes/merchant.routes.ts)
- [backend-node/src/routes/product.routes.ts](backend-node/src/routes/product.routes.ts)
- [backend-node/src/routes/order.routes.ts](backend-node/src/routes/order.routes.ts)
- [backend-node/src/routes/customer.routes.ts](backend-node/src/routes/customer.routes.ts)
- [backend-node/src/routes/upload.routes.ts](backend-node/src/routes/upload.routes.ts)
- [backend-node/src/routes/staff.routes.ts](backend-node/src/routes/staff.routes.ts)
- [backend-node/src/routes/notification.routes.ts](backend-node/src/routes/notification.routes.ts)
- [backend-node/src/routes/search.routes.ts](backend-node/src/routes/search.routes.ts)
- [backend-node/src/routes/theme.routes.ts](backend-node/src/routes/theme.routes.ts)
- [backend-node/src/routes/storefront.routes.ts](backend-node/src/routes/storefront.routes.ts)
- [backend-node/src/routes/superAdmin.routes.ts](backend-node/src/routes/superAdmin.routes.ts)
- [backend-node/src/routes/subscription.routes.ts](backend-node/src/routes/subscription.routes.ts)
- [backend-node/src/routes/payment.routes.ts](backend-node/src/routes/payment.routes.ts)
- [backend-node/src/routes/payout.routes.ts](backend-node/src/routes/payout.routes.ts)
- [backend-node/src/routes/storeTheme.routes.ts](backend-node/src/routes/storeTheme.routes.ts)
- [backend-node/src/routes/publicThemes.routes.ts](backend-node/src/routes/publicThemes.routes.ts)

## 5) Frontend Pages Map Baseline

| App | Route System | Total Routes | Protected | Public |
|---|---|---:|---:|---:|
| dashboard-react | React Router | 19 | 16 | 3 |
| super-admin-react | React Router | 12 | 11 | 1 |
| storefront-next | Next App Router | 8 main + dynamic pages | 0 | all public |
| landing-next | Next App Router | 6 main + root | 0 | all public |

Primary route definition evidence:

- [dashboard-react/src/App.tsx](dashboard-react/src/App.tsx#L1)
- [super-admin-react/src/App.tsx](super-admin-react/src/App.tsx#L1)
- [storefront-next/src/app/store/[subdomain]/page.tsx](storefront-next/src/app/store/[subdomain]/page.tsx#L1)
- [storefront-next/src/middleware.ts](storefront-next/src/middleware.ts#L1)
- [landing-next/src/app/page.tsx](landing-next/src/app/page.tsx#L1)

## 6) API Integration Snapshot

High-level integration state:

- dashboard-react: deeply integrated مع backend domains (auth, merchant, product, order, customer, staff, notification, search, theme, subscriptions, payouts, uploads, themes browse, store-themes install).
- storefront-next: integrated mainly مع storefront public APIs + order create + payment create-intention + order details.
- super-admin-react: integrated مع super-admin control plane APIs + payouts.
- landing-next: static/public marketing pages بدون backend calls حاليا.

Evidence:

- [dashboard-react/src/lib/api.ts](dashboard-react/src/lib/api.ts#L1)
- [dashboard-react/src/lib/axios.ts](dashboard-react/src/lib/axios.ts#L1)
- [dashboard-react/src/components/ImageUpload.tsx](dashboard-react/src/components/ImageUpload.tsx#L61)
- [dashboard-react/src/pages/store-design/panels/TemplatePanel.tsx](dashboard-react/src/pages/store-design/panels/TemplatePanel.tsx#L39)
- [storefront-next/src/lib/api.ts](storefront-next/src/lib/api.ts#L1)
- [storefront-next/src/app/store/[subdomain]/checkout/CheckoutClient.tsx](storefront-next/src/app/store/[subdomain]/checkout/CheckoutClient.tsx#L89)
- [super-admin-react/src/pages/Home.tsx](super-admin-react/src/pages/Home.tsx#L30)
- [super-admin-react/src/pages/ThemesList.tsx](super-admin-react/src/pages/ThemesList.tsx#L55)
- [super-admin-react/src/pages/SupportCenter.tsx](super-admin-react/src/pages/SupportCenter.tsx#L47)

## 7) Confirmed Gaps (No assumptions)

### 7.1 Platform-wide

- لا توجد tests files فعلية داخل المشاريع الأساسية (لا unit ولا integration ولا e2e).
- shared-types package غير عملي حاليا للبناء (TS18003).
- ai-python لا يحتوي service code فعلي حتى الآن (README + requirements فقط).
- الجذر لا يحتوي scripts/workspaces لإدارة monorepo.

Evidence:

- [shared-types/tsconfig.json](shared-types/tsconfig.json#L1)
- [shared-types/package.json](shared-types/package.json#L1)
- [ai-python/README.md](ai-python/README.md)
- [ai-python/requirements.txt](ai-python/requirements.txt)
- [package.json](package.json#L1)

### 7.2 Backend functional gaps confirmed from code

- Email flow ما زال TODO داخل auth:
  - [backend-node/src/controllers/auth.controller.ts](backend-node/src/controllers/auth.controller.ts#L62)
  - [backend-node/src/controllers/auth.controller.ts](backend-node/src/controllers/auth.controller.ts#L325)
- Theme draft/publish flow transitional (draft field غير مفصول):
  - [backend-node/src/controllers/theme.controller.ts](backend-node/src/controllers/theme.controller.ts#L198)
- Storefront theme-preview returns mock-translated payload:
  - [backend-node/src/controllers/storefront.controller.ts](backend-node/src/controllers/storefront.controller.ts#L168)

### 7.3 Build/Config warnings

- landing-next يستخدم images.domains (deprecated):
  - [landing-next/next.config.js](landing-next/next.config.js#L4)
- dashboard-react و super-admin-react لديهم chunk size warnings تحتاج optimization.

## 8) Day 1 Deliverables

- Baseline Snapshot Document: done (this file)
- API Coverage Matrix v0: done
  - [baseline/API_COVERAGE_MATRIX_v0.md](baseline/API_COVERAGE_MATRIX_v0.md)

## 9) Definition of Done Check

- نسخة baseline موثقة ومحددة بوقت واضح: done
- Backend routes inventory موثق: done
- Frontend pages map موثق: done
- Confirmed gaps only موثقة بالأدلة: done
- قابل للاعتماد كمرجع رسمي للنقاشات التالية: done
