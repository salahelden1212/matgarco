import { Response, NextFunction } from 'express';
import Product from '../models/Product';
import Merchant from '../models/Merchant';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../types';
import { generateSlug } from '../utils/helpers';
import { calculatePagination } from '../utils/helpers';

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
 */
export const getProducts = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const merchantId = req.user?.merchantId;
    
    if (!merchantId) {
      throw new AppError('No merchant associated', 400);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { skip } = calculatePagination(page, limit);

    const filter: any = { merchantId };

    // Filters
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
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
