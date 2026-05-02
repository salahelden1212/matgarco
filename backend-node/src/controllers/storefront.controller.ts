/**
 * Public Storefront Controller
 * Read-only, no auth required.
 * Looks up merchant by subdomain, filters active/visible data.
 */
import { Request, Response } from 'express';
import Merchant from '../models/Merchant';
import Product from '../models/Product';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { calculatePagination } from '../utils/helpers';
import StoreTheme from '../models/StoreTheme';
import { normalizeThemePages } from '../utils/themeNormalization';

// Simple in-memory cache for storefront data
const storefrontCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getStorefrontCache(key: string): any | null {
  const cached = storefrontCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  storefrontCache.delete(key);
  return null;
}

function setStorefrontCache(key: string, data: any): void {
  storefrontCache.set(key, { data, timestamp: Date.now() });
}

// Clear cache for a specific merchant (call this when products/theme are updated)
export function clearStorefrontCache(subdomain: string): void {
  for (const key of storefrontCache.keys()) {
    if (key.includes(subdomain.toLowerCase())) {
      storefrontCache.delete(key);
    }
  }
}

/** GET /api/storefront/:subdomain/products */
export const getStorefrontProducts = asyncHandler(async (req: Request, res: Response) => {
  const { subdomain } = req.params;

  const merchant = await Merchant.findOne({ subdomain: subdomain.toLowerCase(), isActive: true }).lean();
  if (!merchant) throw new AppError('Store not found', 404);

  const merchantId = (merchant as any)._id;
  const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 12);
  const { skip } = calculatePagination(page, limit);

  const filter: Record<string, any> = { merchantId, status: 'active', isVisible: true };

  if (req.query.category) filter.category = req.query.category;
  if (req.query.featured === 'true') filter.isFeatured = true;
  if (req.query.search) {
    filter.$or = [
      { name:        { $regex: req.query.search, $options: 'i' } },
      { tags:        { $in: [new RegExp(req.query.search as string, 'i')] } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const sortMap: Record<string, Record<string, number>> = {
    newest:     { createdAt: -1 },
    oldest:     { createdAt:  1 },
    price_asc:  { price:  1 },
    price_desc: { price: -1 },
    name_asc:   { name:   1 },
    popular:    { sales: -1 },
    featured:   { isFeatured: -1, createdAt: -1 },
  };
  const sort = sortMap[(req.query.sort as string) || 'featured'] || sortMap.featured;

  const [products, total] = await Promise.all([
    Product.find(filter).skip(skip).limit(limit).sort(sort as any).lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
});

/** GET /api/storefront/:subdomain/products/slug/:slug */
export const getStorefrontProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { subdomain, slug } = req.params;

  const merchant = await Merchant.findOne({ subdomain: subdomain.toLowerCase(), isActive: true }).lean();
  if (!merchant) throw new AppError('Store not found', 404);

  const product = await Product.findOne({
    merchantId: (merchant as any)._id,
    slug,
    status: 'active',
    isVisible: true,
  }).lean();

  if (!product) throw new AppError('Product not found', 404);

  // Fetch related products (same category, different product)
  const related = await Product.find({
    merchantId: (merchant as any)._id,
    status: 'active',
    isVisible: true,
    category: (product as any).category,
    _id: { $ne: (product as any)._id },
  })
    .limit(4)
    .lean();

  res.json({
    success: true,
    data: {
      product,
      related,
      merchant: {
        storeName: (merchant as any).storeName,
        subdomain: (merchant as any).subdomain,
        currency: (merchant as any).currency,
      },
    },
  });
});

/** GET /api/storefront/:subdomain/categories */
export const getStorefrontCategories = asyncHandler(async (req: Request, res: Response) => {
  const { subdomain } = req.params;

  const merchant = await Merchant.findOne({ subdomain: subdomain.toLowerCase(), isActive: true }).lean();
  if (!merchant) throw new AppError('Store not found', 404);

  const categories = await Product.distinct('category', {
    merchantId: (merchant as any)._id,
    status: 'active',
    isVisible: true,
    category: { $ne: null, $exists: true },
  });

  res.json({ success: true, data: { categories: categories.filter(Boolean) } });
});

/**
 * @desc    Get public active theme JSON for a store
 * @route   GET /api/storefront/:subdomain/theme
 * @access  Public
 */
export const getStorefrontTheme = asyncHandler(async (req: Request, res: Response) => {
  const { subdomain } = req.params;
  const cacheKey = `theme:${subdomain.toLowerCase()}`;
  
  // Check cache first
  const cached = getStorefrontCache(cacheKey);
  if (cached && !req.query.nocache) {
    return res.json({
      success: true,
      data: cached,
      cached: true,
    });
  }

  const merchant = await Merchant.findOne({ subdomain: subdomain.toLowerCase(), isActive: true }).lean();
  if (!merchant) throw new AppError('Store not found', 404);

  const activeTheme = await StoreTheme.findOne({ merchantId: (merchant as any)._id, isActive: true })
    .populate('themeId', 'slug isPremium').lean();

  const normalizedTheme = activeTheme
    ? {
        ...activeTheme,
        pages: normalizeThemePages((activeTheme as any).pages || {}, {}),
      }
    : null;

  const response = {
    theme: normalizedTheme,
    merchant,
  };
  
  // Cache the response
  setStorefrontCache(cacheKey, response);

  res.json({
    success: true,
    data: response,
    cached: false,
  });
});

/**
 * @desc    Get raw Master Theme for Super Admin Template Maker preview
 * @route   GET /api/storefront/theme-preview/:themeId
 * @access  Public
 */
export const getStorefrontThemePreview = asyncHandler(async (req: Request, res: Response) => {
  const { themeId } = req.params;
  const Theme = (await import('../models/Theme')).default;
  
  if (!themeId || themeId.length !== 24) {
     throw new AppError('Invalid Theme ID', 400);
  }

  const baseTheme = await Theme.findById(themeId).lean();
  if (!baseTheme) throw new AppError('Base Theme not found', 404);

  const normalizedPages = normalizeThemePages((baseTheme as any).pages || {}, {});

  // Return a mock payload that translates BaseTheme to the StoreTheme schema expected by the render engine
  res.json({
    success: true,
    data: {
      theme: {
        _id: baseTheme._id,
        themeId: baseTheme,
        merchantId: 'demo-preview',
        isActive: true,
        published: {
          globalSettings: (baseTheme as any).globalSettings,
          pages: normalizedPages,
        },
        draft: {
          globalSettings: (baseTheme as any).globalSettings,
          pages: normalizedPages,
        }
      },
      merchant: {
        storeName: 'معاينة القالب الأساسي',
        subdomain: 'demo',
        currency: 'EGP',
      }
    }
  });
});
