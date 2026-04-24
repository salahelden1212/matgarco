import express, { Application } from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from './config/passport';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import oauthRoutes from './routes/oauth.routes';
import merchantRoutes from './routes/merchant.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import customerRoutes from './routes/customer.routes';
import uploadRoutes from './routes/upload.routes';
import staffRoutes from './routes/staff.routes';
import notificationRoutes from './routes/notification.routes';
import searchRoutes from './routes/search.routes';
import themeRoutes from './routes/theme.routes';
import storefrontRoutes from './routes/storefront.routes';
import superAdminRoutes from './routes/superAdmin.routes';
import subscriptionRoutes from './routes/subscription.routes';
import paymentRoutes from './routes/payment.routes';
import payoutRoutes from './routes/payout.routes';
import storeThemeRoutes from './routes/storeTheme.routes';
import publicThemesRoutes from './routes/publicThemes.routes';
import aiRoutes from './routes/ai.routes';
import discountRoutes from './routes/discount.routes';

const app: Application = express();

// C5 FIX: Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 requests per window for password reset
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// H9 FIX: Rate limiting for order creation (prevent spam orders)
const orderLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 orders per 5 minutes
  message: { success: false, error: 'Too many orders. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// C10 FIX: CSRF protection - refresh token cookie already has sameSite: 'strict'
// which prevents CSRF attacks. Access token is in localStorage (not cookie-based).
// No additional CSRF middleware needed.

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.STOREFRONT_URL || 'http://localhost:3001',
    process.env.DASHBOARD_URL || 'http://localhost:3002',
    process.env.ADMIN_URL || 'http://localhost:3003',
    'http://localhost:5173', // Super Admin Vite default
  ],
  credentials: true,
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Passport authentication middleware
app.use(passport.initialize());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Matgarco API v1.0',
    version: '1.0.0',
  });
});

// Mount routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/auth/oauth', oauthRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/theme', themeRoutes);
app.use('/api/storefront', storefrontRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/store-themes', storeThemeRoutes);
app.use('/api/themes', publicThemesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/discounts', discountRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
