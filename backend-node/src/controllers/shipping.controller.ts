import { Response } from 'express';
import Merchant from '../models/Merchant';
import Order from '../models/Order';
import { bostaService } from '../services/bosta.service';
import { AuthRequest } from '../types';

/**
 * @desc    Get shipping configuration
 * @route   GET /api/shipping/config
 * @access  Private (Merchant)
 */
export const getShippingConfig = async (req: AuthRequest, res: Response) => {
  const merchant = await Merchant.findById(req.user?.merchantId).select('shippingConfig');
  if (!merchant) return res.status(404).json({ success: false, message: 'Merchant not found' });
  return res.status(200).json({ success: true, data: merchant.shippingConfig });
};

/**
 * @desc    Update shipping configuration
 * @route   PATCH /api/shipping/config
 * @access  Private (Merchant)
 */
export const updateShippingConfig = async (req: AuthRequest, res: Response) => {
  const { shippingConfig } = req.body;
  const merchant = await Merchant.findByIdAndUpdate(
    req.user?.merchantId,
    { shippingConfig },
    { new: true, runValidators: true }
  ).select('shippingConfig');
  if (!merchant) return res.status(404).json({ success: false, message: 'Merchant not found' });
  return res.status(200).json({ success: true, data: merchant.shippingConfig });
};

/**
 * @desc    Calculate shipping rate
 * @route   POST /api/shipping/rates
 * @access  Private (Merchant)
 */
export const calculateShippingRate = async (req: AuthRequest, res: Response) => {
  const { destinationCity, weightKg, codAmount } = req.body;

  const merchant = await Merchant.findById(req.user?.merchantId).select('shippingConfig');
  if (!merchant) return res.status(404).json({ success: false, message: 'Merchant not found' });

  const config = merchant.shippingConfig;
  const rates: Array<{ provider: string; serviceName: string; estimatedCost: number; estimatedDelivery: string }> = [];

  if (config?.flatRateEnabled && config?.flatRateAmount != null) {
    rates.push({
      provider: 'flat',
      serviceName: 'شحن عادي',
      estimatedCost: config.flatRateAmount,
      estimatedDelivery: config.estimatedDelivery || '3-5 أيام عمل',
    });
  }

  if (config?.freeShippingEnabled && config?.freeShippingThreshold != null) {
    rates.push({
      provider: 'free',
      serviceName: 'شحن مجاني',
      estimatedCost: 0,
      estimatedDelivery: config.estimatedDelivery || '3-5 أيام عمل',
    });
  }

  if (config?.cityRatesEnabled && config?.cityRates?.length) {
    const cityRate = config.cityRates.find(
      (r) => r.city.toLowerCase() === destinationCity?.toLowerCase()
    );
    if (cityRate) {
      rates.push({
        provider: 'city',
        serviceName: `شحن إلى ${cityRate.city}`,
        estimatedCost: cityRate.rate,
        estimatedDelivery: config.estimatedDelivery || '3-5 أيام عمل',
      });
    }
  }

  try {
    const bostaRate = await bostaService.calculateRate({
      originCity: 'Cairo',
      destinationCity: destinationCity || 'Cairo',
      weightKg: weightKg || 1,
      codAmount,
    });
    rates.push(bostaRate);
  } catch {
    // Bosta unavailable — return merchant-configured rates only
  }

  return res.status(200).json({ success: true, data: rates });
};

/**
 * @desc    Create shipment via Bosta
 * @route   POST /api/shipping/shipments
 * @access  Private (Merchant)
 */
export const createShipment = async (req: AuthRequest, res: Response) => {
  const { orderId } = req.body;

  const merchant = await Merchant.findById(req.user?.merchantId).select('shippingConfig bostaApiKey');
  if (!merchant) return res.status(404).json({ success: false, message: 'Merchant not found' });

  const apiKey = merchant.bostaApiKey;
  if (!apiKey) {
    return res.status(400).json({ success: false, message: 'Bosta API key not configured. Set it in shipping settings.' });
  }

  const order = await Order.findOne({ _id: orderId, merchantId: req.user?.merchantId });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const addr = order.shippingAddress;
  try {
    const result = await bostaService.createShipment({
      apiKey,
      originCity: 'Cairo',
      destinationCity: addr.city,
      destinationAddress: addr.street,
      recipientName: `${addr.firstName} ${addr.lastName}`,
      recipientPhone: addr.phone,
      weightKg: 1,
      description: `Order #${order.orderNumber}`,
    });

    order.trackingNumber = result.trackingNumber;
    order.shippingProvider = 'bosta';
    order.orderStatus = 'shipped';
    order.timeline.push({
      status: 'shipped',
      timestamp: new Date(),
      note: `Shipped via Bosta. Tracking: ${result.trackingNumber}`,
    });
    await order.save();

    return res.status(200).json({
      success: true,
      data: {
        trackingNumber: result.trackingNumber,
        labelUrl: result.labelUrl,
        estimatedDelivery: result.estimatedDelivery,
      },
    });
  } catch (err: any) {
    return res.status(502).json({
      success: false,
      message: 'Failed to create Bosta shipment',
      error: err?.response?.data || err.message,
    });
  }
};

/**
 * @desc    Track shipment via Bosta
 * @route   GET /api/shipping/track/:id
 * @access  Private (Merchant)
 */
export const trackShipment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const order = await Order.findOne({ _id: id, merchantId: req.user?.merchantId });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (!order.trackingNumber || !order.shippingProvider) {
    return res.status(400).json({ success: false, message: 'No tracking information for this order' });
  }

  const merchant = await Merchant.findById(req.user?.merchantId).select('bostaApiKey');
  const apiKey = merchant?.bostaApiKey;

  if (!apiKey) {
    return res.status(400).json({ success: false, message: 'Bosta API key not configured' });
  }

  try {
    const result = await bostaService.trackShipment(apiKey, order.trackingNumber);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(502).json({
      success: false,
      message: 'Failed to track shipment',
      error: err?.response?.data || err.message,
    });
  }
};
