import { Router } from 'express';
import {
  generateSEO,
  generateAnalyticsInsights,
  generateProductRecommendations,
  generateCustomerInsights,
  assistantChat,
  suggestActions,
} from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';
import { tenantIsolation } from '../middleware/tenantIsolation.middleware';

const router = Router();

router.use(authenticate);

router.post('/seo', generateSEO);
router.post('/analytics/insights', generateAnalyticsInsights);
router.post('/analytics/product-recommendations', generateProductRecommendations);
router.post('/analytics/customer-insights', generateCustomerInsights);
router.post('/assistant/chat', assistantChat);
router.post('/assistant/suggest-actions', suggestActions);

export default router;
