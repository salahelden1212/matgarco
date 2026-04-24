import { Router } from 'express';
import passport from 'passport';
import { googleCallback, appleCallback } from '../controllers/oauth.controller';

const router = Router();

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  googleCallback
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
