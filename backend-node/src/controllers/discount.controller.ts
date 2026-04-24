import { Response, NextFunction } from 'express';
import Discount from '../models/Discount';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../types';

export const getDiscounts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const merchantId = req.user?.merchantId;
  if (!merchantId) throw new AppError('No merchant associated', 400);

  const discounts = await Discount.find({ merchantId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: discounts });
});

export const createDiscount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const merchantId = req.user?.merchantId;
  if (!merchantId) throw new AppError('No merchant associated', 400);

  const { code, type, value, minOrderValue, maxUses, startDate, endDate, isActive } = req.body;

  if (!code || !type || value === undefined) {
    throw new AppError('Code, type, and value are required', 400);
  }

  const existing = await Discount.findOne({ merchantId, code: code.toUpperCase() });
  if (existing) throw new AppError('Discount code already exists', 400);

  const discount = await Discount.create({
    merchantId,
    code: code.toUpperCase(),
    type,
    value,
    minOrderValue: minOrderValue || 0,
    maxUses: maxUses || 0,
    startDate: startDate || new Date(),
    endDate: endDate || undefined,
    isActive: isActive !== false,
  });

  res.status(201).json({ success: true, data: discount });
});

export const updateDiscount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const merchantId = req.user?.merchantId;
  if (!merchantId) throw new AppError('No merchant associated', 400);

  const { id } = req.params;
  const discount = await Discount.findOne({ _id: id, merchantId });
  if (!discount) throw new AppError('Discount not found', 404);

  const updates = req.body;
  if (updates.code) updates.code = updates.code.toUpperCase();

  Object.assign(discount, updates);
  await discount.save();

  res.status(200).json({ success: true, data: discount });
});

export const deleteDiscount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const merchantId = req.user?.merchantId;
  if (!merchantId) throw new AppError('No merchant associated', 400);

  const discount = await Discount.findOneAndDelete({ _id: req.params.id, merchantId });
  if (!discount) throw new AppError('Discount not found', 404);

  res.status(200).json({ success: true, message: 'Discount deleted' });
});

export const validateDiscount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const merchantId = req.user?.merchantId;
  if (!merchantId) throw new AppError('No merchant associated', 400);

  const { code, orderTotal } = req.body;
  if (!code) throw new AppError('Discount code is required', 400);

  const discount = await Discount.findOne({ merchantId, code: code.toUpperCase(), isActive: true });
  if (!discount) return res.status(200).json({ success: false, message: 'Invalid discount code' });

  const now = new Date();
  if (discount.startDate && new Date(discount.startDate) > now) {
    return res.status(200).json({ success: false, message: 'Discount not yet active' });
  }
  if (discount.endDate && new Date(discount.endDate) < now) {
    return res.status(200).json({ success: false, message: 'Discount has expired' });
  }
  if (discount.maxUses && discount.usedCount >= discount.maxUses) {
    return res.status(200).json({ success: false, message: 'Discount usage limit reached' });
  }
  if (discount.minOrderValue && orderTotal < discount.minOrderValue) {
    return res.status(200).json({ success: false, message: `Minimum order value is ${discount.minOrderValue}` });
  }

  let discountAmount = 0;
  if (discount.type === 'percentage') {
    discountAmount = Math.round(orderTotal * discount.value / 100);
  } else if (discount.type === 'fixed') {
    discountAmount = discount.value;
  }

  res.status(200).json({
    success: true,
    data: {
      code: discount.code,
      type: discount.type,
      value: discount.value,
      discountAmount,
      newTotal: Math.max(0, orderTotal - discountAmount),
    },
  });
});
