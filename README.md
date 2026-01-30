# Matgarco - Multi-Tenant E-commerce Platform

**Matgarco** is a comprehensive SaaS platform that enables merchants to create and manage their own online stores with custom subdomains, AI-powered tools, and flexible subscription plans.

## 🚀 Project Overview

This is a multi-tenant e-commerce platform built with modern technologies, featuring:

- 🏪 **Multi-Store Architecture** - Each merchant gets their own subdomain
- 🎨 **Customizable Templates** - Multiple store themes (Modern, Minimal, Luxury)
- 🤖 **AI Integration** - Product descriptions, SEO optimization, and more
- 💳 **Subscription Plans** - Flexible pricing from free trial to enterprise
- 📊 **Analytics Dashboard** - Real-time sales and performance metrics
- 🔐 **Secure Authentication** - JWT-based auth with refresh tokens

## 📁 Project Structure

```
matgarco/
│
├── 📄 PROJECT_DOCUMENTATION.md   # Complete technical documentation
├── 📄 README.md                  # This file
│
├── 📁 backend-node/              # Backend API (Node.js + Express + TypeScript)
├── 📁 dashboard-react/           # Merchant Dashboard (React + Vite)
├── 📁 admin-react/               # Super Admin Dashboard (React + Vite)
├── 📁 landing-next/              # Landing Page (Next.js 14)
├── 📁 storefront-next/           # Customer Storefront (Next.js 14)
├── 📁 ai-python/                 # AI Service (FastAPI + Ollama)
└── 📁 shared-types/              # Shared TypeScript types
```

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Next.js 14** (App Router)
- **Vite** for React SPAs
- **Tailwind CSS** for styling
- **Zustand** for state management
- **TanStack Query** for data fetching

### Backend
- **Node.js 20+** with TypeScript
- **Express.js** REST API
- **MongoDB** with Mongoose
- **JWT** authentication
- **Cloudinary** for image storage

### AI Service
- **Python** with FastAPI
- **Ollama** for local LLM
- **Llama 3** / **Mistral** models

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB
- Python 3.11+ (for AI service)
- Ollama (for AI features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd matgarco
   ```

2. **Install dependencies for each project:**
   ```bash
   # Backend
   cd backend-node
   npm install
   cp .env.example .env

   # Dashboard
   cd ../dashboard-react
   npm install
   cp .env.example .env

   # Admin
   cd ../admin-react
   npm install

   # Landing
   cd ../landing-next
   npm install

   # Storefront
   cd ../storefront-next
   npm install
   cp .env.example .env.local

   # AI Service
   cd ../ai-python
   python -m venv venv
   source venv/bin/activate  # Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   ```

3. **Configure environment variables** in each project's `.env` file

4. **Start all services:**

   ```bash
   # Terminal 1 - Backend API
   cd backend-node
   npm run dev

   # Terminal 2 - Merchant Dashboard
   cd dashboard-react
   npm run dev

   # Terminal 3 - Storefront
   cd storefront-next
   npm run dev

   # Terminal 4 - Landing Page
   cd landing-next
   npm run dev

   # Terminal 5 - AI Service (optional)
   cd ai-python
   source venv/bin/activate
   uvicorn app.main:app --reload --port 8000
   ```

5. **Access the applications:**
   - Landing: http://localhost:3000
   - Storefront: http://localhost:3001
   - Dashboard: http://localhost:3002
   - Admin: http://localhost:3003
   - Backend API: http://localhost:5000
   - AI Service: http://localhost:8000

## 📚 Documentation

For complete technical documentation, architecture details, API endpoints, database schema, and development roadmap, see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md).

## 🎯 Features

### For Merchants
- ✅ Quick store setup (< 10 minutes)
- ✅ Product management with variants
- ✅ Order and customer management
- ✅ Sales analytics and reports
- ✅ AI-powered product descriptions
- ✅ Store customization (colors, logo, templates)
- ✅ Subscription management

### For Customers
- ✅ Beautiful storefront templates
- ✅ Product browsing and search
- ✅ Shopping cart and checkout
- ✅ Order tracking
- ✅ Product reviews
- ✅ Mobile-responsive design

### For Super Admin
- ✅ Merchant management
- ✅ Revenue analytics
- ✅ Subscription oversight
- ✅ System monitoring

## 💰 Subscription Plans

1. **Free Trial** (14 days) - 3% commission
2. **Starter** (250 EGP/month) - 2% commission
3. **Professional** (450 EGP/month) - 0% commission
4. **Business** (699 EGP/month) - 0% commission + advanced features

## 🔒 Security

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Input validation with Zod
- Rate limiting
- CORS protection
- Multi-tenant data isolation

## 🧪 Testing

```bash
# Backend tests
cd backend-node
npm test

# Frontend tests
cd dashboard-react
npm test
```

## 📦 Deployment

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md#11-deployment-strategy) for deployment instructions.

**Recommended hosting:**
- Frontend: Vercel
- Backend: Railway / DigitalOcean
- Database: MongoDB Atlas
- Images: Cloudinary

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 👥 Team

Matgarco Development Team

## 📧 Contact

For questions or support, please contact: support@matgarco.com

---

**Built with ❤️ for Egyptian merchants**

🚀 **Ready to transform e-commerce in Egypt!**
