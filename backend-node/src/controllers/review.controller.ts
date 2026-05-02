import { Response, NextFunction } from 'express';
import Review from '../models/Review';
import Product from '../models/Product';
import Order from '../models/Order';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../types';

// Update product average rating
const updateProductRating = async (productId: string) => {
  const stats = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId), status: 'approved' } },
    {
      $group: {
        _id: '$productId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0;
  const reviewCount = stats.length > 0 ? stats[0].reviewCount : 0;

  await Product.findByIdAndUpdate(productId, { averageRating, reviewCount });
};

import mongoose from 'mongoose';

// Get reviews for a product (public)
export const getProductReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, rating } = req.query;

  const query: any = { productId, status: 'approved' };
  if (rating) query.rating = parseInt(rating as string);

  const reviews = await Review.find(query)
    .sort({ isVerifiedPurchase: -1, helpfulVotes: -1, createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .select('-merchantId -customerEmail');

  const total = await Review.countDocuments(query);

  // Get rating distribution
  const distribution = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId), status: 'approved' } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
      distribution: distribution.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
    },
  });
});

// Check if customer can review (verified purchase)
export const checkCanReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const customerId = req.user?.customerId;

  if (!customerId) {
    return res.status(200).json({ success: true, data: { canReview: false, reason: 'not_logged_in' } });
  }

  // Check if already reviewed
  const existingReview = await Review.findOne({ productId, customerId });
  if (existingReview) {
    return res.status(200).json({ success: true, data: { canReview: false, reason: 'already_reviewed' } });
  }

  // Check if verified purchase
  const order = await Order.findOne({
    customerId,
    'items.productId': productId,
    status: { $in: ['delivered', 'completed'] },
  });

  res.status(200).json({
    success: true,
    data: {
      canReview: true,
      isVerifiedPurchase: !!order,
    },
  });
});

// Create review
export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, customerName, customerEmail, rating, title, comment, images } = req.body;
  const customerId = req.user?.customerId;
  const merchantId = req.user?.merchantId;

  if (!rating || !comment) {
    throw new AppError('Rating and comment are required', 400);
  }

  if (rating < 1 || rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const merchantIdToUse = merchantId || product.merchantId;

  // Check for existing review from this customer
  if (customerId) {
    const existing = await Review.findOne({ productId, customerId });
    if (existing) {
      throw new AppError('You have already reviewed this product', 400);
    }
  }

  // Check for verified purchase
  let isVerifiedPurchase = false;
  if (customerId) {
    const order = await Order.findOne({
      customerId,
      'items.productId': productId,
      status: { $in: ['delivered', 'completed'] },
    });
    isVerifiedPurchase = !!order;
  }

  // Auto-approve if verified purchase, otherwise pending
  const status = isVerifiedPurchase ? 'approved' : 'pending';

  const review = await Review.create({
    productId,
    merchantId: merchantIdToUse,
    customerId,
    customerName: customerName || req.user?.name || 'Anonymous',
    customerEmail,
    rating,
    title,
    comment,
    images: images || [],
    isVerifiedPurchase,
    status,
  });

  // Update product rating immediately for verified purchases
  if (isVerifiedPurchase) {
    await updateProductRating(productId);
  }

  res.status(201).json({
    success: true,
    data: review,
    message: isVerifiedPurchase ? 'Review created successfully' : 'Review submitted for approval',
  });
});

// Dashboard: Get all reviews for merchant
export const getMerchantReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const merchantId = req.user?.merchantId;
  if (!merchantId) throw new AppError('No merchant associated', 400);

  const { status = 'all', page = 1, limit = 20, productId } = req.query;

  const query: any = { merchantId };
  if (status !== 'all') query.status = status;
  if (productId) query.productId = productId;

  const reviews = await Review.find(query)
    .populate('productId', 'name slug images')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await Review.countDocuments(query);

  // Get stats
  const stats = await Review.aggregate([
    { $match: { merchantId: new mongoose.Types.ObjectId(merchantId as string) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
      stats: stats[0] || { total: 0, pending: 0, approved: 0, rejected: 0, averageRating: 0 },
    },
  });
});

// Dashboard: Approve/reject review
export const updateReviewStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const merchantId = req.user?.merchantId;
  if (!merchantId) throw new AppError('No merchant associated', 400);

  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const review = await Review.findOneAndUpdate(
    { _id: id, merchantId },
    { status },
    { new: true }
  );

  if (!review) throw new AppError('Review not found', 404);

  // Update product rating if approved
  if (status === 'approved') {
    await updateProductRating(review.productId.toString());
  }

  res.status(200).json({ success: true, data: review });
});

// Dashboard: Respond to review
export const respondToReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const merchantId = req.user?.merchantId;
  if (!merchantId) throw new AppError('No merchant associated', 400);

  const { id } = req.params;
  const { comment } = req.body;

  if (!comment?.trim()) throw new AppError('Response comment is required', 400);

  const review = await Review.findOneAndUpdate(
    { _id: id, merchantId },
    {
      merchantResponse: {
        comment,
        respondedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!review) throw new AppError('Review not found', 404);

  res.status(200).json({ success: true, data: review });
});

// Mark review as helpful
export const markHelpful = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const review = await Review.findByIdAndUpdate(
    id,
    { $inc: { helpfulVotes: 1 } },
    { new: true }
  );

  if (!review) throw new AppError('Review not found', 404);

  res.status(200).json({ success: true, data: { helpfulVotes: review.helpfulVotes } });
});

// Delete review
export const deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const merchantId = req.user?.merchantId;
  const { id } = req.params;

  const query: any = { _id: id };
  if (merchantId) query.merchantId = merchantId;

  const review = await Review.findOneAndDelete(query);
  if (!review) throw new AppError('Review not found', 404);

  // Update product rating
  await updateProductRating(review.productId.toString());

  res.status(200).json({ success: true, message: 'Review deleted' });
});

// Get review analytics for dashboard
export const getReviewAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const merchantId = req.user?.merchantId;
  if (!merchantId) throw new AppError('No merchant associated', 400);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Rating distribution
  const ratingDistribution = await Review.aggregate([
    { $match: { merchantId: new mongoose.Types.ObjectId(merchantId as string), status: 'approved' } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  // Reviews over time (last 30 days)
  const reviewsOverTime = await Review.aggregate([
    {
      $match: {
        merchantId: new mongoose.Types.ObjectId(merchantId as string),
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Top rated products
  const topProducts = await Review.aggregate([
    { $match: { merchantId: new mongoose.Types.ObjectId(merchantId as string), status: 'approved' } },
    {
      $group: {
        _id: '$productId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
    { $match: { reviewCount: { $gte: 3 } } },
    { $sort: { averageRating: -1 } },
    { $limit: 5 },
  ]);

  // Populate product details
  const populatedTopProducts = await Product.populate(topProducts, {
    path: '_id',
    select: 'name slug images price',
  });

  res.status(200).json({
    success: true,
    data: {
      ratingDistribution: ratingDistribution.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      reviewsOverTime,
      topProducts: populatedTopProducts,
    },
  });
});
