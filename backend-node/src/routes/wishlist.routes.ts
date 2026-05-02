import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  clearWishlist,
  syncWishlist,
} from '../controllers/wishlist.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Public routes (with optional auth)
router.get('/check/:productId', optionalAuth, checkWishlist);

// Protected routes (require authentication)
router.use(authenticate);
router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.delete('/remove/:productId', removeFromWishlist);
router.delete('/clear', clearWishlist);
router.post('/sync', syncWishlist);

export default router;
