import { Router } from 'express';
import {
  generateSEO,
  generateAnalyticsInsights,
  generateProductRecommendations,
  generateCustomerInsights,
  generateCategorySuggestion,
  generateAltText,
  generateMarketingCopy,
  predictSales,
  assistantChat,
  suggestActions,
  getAIUsage,
  generateTags,
  generateBrandingSuggestions,
  generateStoreSEO,
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
router.post('/suggest-categories', generateCategorySuggestion);
router.post('/generate-alt-text', generateAltText);
router.post('/generate-marketing-copy', generateMarketingCopy);
router.post('/predict-sales', predictSales);
router.post('/generate-tags', generateTags);
router.post('/suggest-branding', generateBrandingSuggestions);
router.post('/generate-store-seo', generateStoreSEO);
router.get('/usage', getAIUsage);

export default router;
