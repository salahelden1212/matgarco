import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as AppleStrategy } from 'passport-apple';
import User from '../models/User';
import { oauthLoginHandler } from '../controllers/oauth.controller';

// Configure Google OAuth (only if credentials are available)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/oauth/google/callback`,
      },
      (accessToken: string, refreshToken: string, profile: any, done: Function) => {
        oauthLoginHandler('google', profile, done);
      }
    )
  );
}

// Configure Apple OAuth (only if credentials are available)
if (process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_CLIENT_ID) {
  passport.use(
    'apple',
    new AppleStrategy(
      {
        teamID: process.env.APPLE_TEAM_ID,
        keyID: process.env.APPLE_KEY_ID,
        clientID: process.env.APPLE_CLIENT_ID,
        privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH || '',
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/oauth/apple/callback`,
      },
      (accessToken: string, refreshToken: string, profile: any, done: Function) => {
        oauthLoginHandler('apple', profile, done);
      }
    )
  );
}

// Serialize user
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
