import { Response, NextFunction } from 'express';
import Product from '../models/Product';
import Order from '../models/Order';
import Customer from '../models/Customer';
import Merchant from '../models/Merchant';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../types';
import { checkAndDeductAICredit } from '../utils/aiCredit';
import { callAIService } from '../services/aiServiceClient';

export const generateSEO = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { productName, description, category, language } = req.body;

    if (!productName) {
      throw new AppError('Product name is required', 400);
    }

    try {
      const merchantId = req.user?.merchantId;
      if (!merchantId) {
        throw new AppError('No merchant associated', 400);
      }
      
      await checkAndDeductAICredit(merchantId);

      const result = await callAIService('/api/generate-seo', {
        productName,
        description: description || '',
        category: category || 'general',
        language: language || 'ar',
      });

      res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error: any) {
      console.error('AI SEO Error:', error.message);
      throw new AppError(error.message || 'Failed to generate SEO data', 503);
    }
  }
);

export const generateAnalyticsInsights = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const merchantId = req.user?.merchantId;
    if (!merchantId) {
      throw new AppError('No merchant associated', 400);
    }

    const { question, language } = req.body;

    try {
      await checkAndDeductAICredit(merchantId);

      const [products, orders, customers, merchant] = await Promise.all([
        Product.find({ merchantId }).select('name price quantity category status views sales').limit(50),
        Order.find({ merchantId }).select('orderNumber total orderStatus paymentStatus createdAt items').sort({ createdAt: -1 }).limit(50),
        Customer.find({ merchantId }).select('firstName lastName email stats').limit(50),
        Merchant.findById(merchantId).select('storeName subscriptionPlan stats'),
      ]);

      const analyticsData = {
        storeName: merchant?.storeName,
        plan: merchant?.subscriptionPlan,
        stats: merchant?.stats,
        products: {
          total: products.length,
          byStatus: products.reduce((acc: any, p: any) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
          }, {}),
          topProducts: products.sort((a: any, b: any) => (b.sales || 0) - (a.sales || 0)).slice(0, 5).map((p: any) => ({
            name: p.name,
            sales: p.sales,
            views: p.views,
            price: p.price,
          })),
          lowStock: products.filter((p: any) => p.quantity <= (p.lowStockThreshold || 5)).map((p: any) => ({
            name: p.name,
            quantity: p.quantity,
          })),
        },
        orders: {
          total: orders.length,
          byStatus: orders.reduce((acc: any, o: any) => {
            acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
            return acc;
          }, {}),
          totalRevenue: orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
          recentOrders: orders.slice(0, 10).map((o: any) => ({
            orderNumber: o.orderNumber,
            total: o.total,
            status: o.orderStatus,
            date: o.createdAt,
          })),
        },
        customers: {
          total: customers.length,
        },
      };

      const result = await callAIService('/api/analytics/insights', {
        analyticsData,
        question: question || '',
        language: language || 'ar',
      });

      res.status(200).json({
        success: true,
        data: {
          insights: result.insights,
          analyticsData,
        },
      });
    } catch (error: any) {
      console.error('AI Analytics Error:', error.message);
      throw new AppError(error.message || 'Failed to generate insights', 503);
    }
  }
);

export const generateProductRecommendations = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const merchantId = req.user?.merchantId;
    if (!merchantId) {
      throw new AppError('No merchant associated', 400);
    }

    try {
      await checkAndDeductAICredit(merchantId);

      const [products, orders] = await Promise.all([
        Product.find({ merchantId }).select('name price quantity category status sales').limit(30),
        Order.find({ merchantId }).select('items total orderStatus createdAt').sort({ createdAt: -1 }).limit(30),
      ]);

      const result = await callAIService('/api/analytics/product-recommendations', {
        products: products.map((p: any) => ({
          name: p.name,
          price: p.price,
          quantity: p.quantity,
          category: p.category,
          status: p.status,
          sales: p.sales,
        })),
        orders: orders.map((o: any) => ({
          items: o.items,
          total: o.total,
          status: o.orderStatus,
          date: o.createdAt,
        })),
      });

      res.status(200).json({
        success: true,
        data: { recommendations: result.recommendations },
      });
    } catch (error: any) {
      console.error('AI Recommendations Error:', error.message);
      throw new AppError(error.message || 'Failed to generate recommendations', 503);
    }
  }
);

export const generateCustomerInsights = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const merchantId = req.user?.merchantId;
    if (!merchantId) {
      throw new AppError('No merchant associated', 400);
    }

    try {
      await checkAndDeductAICredit(merchantId);

      const [customers, orders] = await Promise.all([
        Customer.find({ merchantId }).select('firstName lastName email stats').limit(50),
        Order.find({ merchantId }).select('customerId customerInfo total orderStatus createdAt').sort({ createdAt: -1 }).limit(50),
      ]);

      const result = await callAIService('/api/analytics/customer-insights', {
        customers: customers.map((c: any) => ({
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          stats: c.stats,
        })),
        orders: orders.map((o: any) => ({
          customer: o.customerInfo,
          total: o.total,
          status: o.orderStatus,
          date: o.createdAt,
        })),
      });

      res.status(200).json({
        success: true,
        data: { insights: result.insights },
      });
    } catch (error: any) {
      console.error('AI Customer Insights Error:', error.message);
      throw new AppError(error.message || 'Failed to generate customer insights', 503);
    }
  }
);

export const assistantChat = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const merchantId = req.user?.merchantId;
    if (!merchantId) {
      throw new AppError('No merchant associated', 400);
    }

    const { message, conversationHistory } = req.body;

    if (!message) {
      throw new AppError('Message is required', 400);
    }

    try {
      await checkAndDeductAICredit(merchantId);

      const merchant = await Merchant.findById(merchantId).select('storeName subscriptionPlan stats');

      const storeContext = {
        storeName: merchant?.storeName,
        plan: merchant?.subscriptionPlan,
        totalProducts: merchant?.stats?.totalProducts || 0,
        totalOrders: merchant?.stats?.totalOrders || 0,
        totalRevenue: merchant?.stats?.totalRevenue || 0,
      };

      const result = await callAIService('/api/assistant/chat', {
        message,
        storeContext,
        conversationHistory: conversationHistory || [],
      });

      res.status(200).json({
        success: true,
        data: { response: result.response },
      });
    } catch (error: any) {
      console.error('AI Assistant Error:', error.message);
      throw new AppError(error.message || 'Failed to get assistant response', 503);
    }
  }
);

export const generateAltText = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { productName, imageContext, language } = req.body;

    if (!productName) {
      throw new AppError('Product name is required', 400);
    }

    try {
      const merchantId = req.user?.merchantId;
      if (!merchantId) throw new AppError('No merchant associated', 400);

      await checkAndDeductAICredit(merchantId);

      const result = await callAIService('/api/generate-alt-text', {
        productName,
        imageContext: imageContext || '',
        language: language || 'ar',
      });

      res.status(200).json({ success: true, data: { altText: result.altText } });
    } catch (error: any) {
      console.error('AI Alt Text Error:', error.message);
      throw new AppError(error.message || 'Failed to generate alt text', 503);
    }
  }
);

export const generateMarketingCopy = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { productName, description, audience, language } = req.body;

    if (!productName) {
      throw new AppError('Product name is required', 400);
    }

    try {
      const merchantId = req.user?.merchantId;
      if (!merchantId) throw new AppError('No merchant associated', 400);

      await checkAndDeductAICredit(merchantId);

      const result = await callAIService('/api/generate-marketing-copy', {
        productName,
        description: description || '',
        audience: audience || '',
        language: language || 'ar',
      });

      res.status(200).json({ success: true, data: { marketingCopy: result.marketingCopy } });
    } catch (error: any) {
      console.error('AI Marketing Error:', error.message);
      throw new AppError(error.message || 'Failed to generate marketing copy', 503);
    }
  }
);

export const predictSales = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { language } = req.body;

    try {
      const merchantId = req.user?.merchantId;
      if (!merchantId) throw new AppError('No merchant associated', 400);

      await checkAndDeductAICredit(merchantId);

      const [products, orders] = await Promise.all([
        Product.find({ merchantId }).select('name price quantity category status sales createdAt').limit(30),
        Order.find({ merchantId }).select('total items orderStatus createdAt').sort({ createdAt: -1 }).limit(50),
      ]);

      const salesData = orders.map((o: any) => ({
        total: o.total,
        items: o.items?.length || 0,
        status: o.orderStatus,
        date: o.createdAt,
      }));

      const result = await callAIService('/api/predict-sales', {
        salesData,
        productsData: products,
        language: language || 'ar',
      });

      res.status(200).json({ success: true, data: { predictions: result.predictions } });
    } catch (error: any) {
      console.error('AI Prediction Error:', error.message);
      throw new AppError(error.message || 'Failed to generate predictions', 503);
    }
  }
);

export const generateCategorySuggestion = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { productName, description, language } = req.body;

    if (!productName) {
      throw new AppError('Product name is required', 400);
    }

    try {
      const merchantId = req.user?.merchantId;
      if (!merchantId) {
        throw new AppError('No merchant associated', 400);
      }

      await checkAndDeductAICredit(merchantId);

      const result = await callAIService('/api/suggest-categories', {
        productName,
        description: description || '',
        language: language || 'ar',
      });

      res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error: any) {
      console.error('AI Category Error:', error.message);
      throw new AppError(error.message || 'Failed to suggest categories', 503);
    }
  }
);

export const generateTags = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { productName, category, features, language } = req.body;

    if (!productName) {
      throw new AppError('Product name is required', 400);
    }

    try {
      const merchantId = req.user?.merchantId;
      if (!merchantId) throw new AppError('No merchant associated', 400);

      await checkAndDeductAICredit(merchantId);

      const result = await callAIService('/api/generate-tags', {
        productName,
        category: category || '',
        features: features || [],
        language: language || 'ar',
      });

      res.status(200).json({ success: true, data: result.data });
    } catch (error: any) {
      console.error('AI Tags Error:', error.message);
      throw new AppError(error.message || 'Failed to generate tags', 503);
    }
  }
);

export const generateStoreSEO = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { storeName, description, industry, language } = req.body;

    if (!storeName) {
      throw new AppError('Store name is required', 400);
    }

    try {
      const merchantId = req.user?.merchantId;

      if (merchantId) {
        await checkAndDeductAICredit(merchantId);
      }

      const result = await callAIService('/api/generate-store-seo', {
        storeName,
        description: description || '',
        industry: industry || '',
        language: language || 'ar',
      });

      res.status(200).json({ success: true, data: result.data });
    } catch (error: any) {
      console.error('AI Store SEO Error:', error.message);
      throw new AppError(error.message || 'Failed to generate store SEO', 503);
    }
  }
);

export const generateBrandingSuggestions = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { businessName, businessType, industry, description, language } = req.body;

    if (!businessName) {
      throw new AppError('Business name is required', 400);
    }

    try {
      const merchantId = req.user?.merchantId;

      // Deduct credit only if merchant exists (during onboarding there's no merchant yet)
      if (merchantId) {
        await checkAndDeductAICredit(merchantId);
      }

      const result = await callAIService('/api/suggest-branding', {
        businessName,
        businessType: businessType || '',
        industry: industry || '',
        description: description || '',
        language: language || 'ar',
      });

      res.status(200).json({ success: true, data: result.data });
    } catch (error: any) {
      console.error('AI Branding Error:', error.message);
      throw new AppError(error.message || 'Failed to generate branding suggestions', 503);
    }
  }
);

export const getAIUsage = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const merchantId = req.user?.merchantId;
    if (!merchantId) {
      throw new AppError('No merchant associated', 400);
    }

    const merchant = await Merchant.findById(merchantId).select('limits subscriptionPlan');
    if (!merchant) {
      throw new AppError('Merchant not found', 404);
    }

    const creditsPerMonth = merchant.limits.aiCreditsPerMonth;
    const creditsUsed = merchant.limits.aiCreditsUsed;
    const creditsRemaining = creditsPerMonth === -1 ? -1 : Math.max(0, creditsPerMonth - creditsUsed);
    const usagePercent = creditsPerMonth === -1 ? 0 : Math.round((creditsUsed / creditsPerMonth) * 100);

    res.status(200).json({
      success: true,
      data: {
        plan: merchant.subscriptionPlan,
        creditsPerMonth,
        creditsUsed,
        creditsRemaining,
        usagePercent,
        isUnlimited: creditsPerMonth === -1,
      },
    });
  }
);

export const suggestActions = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const merchantId = req.user?.merchantId;
    if (!merchantId) {
      throw new AppError('No merchant associated', 400);
    }

    try {
      await checkAndDeductAICredit(merchantId);

      const merchant = await Merchant.findById(merchantId).select('storeName subscriptionPlan stats');

      const storeContext = {
        storeName: merchant?.storeName,
        plan: merchant?.subscriptionPlan,
        totalProducts: merchant?.stats?.totalProducts || 0,
        totalOrders: merchant?.stats?.totalOrders || 0,
        totalRevenue: merchant?.stats?.totalRevenue || 0,
      };

      const result = await callAIService('/api/assistant/suggest-actions', {
        storeContext,
      });

      res.status(200).json({
        success: true,
        data: { suggestions: result.suggestions },
      });
    } catch (error: any) {
      console.error('AI Suggestions Error:', error.message);
      throw new AppError(error.message || 'Failed to get suggestions', 503);
    }
  }
);
