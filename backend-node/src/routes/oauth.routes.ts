import { Router } from 'express';
import passport from 'passport';
import { googleCallback, appleCallback } from '../controllers/oauth.controller';

const router = Router();

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleCallback
);

// Apple OAuth
router.get(
  '/apple',
  passport.authenticate('apple', {
    scope: ['name', 'email'],
  })
);

router.get(
  '/apple/callback',
  passport.authenticate('apple', { failureRedirect: '/login' }),
  appleCallback
);

export default router;
