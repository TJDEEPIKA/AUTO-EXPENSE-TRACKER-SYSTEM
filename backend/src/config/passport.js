const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    scope: ['profile', 'email'],
    prompt: 'select_account'
  },
  // ... rest of the code
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        return done(null, user);
      }

      let email = profile.emails[0].value;
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        if (existingUser.googleId) {
          // Email already linked to another Google account
          return done(new Error('Email already linked to another Google account'), null);
        } else {
          // Merge with existing user (from signup)
          existingUser.googleId = profile.id;
          existingUser.name = profile.displayName;
          await existingUser.save();
          return done(null, existingUser);
        }
      }

      // Create new user
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email,
        totalAmount: 0
      });
      await user.save();
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
