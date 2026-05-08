# Matgarco Platform - Website Map

## Domain Architecture

| Proposed Domain | Actual App | Port | Status |
|----------------|------------|------|--------|
| `matgarco.com` | `landing-next/` | 3000 | ✅ Matches |
| `merchant.matgarco.com` | `storefront-next/` | 3001 | ⚠️ Renamed (Customer Storefront) |
| `dashboard.matgarco.com` | `dashboard-react/` | 3002 | ✅ Matches |
| `admin.matgarco.com` | `super-admin-react/` | 3003 | ✅ Matches |

---

## 1. matgarco.com (Landing Site)
**Path:** `landing-next/`

| Page | Route | Status |
|------|-------|--------|
| Homepage | `/` | ✅ |
| Features | `/features` | ✅ |
| Pricing Plans | `/pricing` | ✅ |
| About Us | `/about` | ✅ |
| Contact Us | ~~`/contact`~~ | ❌ Missing |
| Resources | `/resources` | ✅ Extra |
| Solutions | `/solutions` | ✅ Extra |

**Missing:** Contact page

---

## 2. merchant.matgarco.com (Customer Storefront)
**Path:** `storefront-next/`

| Page | Route | Status |
|------|-------|--------|
| Store Homepage | `/store/[subdomain]/` | ✅ |
| Products Catalog | `/store/[subdomain]/products/` | ✅ |
| Product Details | `/store/[subdomain]/products/[slug]/` | ✅ |
| Categories | `/store/[subdomain]/categories/` | ✅ Extra |
| Shopping Cart | `/store/[subdomain]/cart/` | ✅ |
| Checkout | `/store/[subdomain]/checkout/` | ✅ |
| Order Tracking | `/store/[subdomain]/orders/[id]/` | ✅ |

**Extra:** Category browsing, custom pages (`/[page]/`)

---

## 3. dashboard.matgarco.com (Merchant Dashboard)
**Path:** `dashboard-react/`

| Section | Page | Route | Status |
|---------|------|-------|--------|
| **Auth** | Login/Register | `/login`, `/register` | ✅ |
| **Onboarding** | Setup Wizard | `/onboarding` | ✅ Extra |
| **Overview** | Analytics Dashboard | `/dashboard/` | ✅ |
| **Products** | Product List | `/dashboard/products` | ✅ |
| | Add New Product | `/dashboard/products/new` | ✅ |
| | Edit Product | `/dashboard/products/:id/edit` | ✅ |
| **Orders** | Order List | `/dashboard/orders` | ✅ |
| | Order Details | `/dashboard/orders/:id` | ✅ |
| **Customers** | Customer List | `/dashboard/customers` | ✅ |
| | Customer Details | `/dashboard/customers/:id` | ✅ |
| **Staff** | Staff Management | `/dashboard/staff` | ✅ Extra |
| **Reports** | Analytics/Reports | `/dashboard/reports` | ✅ |
| **Store Design** | Theme Customizer | `/dashboard/store-design` | ✅ Extra |
| **Marketing** | Marketing Tools | `/dashboard/marketing` | ✅ Extra |
| **Finance** | Finance | `/dashboard/finance` | ✅ Extra |
| **Subscriptions** | Plan Management | `/dashboard/subscription` | ✅ |
| **Settings** | Store Settings | `/dashboard/settings` | ✅ |
| **AI Copilot** | AI Assistant | ~~`/dashboard/ai`~~ | ❌ Not built yet |

**Extra:** Staff management, Marketing, Finance, Reports, Store Design, Onboarding wizard
**Missing:** AI Copilot page (API exists, UI not built)

---

## 4. admin.matgarco.com (Super Admin Panel)
**Path:** `super-admin-react/`

| Section | Page | Route | Status |
|---------|------|-------|--------|
| **Auth** | Login | `/login` | ✅ |
| **Overview** | Global Dashboard | `/` | ✅ |
| **Merchants** | Merchant Directory | `/merchants` | ✅ |
| | Tenant Details | `/merchants/:id` | ✅ |
| **Revenue** | Revenue Analytics | `/finance` | ✅ |
| **Plans** | Plans Manager | `/plans` | ✅ Extra |
| **Themes** | Theme Library | `/themes` | ✅ Extra |
| | Theme Builder | `/themes/:id/builder` | ✅ Extra |
| **Payouts** | Payout Management | `/payouts` | ✅ Extra |
| **Support** | Support Center | `/support` | ✅ Extra |
| **Staff** | Admin Staff | `/staff` | ✅ Extra |
| **Settings** | System Settings | `/settings` | ✅ |

**Extra:** Plans manager, Theme library/builder, Payouts, Support center, Admin staff

---

## 5. Backend API
**Path:** `backend-node/` | **Port:** 5000

### API Routes

| Route | Endpoints |
|-------|-----------|
| `/api/auth` | Register, Login, Logout, Refresh, Verify email, Forgot/Reset password, Google OAuth |
| `/api/merchants` | CRUD, Stats, Suspend/Activate |
| `/api/products` | CRUD, Variants, Slug lookup, Duplicate |
| `/api/orders` | CRUD, Status update, Cancel, Refund, Invoice |
| `/api/customers` | CRUD, Orders history |
| `/api/staff` | CRUD with RBAC permissions |
| `/api/notifications` | List, Mark read, Delete |
| `/api/search` | Global search |
| `/api/theme` | Draft/Publish/Reset/Apply template |
| `/api/store-themes` | Per-store theme CRUD |
| `/api/themes` | Public theme listing |
| `/api/storefront` | Public store data |
| `/api/super-admin` | Stats, Merchant management, Revenue |
| `/api/subscriptions` | Plans, Subscribe, Upgrade, Cancel, Invoices |
| `/api/payments` | Payment gateway (Paymob) |
| `/api/payouts` | Merchant payouts |
| `/api/upload` | Image upload (Cloudinary) |
| `/api/ai` | Generate description, SEO, Categories, Usage stats |
| `/api/discounts` | Coupon CRUD |
| `/api/oauth` | Google, Facebook, Apple OAuth |

---

## 6. AI Service
**Path:** `ai-python/` | **Port:** 8000

| Endpoint | Purpose |
|----------|---------|
| `/description` | Product description generation |
| `/seo` | SEO optimization |
| `/translation` | Arabic/English translation |
| `/chat` | General chat |
| `/analytics` | Analytics insights |
| `/assistant` | AI assistant |

---

## 7. Shared Libraries

| Package | Purpose |
|---------|---------|
| `shared-types/` | TypeScript types (currently empty) |
| `packages/theme-engine/` | Theme rendering engine |

---

## Summary: What's Missing?

| Item | Priority |
|------|----------|
| Contact page in landing | Medium |
| AI Copilot UI in dashboard | Medium |
| `shared-types/` needs content | High |

---

## Corrected Website Map

```
Matgarco Platform
│
├── matgarco.com (Landing Site)
│   ├── Homepage
│   ├── Features
│   ├── Pricing
│   ├── About Us
│   ├── Resources
│   ├── Solutions
│   └── Contact Us ❌ (missing)
│
├── [subdomain].matgarco.com (Customer Storefront)
│   ├── Store Homepage
│   ├── Products Catalog
│   ├── Product Details
│   ├── Categories
│   ├── Shopping Cart
│   ├── Checkout
│   └── Order Tracking
│
├── dashboard.matgarco.com (Merchant Dashboard)
│   ├── Overview (Analytics)
│   ├── Products Management
│   │   ├── Add New Product
│   │   └── Edit Product
│   ├── Orders Management
│   ├── Customers Database
│   ├── Staff Management
│   ├── Store Design (Theme Customizer)
│   ├── Reports
│   ├── Marketing
│   ├── Finance
│   ├── Subscriptions
│   ├── Settings
│   ├── Onboarding Wizard
│   └── AI Copilot ❌ (not built)
│
├── admin.matgarco.com (Super Admin)
│   ├── Global Dashboard
│   ├── Merchants Directory
│   │   └── Tenant Details
│   ├── Revenue Analytics
│   ├── Subscriptions Manager
│   ├── Plans Manager
│   ├── Theme Library
│   │   └── Theme Builder
│   ├── Payout Management
│   ├── Support Center
│   ├── Admin Staff
│   └── System Settings
│
└── api.matgarco.com (Backend Node.js)
    ├── Authentication
    ├── Merchants API
    ├── Products API
    ├── Orders API
    ├── Customers API
    ├── Staff API
    ├── Notifications
    ├── Search
    ├── Themes API
    ├── Subscriptions API
    ├── Payments API
    ├── Payouts API
    ├── Upload API
    ├── AI API
    └── Discounts API
```
