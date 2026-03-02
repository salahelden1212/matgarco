import { Router } from 'express';
import {
  getStorefrontProducts,
  getStorefrontProductBySlug,
  getStorefrontCategories,
} from '../controllers/storefront.controller';

const router = Router({ mergeParams: true });

// All public — no auth required
router.get('/:subdomain/products',                 getStorefrontProducts);
router.get('/:subdomain/products/slug/:slug',      getStorefrontProductBySlug);
router.get('/:subdomain/categories',               getStorefrontCategories);

export default router;
