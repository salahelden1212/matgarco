import { Response, NextFunction } from 'express';
import Product from '../models/Product';
import Merchant from '../models/Merchant';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../types';
import { generateSlug } from '../utils/helpers';
import { calculatePagination } from '../utils/helpers';
import { checkAndDeductAICredit } from '../utils/aiCredit';

// Cache for storefront data (5 minutes)
const storefrontCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(subdomain: string, endpoint: string, params: string): string {
  return `${subdomain}:${endpoint}:${params}`;
}

function getCachedData(key: string): any | null {
  const cached = storefrontCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  storefrontCache.delete(key);
  return null;
}

function setCachedData(key: string, data: any): void {
  storefrontCache.set(key, { data, timestamp: Date.now() });
}

// Clear cache for a specific merchant
export function clearMerchantCache(subdomain: string): void {
  for (const key of storefrontCache.keys()) {
    if (key.startsWith(`${subdomain}:`)) {
      storefrontCache.delete(key);
    }
  }
}

async function callAIService(productName: string, category: string, price?: number, tags?: string[]): Promise<string> {
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  const response = await fetch(`${aiServiceUrl}/api/generate-description`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productName,
      category,
      price,
      tags,
      language: 'ar',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI service error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const description = (data as any).description;

  if (!description) {
    throw new Error('Empty response from AI service');
  }

  return description.trim();
}

/**
 * Get all products (for merchant)
 * GET /api/products
 * 
 * Query params:
 * - page, limit: pagination
 * - sort: newest, oldest, price_asc, price_desc, name_asc, stock_asc
 * - status: draft, active, archived
 * - category: category name
 * - search: text search in name, description, tags, sku
 * - minPrice, maxPrice: price range filter
 * - stock: in_stock, low_stock, out_of_stock
 * - tags: comma-separated tags
 * - isFeatured: true/false
 */
export const getProducts = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const merchantId = req.user?.merchantId;
    
    if (!merchantId) {
      throw new AppError('No merchant associated', 400);
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const { skip } = calculatePagination(page, limit);

    const filter: any = { merchantId };

    // Status filter
    if (req.query.status && ['draft', 'active', 'archived'].includes(req.query.status as string)) {
      filter.status = req.query.status;
    }

    // Category filter
    if (req.query.category) {
      filter.category = { $regex: new RegExp(req.query.category as string, 'i') };
    }

    // Featured filter
    if (req.query.isFeatured === 'true') {
      filter.isFeatured = true;
    }

    // Advanced Search (name, description, tags, sku)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
        { sku: searchRegex },
      ];
    }

    // Price range filter
    const minPrice = parseFloat(req.query.minPrice as string);
    const maxPrice = parseFloat(req.query.maxPrice as string);
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      filter.price = {};
      if (!isNaN(minPrice)) filter.price.$gte = minPrice;
      if (!isNaN(maxPrice)) filter.price.$lte = maxPrice;
    }

    // Stock filter
    if (req.query.stock) {
      switch (req.query.stock) {
        case 'in_stock':
          filter.$or = [
            { trackQuantity: false },
            { trackQuantity: true, quantity: { $gt: 0 } },
          ];
          break;
        case 'low_stock':
          filter.trackQuantity = true;
          filter.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };
          break;
        case 'out_of_stock':
          filter.trackQuantity = true;
          filter.quantity = 0;
          break;
      }
    }

    // Tags filter (comma-separated)
    if (req.query.tags) {
      const tags = (req.query.tags as string).split(',').map(t => t.trim().toLowerCase());
      filter.tags = { $in: tags };
    }

    // Sorting options
    const sortMap: Record<string, Record<string, number>> = {
      newest:      { createdAt: -1 },
      oldest:      { createdAt: 1 },
      price_asc:   { price: 1 },
      price_desc:  { price: -1 },
      name_asc:    { name: 1 },
      name_desc:   { name: -1 },
      stock_asc:   { quantity: 1 },
      stock_desc:  { quantity: -1 },
      sales:       { sales: -1 },
      views:       { views: -1 },
    };
    const sort = sortMap[(req.query.sort as string)] || sortMap.newest;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sort as any)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        filters: {
          applied: Object.keys(filter).filter(k => k !== 'merchantId'),
          available: {
            sortOptions: Object.keys(sortMap),
            statusOptions: ['draft', 'active', 'archived'],
            stockOptions: ['in_stock', 'low_stock', 'out_of_stock'],
          },
        },
      },
    });
  }
);

/**
 * Get single product
 * GET /api/products/:id
 */
export const getProductById = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const merchantId = req.user?.merchantId;

    const product = await Product.findOne({
      _id: id,
      ...(merchantId && { merchantId }), // Filter by merchant if authenticated
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Increment views
    product.views += 1;
    await product.save();

    res.status(200).json({
      success: true,
      data: { product },
    });
  }
);

/**
 * Get product by slug (public)
 * GET /api/products/slug/:slug
 */
export const getProductBySlug = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { slug } = req.params;
    const { merchantId } = req.query;

    if (!merchantId) {
      throw new AppError('Merchant ID required', 400);
    }

    const product = await Product.findOne({
      slug,
      merchantId,
      status: 'active',
      isVisible: true,
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Increment views
    product.views += 1;
    await product.save();

    res.status(200).json({
      success: true,
      data: { product },
    });
  }
);

/**
 * Create product
 * POST /api/products
 */
export const createProduct = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const merchantId = req.user?.merchantId;

    if (!merchantId) {
      throw new AppError('No merchant associated', 400);
    }

    // Check product limit
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      throw new AppError('Merchant not found', 404);
    }

    if (merchant.limits.maxProducts !== -1) {
      const productCount = await Product.countDocuments({ merchantId });
      if (productCount >= merchant.limits.maxProducts) {
        throw new AppError(`Product limit reached (${merchant.limits.maxProducts}). Please upgrade your plan.`, 403);
      }
    }

    const { name, stock, ...rest } = req.body;

    // Map stock to quantity for model compatibility
    if (stock !== undefined) {
      rest.quantity = stock;
    }

    // Transform images array if it's array of strings
    let images = rest.images || [];
    if (images.length > 0 && typeof images[0] === 'string') {
      images = images.map((url: string, index: number) => ({
        url,
        alt: name,
        isPrimary: index === 0,
      }));
    }

    // Generate slug
    let slug = generateSlug(name);
    
    // Ensure unique slug for this merchant
    let slugExists = await Product.findOne({ merchantId, slug });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(name)}-${counter}`;
      slugExists = await Product.findOne({ merchantId, slug });
      counter++;
    }

    const product = await Product.create({
      merchantId,
      name,
      slug,
      ...rest,
      images,
    });

    // Update merchant stats
    await Merchant.findByIdAndUpdate(merchantId, {
      $inc: { 'stats.totalProducts': 1 },
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });
  }
);

/**
 * Update product
 * PATCH /api/products/:id
 */
export const updateProduct = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const merchantId = req.user?.merchantId;
    const updates = req.body;

    // Map stock to quantity for model compatibility
    if (updates.stock !== undefined) {
      updates.quantity = updates.stock;
      delete updates.stock;
    }

    // Transform images array if it's array of strings
    if (updates.images && Array.isArray(updates.images) && updates.images.length > 0) {
      if (typeof updates.images[0] === 'string') {
        updates.images = updates.images.map((url: string, index: number) => ({
          url,
          alt: updates.name || 'Product image',
          isPrimary: index === 0,
        }));
      }
    }

    // If name is updated, regenerate slug
    if (updates.name) {
      updates.slug = generateSlug(updates.name);
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, merchantId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product },
    });
  }
);

/**
 * Delete product
 * DELETE /api/products/:id
 */
export const deleteProduct = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const merchantId = req.user?.merchantId;

    const product = await Product.findOneAndDelete({ _id: id, merchantId });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Update merchant stats
    await Merchant.findByIdAndUpdate(merchantId, {
      $inc: { 'stats.totalProducts': -1 },
    });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  }
);

/**
 * Duplicate product
 * POST /api/products/:id/duplicate
 */
export const duplicateProduct = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const merchantId = req.user?.merchantId;

    const originalProduct = await Product.findOne({ _id: id, merchantId });

    if (!originalProduct) {
      throw new AppError('Product not found', 404);
    }

    // Create copy
    const { _id, createdAt, updatedAt, ...productData } = originalProduct.toObject() as any;
    
    // Update name and slug
    productData.name = `${productData.name} (Copy)`;
    productData.slug = `${productData.slug}-copy-${Date.now()}`;
    productData.status = 'draft';
    productData.views = 0;
    productData.sales = 0;

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product duplicated successfully',
      data: { product },
    });
  }
);

/**
 * Generate product description using AI (for existing product)
 * POST /api/products/:id/generate-description
 */
export const generateProductDescription = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const merchantId = req.user?.merchantId;

    if (!merchantId) {
      throw new AppError('No merchant associated', 400);
    }

    const product = await Product.findOne({ _id: id, merchantId });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    try {
      await checkAndDeductAICredit(merchantId);

      const generatedDescription = await callAIService(
        product.name,
        product.category || 'general',
        product.price,
        product.tags || []
      );

      product.description = generatedDescription;
      product.aiGenerated = product.aiGenerated || {};
      product.aiGenerated.description = true;
      product.updatedAt = new Date();

      await product.save();

      res.status(200).json({
        success: true,
        message: 'Description generated successfully',
        data: {
          product,
          generatedDescription,
        },
      });
    } catch (error: any) {
      console.error('AI Service Error:', error.message);
      throw new AppError(
        error.message || 'Failed to connect to AI service',
        error.status || 503
      );
    }
  }
);

/**
 * Generate product description using AI (for new product, no ID needed)
 * POST /api/products/generate-description
 */
export const generateDescriptionDraft = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { productName, category, price, tags } = req.body;

    if (!productName || !productName.trim()) {
      throw new AppError('Product name is required', 400);
    }

    try {
      const merchantId = req.user?.merchantId;
      if (!merchantId) {
        throw new AppError('No merchant associated', 400);
      }
      
      await checkAndDeductAICredit(merchantId);

      const generatedDescription = await callAIService(
        productName.trim(),
        category || 'general',
        price,
        tags || []
      );

      res.status(200).json({
        success: true,
        message: 'Description generated successfully',
        data: {
          description: generatedDescription,
        },
      });
    } catch (error: any) {
      console.error('AI Service Error:', error.message);
      throw new AppError(
        error.message || 'Failed to connect to AI service',
        error.status || 503
      );
    }
  }
);

/**
 * Get featured products (public)
 * GET /api/products/featured
 */
export const getFeaturedProducts = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { merchantId } = req.query;
    const limit = parseInt(req.query.limit as string) || 6;

    if (!merchantId) {
      throw new AppError('Merchant ID required', 400);
    }

    const products = await Product.find({
      merchantId,
      status: 'active',
      isVisible: true,
      isFeatured: true,
    })
      .limit(limit)
      .sort({ sales: -1 });

    res.status(200).json({
      success: true,
      data: { products },
    });
  }
);
