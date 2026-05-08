import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createIntention,
  handleWebhook,
  getPaymentStatus,
  testPaymobKeys,
  updatePaymentSettings,
  updateShippingConfig,
} from '../controllers/payment.controller';

const router = Router();

// Public — Paymob webhook (no auth, HMAC verified internally)
router.post('/webhook', handleWebhook);

// Public — Storefront checkout (no user session needed, just order data)
router.post('/create-intention', createIntention);

// Protected — merchant payment & shipping management
router.get('/status/:orderId', authenticate, getPaymentStatus);
router.post('/test-keys', authenticate, testPaymobKeys);
router.patch('/settings', authenticate, updatePaymentSettings);
router.patch('/shipping', authenticate, updateShippingConfig);

export default router;
