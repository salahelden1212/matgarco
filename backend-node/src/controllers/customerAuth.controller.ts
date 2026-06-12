import { Request, Response } from 'express';
import User from '../models/User';
import Customer from '../models/Customer';
import Merchant from '../models/Merchant';
import Order from '../models/Order';
import { AppError } from '../middleware/error.middleware';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/jwt.service';
import { AuthRequest } from '../types';

/**
 * @desc    Register new customer
 * @route   POST /api/storefront/auth/register
 * @access  Public
 */
export const register = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone, subdomain } = req.body;

  if (!subdomain) {
    return res.status(400).json({ success: false, message: 'subdomain is required' });
  }

  const merchant = await Merchant.findOne({ subdomain });
  if (!merchant) {
    return res.status(404).json({ success: false, message: 'Store not found' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phone,
    role: 'customer',
  });

  let customer = await Customer.findOne({ merchantId: merchant._id, email });

  if (customer) {
    customer.userId = user._id;
    customer.firstName = firstName;
    customer.lastName = lastName;
    if (phone) customer.phone = phone;
    await customer.save();
  } else {
    customer = await Customer.create({
      merchantId: merchant._id,
      userId: user._id,
      email,
      firstName,
      lastName,
      phone,
      addresses: [],
      stats: { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 },
      acceptsMarketing: false,
    });
  }

  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    email: user.email,
    role: 'customer',
    customerId: customer._id.toString(),
    merchantId: merchant._id.toString(),
  });

  const refreshToken = generateRefreshToken({
    userId: user._id.toString(),
    email: user.email,
    role: 'customer',
    customerId: customer._id.toString(),
    merchantId: merchant._id.toString(),
  });

  return res.status(201).json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      customer: {
        _id: customer._id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        merchantId: merchant._id,
        storeName: merchant.storeName,
      },
    },
  });
};

/**
 * @desc    Login customer
 * @route   POST /api/storefront/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response) => {
  const { email, password, subdomain } = req.body;

  if (!subdomain) {
    return res.status(400).json({ success: false, message: 'subdomain is required' });
  }

  const merchant = await Merchant.findOne({ subdomain });
  if (!merchant) {
    return res.status(404).json({ success: false, message: 'Store not found' });
  }

  const user = await User.findOne({ email, role: 'customer' });
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  let customer = await Customer.findOne({ merchantId: merchant._id, userId: user._id });
  if (!customer) {
    customer = await Customer.findOne({ merchantId: merchant._id, email });
  }
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Account not found for this store' });
  }

  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    email: user.email,
    role: 'customer',
    customerId: customer._id.toString(),
    merchantId: merchant._id.toString(),
  });

  const refreshToken = generateRefreshToken({
    userId: user._id.toString(),
    email: user.email,
    role: 'customer',
    customerId: customer._id.toString(),
    merchantId: merchant._id.toString(),
  });

  return res.status(200).json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      customer: {
        _id: customer._id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
      },
    },
  });
};

/**
 * @desc    Refresh customer access token
 * @route   POST /api/storefront/auth/refresh
 * @access  Public
 */
export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token required' });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      customerId: decoded.customerId,
      merchantId: decoded.merchantId,
    });

    return res.status(200).json({ success: true, data: { accessToken } });
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

/**
 * @desc    Get customer profile
 * @route   GET /api/storefront/auth/me
 * @access  Private/Customer
 */
export const getProfile = async (req: AuthRequest, res: Response) => {
  const customerId = req.user?.customerId;
  const merchantId = req.user?.merchantId;

  if (!customerId || !merchantId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const customer = await Customer.findById(customerId);
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  const orders = await Order.find({ customerId, merchantId })
    .select('orderNumber total paymentStatus orderStatus createdAt items')
    .sort({ createdAt: -1 })
    .limit(20);

  const merchant = await Merchant.findById(merchantId).select('storeName subdomain currency');

  return res.status(200).json({
    success: true,
    data: {
      customer: {
        _id: customer._id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        addresses: customer.addresses,
        stats: customer.stats,
      },
      orders,
      store: merchant ? { storeName: merchant.storeName, subdomain: merchant.subdomain, currency: merchant.currency } : null,
    },
  });
};

/**
 * @desc    Update customer profile
 * @route   PATCH /api/storefront/auth/me
 * @access  Private/Customer
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
  const customerId = req.user?.customerId;
  if (!customerId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const { firstName, lastName, phone } = req.body;

  const customer = await Customer.findByIdAndUpdate(
    customerId,
    { $set: { firstName, lastName, phone } },
    { new: true, runValidators: true }
  );

  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  return res.status(200).json({ success: true, data: customer });
};
