import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  getFeaturedProducts,
} from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { tenantIsolation, injectMerchantId } from '../middleware/tenantIsolation.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().min(0, 'Price must be positive'),
    compareAtPrice: z.number().min(0).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    images: z.array(z.object({
      url: z.string().url(),
      alt: z.string().optional(),
      isPrimary: z.boolean().optional(),
    })).min(1, 'At least one image is required'),
    trackQuantity: z.boolean().optional(),
    quantity: z.number().min(0).optional(),
    status: z.enum(['draft', 'active', 'archived']).optional(),
    isFeatured: z.boolean().optional(),
  }),
});

const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().min(10).optional(),
    price: z.number().min(0).optional(),
    compareAtPrice: z.number().min(0).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    images: z.array(z.object({
      url: z.string().url(),
      alt: z.string().optional(),
      isPrimary: z.boolean().optional(),
    })).optional(),
    quantity: z.number().min(0).optional(),
    status: z.enum(['draft', 'active', 'archived']).optional(),
    isFeatured: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  }),
});

// Public routes
router.get('/featured', getFeaturedProducts);
router.get('/slug/:slug', getProductBySlug);

// Protected routes (Merchant)
router.get(
  '/',
  authenticate,
  tenantIsolation,
  injectMerchantId,
  getProducts
);

router.post(
  '/',
  authenticate,
  tenantIsolation,
  validate(createProductSchema),
  createProduct
);

router.get(
  '/:id',
  authenticate,
  tenantIsolation,
  getProductById
);

router.patch(
  '/:id',
  authenticate,
  tenantIsolation,
  validate(updateProductSchema),
  updateProduct
);

router.delete(
  '/:id',
  authenticate,
  tenantIsolation,
  deleteProduct
);

router.post(
  '/:id/duplicate',
  authenticate,
  tenantIsolation,
  duplicateProduct
);

export default router;
