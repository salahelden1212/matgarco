import { Router } from 'express';
import {
  getStorefrontProducts,
  getStorefrontProductBySlug,
  getStorefrontCategories,
  getStorefrontTheme,
  getStorefrontThemePreview,
  validateStorefrontDiscount,
} from '../controllers/storefront.controller';

const router = Router({ mergeParams: true });

// All public — no auth required
router.get('/:subdomain/products',                 getStorefrontProducts);
router.get('/:subdomain/products/slug/:slug',      getStorefrontProductBySlug);
router.get('/:subdomain/categories',               getStorefrontCategories);
router.get('/:subdomain/theme',                    getStorefrontTheme);
router.get('/theme-preview/:themeId',              getStorefrontThemePreview);
router.post('/:subdomain/discounts/validate',      validateStorefrontDiscount);

export default router;
