import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { verifyAccessToken } from '../services/jwt.service';
import { AppError } from './error.middleware';

/**
 * Authenticate user with JWT
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Attach user to request
    req.user = decoded;
    
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    next(error);
  }
};

/**
 * Authorize user by role
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    
    next();
  };
};

/**
 * Ensure user is merchant owner or staff
 */
export const isMerchant = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }
  
  if (req.user.role !== 'merchant_owner' && req.user.role !== 'merchant_staff') {
    return next(new AppError('Merchant access only', 403));
  }
  
  next();
};

/**
 * Ensure user owns the merchant resource
 */
export const isMerchantOwner = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }
  
  // Check if accessing own merchant resources
  const merchantId = req.params.merchantId || req.body.merchantId;
  
  if (merchantId && req.user.merchantId !== merchantId) {
    return next(new AppError('Access denied', 403));
  }
  
  next();
};
