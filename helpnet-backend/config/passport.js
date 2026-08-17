const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,

      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      callbackURL:
        process.env.NODE_ENV === "production"
          ? "https://helpnet-gw14.onrender.com/api/auth/google/callback"
          : "http://localhost:5000/api/auth/google/callback",

      passReqToCallback: false,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value
          .toLowerCase()
          .trim();

        
        let user = await User.findOne({ email });

        
        if (!user) {
          user = new User({
            fullName: profile.displayName,
            email,
            googleId: profile.id,
            isVerified: true,
            role: "user",
          });

          await user.save();
        }

        
        else if (!user.googleId) {
          user.googleId = profile.id;
          user.isVerified = true;

          await user.save();
        }

        return done(null, user);
      } catch (error) {
        console.error("Google authentication error:", error);

        return done(error, null);
      }
    }
  )
);

module.exports = passport;