import { Router } from 'express';
import passport from 'passport';
import { googleCallback, appleCallback, oauthLoginHandler } from '../controllers/oauth.controller';

const router = Router();

// Google OAuth
router.get(
  '/google',
  (req, res, next) => {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      return passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
      })(req, res, next);
    } else {
      // Mock mode: Redirect directly to the mock callback
      console.log('Google Client Credentials not configured. Redirecting to Mock Google OAuth callback.');
      return res.redirect(`${req.baseUrl || '/api/auth/oauth'}/google/callback?mock=true`);
    }
  }
);

router.get(
  '/google/callback',
  (req, res, next) => {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      passport.authenticate('google', { session: false }, (err: any, user: any) => {
        if (err || !user) {
          console.error('Google OAuth authentication failed:', err);
          return res.redirect(`${process.env.DASHBOARD_URL || 'http://localhost:3002'}/login?error=authentication_failed`);
        }
        (req as any).user = user;
        return googleCallback(req, res);
      })(req, res, next);
    } else {
      try {
        // Mock Google Auth Callback
        console.log('Executing Mock Google OAuth Callback flow.');
        const mockProfile = {
          id: 'google_mock_123456',
          emails: [{ value: 'mock.google.user@example.com' }],
          displayName: 'مستخدم جوجل التجريبي', // Arabic Mock User name
          photos: [{ value: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' }],
        };

        oauthLoginHandler('google', mockProfile, (err: any, user: any) => {
          if (err) {
            console.error('Mock OAuth handler error:', err);
            return res.redirect(`${process.env.DASHBOARD_URL || 'http://localhost:3002'}/login?error=authentication_failed`);
          }
          (req as any).user = user;
          return googleCallback(req, res);
        });
      } catch (error) {
        console.error('Mock Google callback exception:', error);
        return res.redirect(`${process.env.DASHBOARD_URL || 'http://localhost:3002'}/login?error=authentication_failed`);
      }
    }
  }
);

// Apple OAuth
router.get(
  '/apple',
  passport.authenticate('apple', {
    scope: ['name', 'email'],
    session: false
  })
);

router.get(
  '/apple/callback',
  passport.authenticate('apple', { failureRedirect: '/login', session: false }),
  appleCallback
);

export default router;
