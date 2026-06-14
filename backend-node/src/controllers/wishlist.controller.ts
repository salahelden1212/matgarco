import { Response, NextFunction } from 'express';
import Customer from '../models/Customer';
import Product from '../models/Product';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../types';

/**
 * @desc    Get customer's wishlist
 * @route   GET /api/wishlist
 * @access  Private (Customer)
 */
export const getWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customerId = req.user?.customerId;
  if (!customerId) {
    res.status(200).json({ success: true, data: { items: [] } });
    return;
  }

  const customer = await Customer.findById(customerId)
    .populate({
      path: 'wishlist',
      select: 'name slug images price salePrice averageRating reviewCount status stock',
    });

  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  // Filter out any products that might be null (deleted products)
  const validItems = customer.wishlist.filter((item: any) => item && item._id);

  res.status(200).json({
    success: true,
    data: { items: validItems },
  });
});

/**
 * @desc    Add a product to wishlist
 * @route   POST /api/wishlist/add
 * @access  Private (Customer)
 */
export const addToWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customerId = req.user?.customerId;
  const { productId } = req.body;

  if (!customerId) {
    throw new AppError('Please login to add to wishlist', 401);
  }

  if (!productId) {
    throw new AppError('Product ID is required', 400);
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  // Check if already in wishlist
  if (customer.wishlist.includes(productId)) {
    res.status(200).json({
      success: true,
      message: 'Product already in wishlist',
      data: { items: customer.wishlist },
    });
    return;
  }

  // Add to wishlist
  customer.wishlist.push(productId);
  await customer.save();

  // Return populated wishlist
  const updatedCustomer = await Customer.findById(customerId)
    .populate({
      path: 'wishlist',
      select: 'name slug images price salePrice averageRating reviewCount status stock',
    });

  res.status(200).json({
    success: true,
    message: 'Added to wishlist',
    data: { items: updatedCustomer?.wishlist || [] },
  });
});

/**
 * @desc    Remove a product from wishlist
 * @route   DELETE /api/wishlist/remove/:productId
 * @access  Private (Customer)
 */
export const removeFromWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customerId = req.user?.customerId;
  const { productId } = req.params;

  if (!customerId) {
    throw new AppError('Please login to manage wishlist', 401);
  }

  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  // Remove from wishlist
  customer.wishlist = customer.wishlist.filter((id: any) => id.toString() !== productId);
  await customer.save();

  // Return populated wishlist
  const updatedCustomer = await Customer.findById(customerId)
    .populate({
      path: 'wishlist',
      select: 'name slug images price salePrice averageRating reviewCount status stock',
    });

  res.status(200).json({
    success: true,
    message: 'Removed from wishlist',
    data: { items: updatedCustomer?.wishlist || [] },
  });
});

/**
 * @desc    Check if a product is in the customer's wishlist
 * @route   GET /api/wishlist/check/:productId
 * @access  Public (optional auth)
 */
export const checkWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customerId = req.user?.customerId;
  const { productId } = req.params;

  if (!customerId) {
    res.status(200).json({
      success: true,
      data: { isInWishlist: false },
    });
    return;
  }

  const customer = await Customer.findById(customerId);
  if (!customer) {
    res.status(200).json({
      success: true,
      data: { isInWishlist: false },
    });
    return;
  }

  const isInWishlist = customer.wishlist.some((id: any) => id.toString() === productId);

  res.status(200).json({
    success: true,
    data: { isInWishlist },
  });
});

/**
 * @desc    Clear entire wishlist
 * @route   DELETE /api/wishlist/clear
 * @access  Private (Customer)
 */
export const clearWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customerId = req.user?.customerId;

  if (!customerId) {
    throw new AppError('Please login to manage wishlist', 401);
  }

  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  customer.wishlist = [];
  await customer.save();

  res.status(200).json({
    success: true,
    message: 'Wishlist cleared',
    data: { items: [] },
  });
});

/**
 * @desc    Sync guest wishlist items with server
 * @route   POST /api/wishlist/sync
 * @access  Private (Customer)
 */
export const syncWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customerId = req.user?.customerId;
  const { productIds } = req.body;

  if (!customerId) {
    throw new AppError('Please login to sync wishlist', 401);
  }

  if (!Array.isArray(productIds)) {
    throw new AppError('Product IDs array is required', 400);
  }

  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  // Add all unique product IDs to wishlist
  const existingIds = customer.wishlist.map((id: any) => id.toString());
  const newIds = productIds.filter((id: string) => !existingIds.includes(id));

  customer.wishlist.push(...newIds);
  await customer.save();

  // Return populated wishlist
  const updatedCustomer = await Customer.findById(customerId)
    .populate({
      path: 'wishlist',
      select: 'name slug images price salePrice averageRating reviewCount status stock',
    });

  res.status(200).json({
    success: true,
    message: `Synced ${newIds.length} items`,
    data: { items: updatedCustomer?.wishlist || [] },
  });
});
