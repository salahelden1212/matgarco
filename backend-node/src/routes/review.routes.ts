import { Router } from 'express';
import {
  getProductReviews,
  checkCanReview,
  createReview,
  getMerchantReviews,
  updateReviewStatus,
  respondToReview,
  markHelpful,
  deleteReview,
  getReviewAnalytics,
} from '../controllers/review.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { tenantIsolation } from '../middleware/tenantIsolation.middleware';

const router = Router();

// Public routes (for storefront)
router.get('/product/:productId', getProductReviews);
router.get('/product/:productId/can-review', optionalAuth, checkCanReview);
router.post('/:id/helpful', markHelpful);

// Protected routes (require authentication)
router.post('/', optionalAuth, createReview);

// Dashboard routes (require merchant authentication)
router.use(authenticate, tenantIsolation);
router.get('/', getMerchantReviews);
router.get('/analytics', getReviewAnalytics);
router.patch('/:id/status', updateReviewStatus);
router.patch('/:id/respond', respondToReview);
router.delete('/:id', deleteReview);

export default router;
