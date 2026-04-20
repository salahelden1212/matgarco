import { Request, Response } from 'express';
import User from '../models/User';
import Merchant from '../models/Merchant';
import jwt from 'jsonwebtoken';

interface OAuth2Payload {
  id: string;
  email?: string;
  displayName?: string;
  photos?: Array<{ value: string }>;
  provider: 'google' | 'apple';
}

// Generate JWT tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    if (!user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Check if merchant exists
    const merchant = await Merchant.findOne({ ownerId: user._id });

    // Redirect to client with tokens
    const redirectUrl =
      process.env.FRONTEND_URL ||
      'http://localhost:3002';
    const onboarding = merchant ? '/dashboard' : '/onboarding';

    res.redirect(
      `${redirectUrl}/auth-callback?token=${accessToken}&onboarding=${onboarding}`
    );
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}/login?error=authentication_failed`);
  }
};

export const appleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    if (!user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Check if merchant exists
    const merchant = await Merchant.findOne({ ownerId: user._id });

    // Redirect to client with tokens
    const redirectUrl =
      process.env.FRONTEND_URL ||
      'http://localhost:3002';
    const onboarding = merchant ? '/dashboard' : '/onboarding';

    res.redirect(
      `${redirectUrl}/auth-callback?token=${accessToken}&onboarding=${onboarding}`
    );
  } catch (error) {
    console.error('Apple OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}/login?error=authentication_failed`);
  }
};

export const oauthLoginHandler = async (
  provider: 'google' | 'apple',
  profile: any,
  done: Function
) => {
  try {
    const email = profile.emails?.[0]?.value;
    const displayName = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
    const oauthId = provider === 'google' ? profile.id : profile.id;
    const photoUrl = profile.photos?.[0]?.value;

    // Find or create user
    let user = await User.findOne({
      $or: [
        provider === 'google' ? { googleId: oauthId } : { appleId: oauthId },
        ...(email ? [{ email }] : []),
      ],
    });

    if (user) {
      // Update OAuth ID if not already set
      if (provider === 'google' && !user.googleId) {
        user.googleId = oauthId;
      } else if (provider === 'apple' && !user.appleId) {
        user.appleId = oauthId;
      }

      // Update profile from OAuth if not already set
      if (!user.firstName || !user.lastName) {
        const [firstName, ...lastNameParts] = displayName.split(' ');
        user.firstName = firstName || 'User';
        user.lastName = lastNameParts.join(' ') || '';
      }

      if (!user.avatar && photoUrl) {
        user.avatar = photoUrl;
      }

      user.emailVerified = true;
      await user.save();
    } else {
      // Create new user
      const [firstName, ...lastNameParts] = displayName.split(' ');
      const newUser = new User({
        email: email || `${provider}-${oauthId}@matgarco.com`,
        firstName: firstName || 'User',
        lastName: lastNameParts.join(' ') || provider.charAt(0).toUpperCase() + provider.slice(1),
        role: 'merchant_owner',
        emailVerified: true,
        isActive: true,
        avatar: photoUrl,
        ...(provider === 'google' && { googleId: oauthId }),
        ...(provider === 'apple' && { appleId: oauthId }),
      });

      // Set a temporary password (won't be used for OAuth)
      newUser.password = Math.random().toString(36).substring(2, 15);
      user = await newUser.save();
    }

    return done(null, user);
  } catch (error) {
    console.error(`${provider} OAuth error:`, error);
    return done(error);
  }
};
