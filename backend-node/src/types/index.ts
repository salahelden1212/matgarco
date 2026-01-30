import { Request } from 'express';

// User roles
export type UserRole = 'super_admin' | 'merchant_owner' | 'merchant_staff' | 'customer';

// Subscription plans
export type SubscriptionPlan = 'free_trial' | 'starter' | 'professional' | 'business';

// Order status
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type FulfillmentStatus = 'unfulfilled' | 'partial' | 'fulfilled';

// Product status
export type ProductStatus = 'draft' | 'active' | 'archived';

// Template types
export type TemplateType = 'modern' | 'minimal' | 'luxury';

// Extend Express Request type
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    merchantId?: string;
  };
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  merchantId?: string;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
