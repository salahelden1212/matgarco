# تقرير مراجعة شاملة وخطة تطوير Matgarco

تاريخ المراجعة: 17-04-2026

## 1) نطاق المراجعة ومنهجية العمل

هذا التقرير مبني على:

- مراجعة فعلية لملفات المشاريع (routes, controllers, pages, models, services).
- فحص صحة البناء Build لكل التطبيقات الأساسية.
- مقارنة سريعة بين الحالة الفعلية وبين التقارير الموجودة (مع افتراض أن التقارير القديمة قد لا تكون محدثة بالكامل).

## 2) خلاصة تنفيذية سريعة

### الحالة الحالية (واقعية من الكود)

- البناء ناجح لـ:
  - backend-node
  - dashboard-react
  - storefront-next
  - landing-next
  - super-admin-react
- توجد فجوات أساسية على مستوى المنصة ككل:
  - لا توجد اختبارات آلية فعلية (unit/integration/e2e) في المشاريع الأساسية.
  - ai-python ما زال docs + requirements بدون كود FastAPI فعلي.
  - shared-types غير جاهز (يفشل build لعدم وجود src inputs).
  - لا يوجد orchestrator واضح على مستوى الجذر لتشغيل/بناء كل المشاريع.

### مخرجات فحص البناء

- backend-node: build ناجح.
- dashboard-react: build ناجح مع تحذير chunk size كبير.
- storefront-next: build ناجح مع تحذيرات webpack cache path.
- landing-next: build ناجح مع تحذير deprecated images.domains.
- super-admin-react: build ناجح مع تحذير chunk size كبير.
- shared-types: build فشل TS18003 (لا يوجد ملفات src).

## 3) مراجعة مشروع بمشروع

## 3.1 backend-node

الحالة الحالية:

- Backend غني فعليا ومربوط بميزات كثيرة: auth, merchants, products, orders, subscriptions, payments, payouts, themes, staff, notifications, search, super-admin.
- أدلة:
  - [backend-node/src/app.ts](backend-node/src/app.ts#L1)
  - [backend-node/src/routes/subscription.routes.ts](backend-node/src/routes/subscription.routes.ts#L1)
  - [backend-node/src/routes/payment.routes.ts](backend-node/src/routes/payment.routes.ts#L1)
  - [backend-node/src/routes/superAdmin.routes.ts](backend-node/src/routes/superAdmin.routes.ts#L1)

النواقص الحرجة:

- Email transactional غير مكتمل داخل auth flow:
  - [backend-node/src/controllers/auth.controller.ts](backend-node/src/controllers/auth.controller.ts#L62)
  - [backend-node/src/controllers/auth.controller.ts](backend-node/src/controllers/auth.controller.ts#L325)
- Theme draft/publish ما زال transitional (نفس البيانات live):
  - [backend-node/src/controllers/theme.controller.ts](backend-node/src/controllers/theme.controller.ts#L198)
- Theme preview للـ Master Theme يرجع mock payload للتحويل:
  - [backend-node/src/controllers/storefront.controller.ts](backend-node/src/controllers/storefront.controller.ts#L168)
- لا توجد domains كاملة لـ coupons/reviews/analytics jobs/AI routes/shipping providers production.
- لا توجد test suites فعلية.

اقتراحات تحسين backend (أولوية):

- P0:
  - إكمال email service + templates + retries + logging.
  - فصل draft/published في StoreTheme فعليًا.
  - webhook idempotency + signature hardening + replay protection.
  - إضافة smoke tests ل auth, checkout, payment webhook.
- P1:
  - Domain كامل لـ coupons.
  - Domain كامل لـ reviews moderation.
  - shipping integrations (Bosta كبداية).
- P2:
  - analytics aggregation jobs + export.
  - AI proxy + credit ledger + rate limits.

## 3.2 dashboard-react (Merchant)

الحالة الحالية:

- لوحة التاجر مكتملة نسبيًا وظيفيا: products, orders, customers, reports, settings, staff, store-design, subscription, finance.
- أدلة routes:
  - [dashboard-react/src/App.tsx](dashboard-react/src/App.tsx#L1)
- ربط API واسع عبر:
  - [dashboard-react/src/lib/api.ts](dashboard-react/src/lib/api.ts#L1)

النواقص الأهم:

- لا توجد صفحات تشغيلية كاملة لـ:
  - coupons
  - reviews moderation
  - shipping settings
  - integrations center (Paymob/Bosta/Email)
- تدفقات multi-step (onboarding/register) تحتاج rollback/compensation على فشل خطوة لاحقة.
- تحذير bundle size كبير في build (performance debt).

اقتراحات صفحات جديدة للـ dashboard:

- CouponsPage: إنشاء/تعديل/تفعيل أكواد الخصم + analytics استعمال.
- ReviewsPage: queue للمراجعات pending/approved/rejected.
- ShippingSettingsPage: zones, providers, pricing rules.
- IntegrationsPage: Paymob, Bosta, SMTP status + test connection.
- AutomationsPage: قواعد بسيطة مثل low-stock alerts أو order follow-ups.

## 3.3 storefront-next

الحالة الحالية:

- Storefront يعمل جيدًا في المسارات الأساسية: home, products, product detail, cart, checkout, order confirmation.
- أدلة:
  - [storefront-next/src/app/store/[subdomain]/page.tsx](storefront-next/src/app/store/[subdomain]/page.tsx#L1)
  - [storefront-next/src/app/store/[subdomain]/checkout/CheckoutClient.tsx](storefront-next/src/app/store/[subdomain]/checkout/CheckoutClient.tsx#L1)
  - [storefront-next/src/lib/api.ts](storefront-next/src/lib/api.ts#L1)

ملاحظات gap مهمة:

- يوجد fallback/default logic واضح في عدة أجزاء (جيد للاستمرارية لكن يحتاج إنهاء production data path).
- newsletter/contact inputs في sections بدون backend pipeline مكتمل.
- wishlist/reviews/order tracking المتقدم غير مكتمل.
- architecture الحالية تعتمد section-based registry بدون template libraries مستقلة لكل قالب.

اقتراحات صفحات/ميزات storefront:

- /store/[subdomain]/wishlist
- /store/[subdomain]/orders/track
- Product reviews UI + rating breakdown
- Product quick view modal
- Contact page + ticket/contact form endpoint
- SEO improvements: schema metadata per page + dynamic OG per product

## 3.4 super-admin-react

الحالة الحالية:

- معظم الصفحات API-backed فعليًا: merchants, subscriptions/finance, themes, payouts, support, settings, staff, plans.
- أدلة routes:
  - [super-admin-react/src/App.tsx](super-admin-react/src/App.tsx#L1)
  - [super-admin-react/src/lib/api.ts](super-admin-react/src/lib/api.ts#L1)

نقاط تحتاج تحسين:

- بعض شاشات التحرير تحتاج audit log واضح وversioning أقوى (خطط، إعدادات، ثيمات).
- غياب Incident/Operations مركزية (alerts, failed jobs, webhook failures).
- تحذير bundle size كبير في build.

اقتراحات صفحات super-admin:

- AuditLogPage: كل تغييرات admins مع before/after.
- IncidentsPage: payment failures, webhook retries, queue failures.
- FeatureFlagsPage: on/off per feature per environment.
- PlatformHealthPage: uptime, response time, DB health, queue lag.
- FinanceReconciliationPage: مطابقة payouts مع transactions/invoices.

## 3.5 landing-next

الحالة الحالية:

- Landing قوي بصريا وموجود فيه صفحات أساسية (home/features/pricing/resources/solutions/about).
- أدلة:
  - [landing-next/src/app/page.tsx](landing-next/src/app/page.tsx#L1)
  - [landing-next/src/app/pricing/page.tsx](landing-next/src/app/pricing/page.tsx#L1)
  - [landing-next/src/app/layout.tsx](landing-next/src/app/layout.tsx#L1)

نواقص/تحسينات:

- لا يوجد Contact page فعلي (lead capture متكامل).
- لا يوجد Templates Gallery تسويقي مباشر.
- تحذير تقني: images.domains deprecated في Next config.

اقتراحات صفحات landing:

- /contact (lead form + CRM webhook)
- /templates (preview gallery + filtering)
- /case-studies (قصص نجاح + metrics)
- /demo (book demo)
- /security (trust page: privacy, compliance, uptime)

## 3.6 ai-python

الحالة الحالية:

- المشروع يحتوي README + requirements فقط.
- لا توجد ملفات Python service فعلية داخل المشروع حاليا.
- أدلة:
  - [ai-python/README.md](ai-python/README.md)
  - [ai-python/requirements.txt](ai-python/requirements.txt)

النقص:

- غياب FastAPI app, routes, service layer, schemas, tests, Dockerfile.

اقتراح التنفيذ:

- إنشاء app/main.py + routes + schemas + health.
- integration مع Ollama + timeout/fallback strategy.
- endpoint contracts ثابتة مع backend-node.
- usage metering + plan credits integration.

## 3.7 packages/theme-engine

الحالة الحالية:

- تم ضبطه كـ library build إلى dist مع exports/types/scripts.
- أدلة:
  - [packages/theme-engine/package.json](packages/theme-engine/package.json#L1)
  - [packages/theme-engine/tsconfig.json](packages/theme-engine/tsconfig.json#L1)

نقاط تحسين:

- لا يوجد tests للengine logic (validation/state/renderer).
- لا يوجد versioning policy أو changelog discipline للـ package.
- استهلاك المشاريع ما زال جزئيا عبر مسارات src مباشرة في بعض الأماكن ويحتاج توحيد إلى package entry.

## 3.8 shared-types

الحالة الحالية:

- package موجود لكن بدون src حقيقي.
- build يفشل بسبب TS18003.
- أدلة:
  - [shared-types/tsconfig.json](shared-types/tsconfig.json#L1)
  - [shared-types/package.json](shared-types/package.json#L1)

المطلوب:

- تأسيس src فعلي: models, api contracts, enums, shared DTOs.
- توحيد الاستيرادات من backend/dashboard/storefront/super-admin عبر هذه الحزمة.

## 3.9 الجذر (monorepo orchestration)

الحالة الحالية:

- لا يوجد scripts/workspaces على الجذر لإدارة المشاريع مجمعة.
- [package.json](package.json#L1) يحتوي dependencies فقط.

المطلوب:

- إضافة npm workspaces أو turbo/pnpm workspace.
- scripts موحدة: dev:all, build:all, lint:all, test:all.
- CI pipeline موحد.

## 4) خطة تطوير شاملة مقسمة مراحل

المدة المقترحة: 12-16 أسبوع (مرنة حسب الفريق)

## Phase 0 - Alignment و Contracts (1 أسبوع)

الأهداف:

- تحديث وثائق المشروع لتصبح مطابقة للكود الحالي.
- اعتماد API contracts موحدة بين backend/storefront/dashboard/super-admin.
- تثبيت naming conventions للمسارات والأدوار.

مخرجات:

- API contract document versioned.
- Compatibility matrix بين المشاريع.

## Phase 1 - Platform Stability Baseline (1-2 أسبوع)

الأهداف:

- تأسيس shared-types فعلي.
- إضافة root workspace scripts.
- إضافة smoke tests (auth, checkout, payment webhook, theme publish).
- إصلاح build warnings ذات الأولوية.

مخرجات:

- green CI on build + smoke tests.
- تشغيل موحد dev/build من الجذر.

## Phase 2 - Revenue Core Hardening (2 أسبوع)

الأهداف:

- استكمال billing/subscription logic وربطه fully بمدفوعات الاشتراك.
- تحسين payout reconciliation.
- audit trail لتعديلات الخطط.

مخرجات:

- subscription lifecycle production-ready.
- finance reports موثوقة.

## Phase 3 - Merchant Commerce Features (2-3 أسبوع)

الأهداف:

- Coupon system كامل.
- Review system كامل.
- Shipping integration (Bosta first).
- Transactional email service.

مخرجات:

- merchant operations loop مكتمل (بيع/خصم/شحن/تواصل).

## Phase 4 - Storefront Conversion & CX (2 أسبوع)

الأهداف:

- Wishlist + quick view + product reviews UI.
- order tracking timeline.
- تحسين checkout UX + حالات فشل/عودة الدفع.

مخرجات:

- تحسن conversion + retention.

## Phase 5 - Super Admin Operations (2 أسبوع)

الأهداف:

- Incident center + audit logs + feature flags.
- role-based admin dashboards (finance/support/theme dev).
- مراقبة platform health.

مخرجات:

- تشغيل إداري robust وقابل للتوسع.

## Phase 6 - AI Service Delivery (2 أسبوع)

الأهداف:

- بناء ai-python service فعليا.
- ربط backend proxy + usage metering.
- إدماج أدوات AI في dashboard بشكل حقيقي.

مخرجات:

- AI features usable ومتحكم فيها بالcredits.

## Phase 7 - Theme Engine V2 and Template Ecosystem (2-3 أسبوع)

الأهداف:

- تحويل القوالب من نفس البنية مع ألوان مختلفة إلى template libraries مستقلة.
- Theme upload/versioning pipeline.
- توحيد الاستيراد من theme-engine package entry.

مخرجات:

- نظام قوالب أقرب لنموذج Shopify/Salla.

## Phase 8 - Quality, Security, Deployment Excellence (مستمر)

الأهداف:

- unit/integration/e2e test coverage متزايد.
- observability: logging, tracing, error monitoring.
- security hardening: secrets rotation, RBAC audits, webhook security.

مخرجات:

- منصة جاهزة للنمو التجاري بثبات أعلى.

## 5) Backlog مختصر حسب الأولوية

P0 (ابدأ فورا):

- shared-types bootstrap + root workspace scripts.
- smoke tests أساسية.
- إغلاق TODOs الحرجة في auth/theme/storefront mock transitions.
- landing config warning fixes.

P1 (بعد P0 مباشرة):

- coupons + reviews + shipping + transactional email.
- storefront wishlist/order tracking/review UX.
- super-admin incident + audit + flags.

P2 (توسعات ونمو):

- AI production service.
- analytics advanced + forecasting.
- theme marketplace ecosystem.

## 6) اقتراح صفحات إضافية عملية

Dashboard:

- CouponsPage
- ReviewsPage
- ShippingSettingsPage
- IntegrationsPage
- AutomationsPage

Storefront:

- Wishlist
- Order Tracking
- Contact
- FAQ
- Product Quick View

Super Admin:

- Audit Logs
- Incidents
- Feature Flags
- Platform Health
- Reconciliation

Landing:

- Contact
- Templates Gallery
- Case Studies
- Book Demo
- Security/Trust

## 7) ملاحظات حاكمة قبل التنفيذ

- اعتمدوا الكود الحالي كمصدر حقيقة أول، ثم حدّثوا الوثائق بناء عليه.
- أي Phase جديدة لازم تتقفل بمعيار قياس واضح: API contracts + tests + DX docs.
- ممنوع إضافة Features كبيرة بدون اختبار smoke على checkout/payments/theme publish.

## 8) خطة تنفيذ يومية مفصلة (Phase 0 + Phase 1)

الهدف من هذا القسم: تحويل الرؤية العامة إلى خطة يومية قابلة للتنفيذ بدون غموض.

ملاحظة تنفيذية:

- إذا الفريق صغير (1-2 أشخاص)، نفس الخطة تمشي لكن بدمج الأدوار في شخص واحد.
- التقديرات أدناه تقديرات عمل فعلي صافي، بدون اجتماعات.

### الأسبوع 1 (Phase 0: Alignment + Contracts)

### اليوم 1: تثبيت خط الأساس الفني

حالة التنفيذ: مكتمل (2026-04-17)

- الهدف:
  - اتفاق الفريق على Source of Truth للكود والوثائق.
- المهام:
  - تجميد نسخة مرجعية من الحالة الحالية (Build + Routes + Pages Map).
  - استخراج قائمة endpoints الفعلية من backend ومطابقتها مع استهلاك frontends.
  - تسجيل الفجوات المؤكدة فقط (مش افتراضات).
- المخرجات:
  - Baseline Snapshot Document.
  - API Coverage Matrix v0.
- المسؤول:
  - Tech Lead + Backend Lead.
- التقدير:
  - 6-8 ساعات.
- Definition of Done:
  - الفريق متفق على مستند baseline واحد، وأي نقاش لاحق يرجع له.

مخرجات التنفيذ الفعلية:

- Baseline Snapshot Document:
  - [baseline/BASELINE_SNAPSHOT_DOCUMENT.md](baseline/BASELINE_SNAPSHOT_DOCUMENT.md)
- API Coverage Matrix v0:
  - [baseline/API_COVERAGE_MATRIX_v0.md](baseline/API_COVERAGE_MATRIX_v0.md)

### اليوم 2: توحيد عقود ال API

- الهدف:
  - تعريف request/response contracts موحدة بين backend والداشبورد والستورفرونت والسوبر أدمن.
- المهام:
  - تصميم schema موحدة لأكثر تدفقات حساسية: Auth, Orders, Payments, Theme.
  - تحديد naming conventions ثابتة للحقول (snake vs camel, status enums).
  - تعريف error envelope موحد.
- المخرجات:
  - API Contract Draft v1.
  - Error Handling Contract.
- المسؤول:
  - Backend Lead + Frontend Lead.
- التقدير:
  - 7 ساعات.
- Definition of Done:
  - تم تحديد عقود واضحة لـ 4 domains الأساسية.

### اليوم 3: تصميم shared-types بشكل عملي

- الهدف:
  - تأسيس بنية shared-types القابلة للتوسع.
- المهام:
  - تعريف هيكل src داخل shared-types:
    - src/models
    - src/api
    - src/enums
    - src/index
  - نقل DTOs الأساسية (User, Merchant, Product, Order, Theme, Subscription).
  - ضبط التصدير المركزي وإزالة التضارب.
- المخرجات:
  - shared-types قابل للبناء لأول مرة.
  - قائمة migration targets داخل المشاريع.
- المسؤول:
  - Tech Lead + Fullstack Engineer.
- التقدير:
  - 8 ساعات.
- Definition of Done:
  - npm run build في shared-types يعمل بدون أخطاء.

### اليوم 4: تحديث الوثائق لتطابق الكود

- الهدف:
  - تصحيح الفجوة بين الوثائق القديمة والحالة الحالية.
- المهام:
  - تحديث PROJECT_PROGRESS وPROJECT_DOCUMENTATION بنسخة مختصرة دقيقة.
  - إضافة section واضح لما هو مكتمل وما هو جزئي وما هو غير موجود.
  - توثيق Open Risks.
- المخرجات:
  - Documentation Sync v1.
  - Risk Register مبدئي.
- المسؤول:
  - Product/Tech Writer + Tech Lead.
- التقدير:
  - 5-6 ساعات.
- Definition of Done:
  - أي عضو جديد يقدر يفهم حالة المشروع خلال 20 دقيقة.

### اليوم 5: اعتماد الخطة + تجهيز Sprint 1

- الهدف:
  - تحويل العقود والوثائق إلى backlog قابل للتنفيذ الأسبوع التالي.
- المهام:
  - تقسيم Stories مع estimate وowner.
  - ترتيب الأولويات P0 داخل board واضح.
  - تحديد Exit Criteria للأسبوع 2.
- المخرجات:
  - Sprint 1 Backlog Ready.
  - Responsibility Matrix.
- المسؤول:
  - Tech Lead + PM/Owner.
- التقدير:
  - 4-5 ساعات.
- Definition of Done:
  - backlog approved ومفيش task بدون owner.

### الأسبوع 2 (Phase 1: Stability Baseline - Core)

### اليوم 6: shared-types bootstrap فعلي

- الهدف:
  - تشغيل shared-types فعليا وربطه بباقي المشاريع.
- المهام:
  - إنشاء ملفات DTO الأساسية.
  - توحيد exports.
  - إضافة build validation.
- المخرجات:
  - shared-types v1 working.
- المسؤول:
  - Fullstack Engineer.
- التقدير:
  - 7 ساعات.
- Definition of Done:
  - shared-types build أخضر + imports تعمل في مشروعين على الأقل.

### اليوم 7: دمج shared-types في backend + dashboard

- الهدف:
  - تقليل التكرار في الأنواع بين backend وdashboard.
- المهام:
  - استبدال الأنواع المحلية في flows الأساسية.
  - ضبط API typing في dashboard lib.
  - اختبار endpoints الحساسة بعد الدمج.
- المخرجات:
  - Type Consistency عبر backend + dashboard.
- المسؤول:
  - Backend Lead + Frontend Lead.
- التقدير:
  - 8 ساعات.
- Definition of Done:
  - عدم وجود type mismatch في flows: auth, products, orders.

### اليوم 8: دمج shared-types في storefront + super-admin + theme-engine usages

- الهدف:
  - توحيد contracts بين الواجهات كلها.
- المهام:
  - نقل الأنواع المشتركة للواجهتين.
  - مراجعة imports المرتبطة ب theme-engine لتقليل الربط المباشر بمسارات src الداخلية.
  - تثبيت نقاط التوافق النهائية.
- المخرجات:
  - Cross-app Type Alignment.
- المسؤول:
  - Frontend Lead + Fullstack Engineer.
- التقدير:
  - 8 ساعات.
- Definition of Done:
  - build ناجح لكل الواجهات بعد الدمج.

### اليوم 9: Monorepo scripts + CI baseline

- الهدف:
  - إدارة تشغيل وبناء المشاريع من الجذر بطريقة موحدة.
- المهام:
  - إضافة scripts موحدة:
    - dev:all
    - build:all
    - lint:all
    - test:smoke
  - تجهيز CI pipeline مبدئي (build + smoke).
  - توثيق أوامر التشغيل الرسمية.
- المخرجات:
  - Root Orchestration جاهز.
  - CI Baseline Pipeline.
- المسؤول:
  - DevOps + Tech Lead.
- التقدير:
  - 6-7 ساعات.
- Definition of Done:
  - أمر واحد من الجذر يبني كل المشاريع الأساسية بنجاح.

### اليوم 10: Smoke tests + إغلاق التحذيرات الحرجة

- الهدف:
  - ضمان الحد الأدنى من الجودة قبل الانتقال لمراحل features.
- المهام:
  - تنفيذ smoke tests على:
    - auth login/refresh
    - checkout -> order create
    - payment webhook happy path
    - theme publish/preview
  - إصلاح warnings المهمة (Next config deprecated + chunk strategy أولية).
- المخرجات:
  - Smoke Test Report v1.
  - Stability Gate Approved.
- المسؤول:
  - QA + Backend + Frontend.
- التقدير:
  - 8 ساعات.
- Definition of Done:
  - كل smoke tests passing + no blocker warnings.

### الأسبوع 3 (اختياري كتثبيت إضافي لـ Phase 1)

### اليوم 11: Performance quick wins

- split chunks في dashboard/super-admin.
- تحسين lazy loading للصفحات الثقيلة.
- التقدير: 6 ساعات.

### اليوم 12: Security quick hardening

- توحيد error responses الحساسة.
- مراجعة auth middleware edge cases.
- مراجعة webhook replay protection.
- التقدير: 6 ساعات.

### اليوم 13: Runbooks وتشغيل الفريق

- كتابة runbook للأعطال الشائعة.
- كتابة release checklist.
- التقدير: 5 ساعات.

### اليوم 14: Release Candidate داخلي

- dry run كامل للتشغيل.
- sign-off من leads.
- التقدير: 4 ساعات.

## 9) Sprint Plan أسبوعي (تفصيلي بالتقديرات والمسؤوليات)

## Sprint A (الأسبوع 1) - Alignment Sprint

- الهدف:
  - تثبيت عقود النظام وتوحيد الوثائق.
- النطاق:
  - API contracts الأساسية + baseline audit + risk register.
- السعة المقترحة:
  - 90-110 ساعة فريق.
- الخروج المطلوب:
  - Contract v1 معتمد.
  - Baseline docs محدثة.

Stories:

- A-01: Baseline Audit and Map
  - Owner: Tech Lead
  - Estimate: 8h
- A-02: API Contract Draft
  - Owner: Backend Lead
  - Estimate: 10h
- A-03: Error Envelope and Status Standardization
  - Owner: Backend Lead
  - Estimate: 6h
- A-04: Frontend Contract Validation
  - Owner: Frontend Lead
  - Estimate: 8h
- A-05: Docs Sync and Risk Register
  - Owner: Product/Tech Writer
  - Estimate: 8h

## Sprint B (الأسبوع 2) - Stability Foundation Sprint

- الهدف:
  - تأسيس shared-types + root orchestration + smoke tests.
- النطاق:
  - shared-types integration across apps + CI baseline.
- السعة المقترحة:
  - 100-120 ساعة فريق.
- الخروج المطلوب:
  - جميع builds خضراء عبر أمر موحد.
  - smoke tests الأساسية passing.

Stories:

- B-01: shared-types Bootstrap
  - Owner: Fullstack Engineer
  - Estimate: 12h
- B-02: Backend + Dashboard Type Migration
  - Owner: Backend Lead + Frontend Lead
  - Estimate: 16h
- B-03: Storefront + Super Admin Type Migration
  - Owner: Frontend Lead
  - Estimate: 14h
- B-04: Root Scripts and Workspace Orchestration
  - Owner: DevOps
  - Estimate: 10h
- B-05: Smoke Tests Suite v1
  - Owner: QA Engineer
  - Estimate: 14h
- B-06: Build Warning Cleanup (Priority)
  - Owner: Frontend Lead
  - Estimate: 8h

## Sprint C (الأسبوع 3) - Hardening Sprint (موصى به)

- الهدف:
  - تثبيت الجودة قبل دخول Features كبيرة.
- النطاق:
  - performance quick wins + security hardening + release runbooks.
- السعة المقترحة:
  - 70-90 ساعة فريق.
- الخروج المطلوب:
  - release candidate داخلي مستقر.

Stories:

- C-01: Dashboard/SuperAdmin Bundle Optimization
  - Owner: Frontend Lead
  - Estimate: 12h
- C-02: Payment/Webhook Reliability Improvements
  - Owner: Backend Lead
  - Estimate: 10h
- C-03: Security Baseline Checklist
  - Owner: Tech Lead
  - Estimate: 8h
- C-04: Runbooks + Release Checklist
  - Owner: DevOps + QA
  - Estimate: 8h
- C-05: End-to-End Dry Run
  - Owner: QA Engineer
  - Estimate: 10h

## 10) مصفوفة المسؤوليات (RACI مبسطة)

| Workstream | Accountable | Responsible | Consulted | Informed |
|---|---|---|---|---|
| API Contracts | Tech Lead | Backend Lead | Frontend Lead | Team |
| shared-types | Tech Lead | Fullstack Engineer | Backend/Frontend Leads | Team |
| Root Scripts + CI | DevOps Lead | DevOps Engineer | Tech Lead | Team |
| Smoke Tests | QA Lead | QA Engineer | Backend/Frontend Leads | Team |
| Theme Reliability | Frontend Lead | Frontend Engineer | Backend Lead | Team |
| Payment Reliability | Backend Lead | Backend Engineer | QA | Team |

## 11) TODO تنفيذية جاهزة (نسخ مباشر للمتابعة)

### Week 1 TODO

- [ ] A-01 Baseline Audit and Map
- [ ] A-02 API Contract Draft
- [ ] A-03 Error Envelope Standardization
- [ ] A-04 Frontend Contract Validation
- [ ] A-05 Docs Sync + Risk Register

### Week 2 TODO

- [ ] B-01 shared-types Bootstrap
- [ ] B-02 Type Migration (backend + dashboard)
- [ ] B-03 Type Migration (storefront + super-admin)
- [ ] B-04 Root Scripts and Workspace Orchestration
- [ ] B-05 Smoke Tests Suite v1
- [ ] B-06 Build Warning Cleanup

### Week 3 TODO (Optional but recommended)

- [ ] C-01 Bundle Optimization
- [ ] C-02 Payment/Webhook Reliability
- [ ] C-03 Security Baseline Checklist
- [ ] C-04 Runbooks + Release Checklist
- [ ] C-05 Full Dry Run + Sign-off

## 12) آلية المتابعة الأسبوعية (لتسهيل التنفيذ)

- اجتماع تخطيط أسبوعي: 60 دقيقة.
- متابعة يومية قصيرة: 15 دقيقة.
- مراجعة منتصف الأسبوع: 30 دقيقة.
- Demo/Review نهاية الأسبوع: 45 دقيقة.
- Retro نهاية الأسبوع: 30 دقيقة.

قواعد التنفيذ:

- لا توجد مهمة بدون owner واضح.
- لا توجد قصة بدون Definition of Done.
- لا يتم فتح Feature كبيرة قبل نجاح smoke tests.
- أي تغيير في contracts يلزم update للوثائق بنفس اليوم.

---

هذا التقرير مقصود يكون الوثيقة التنفيذية الجديدة الأكثر واقعية حاليا.
