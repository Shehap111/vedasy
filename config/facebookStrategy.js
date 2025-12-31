import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import Client from "../models/client.js";
import dotenv from "dotenv";
dotenv.config();

console.log("FACEBOOK_APP_ID:", process.env.FACEBOOK_APP_ID);
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_REDIRECT_URI,
      profileFields: ["id", "displayName", "emails", "photos"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const avatarUrl = profile.photos?.[0]?.value;

        let user = await Client.findOne({ email });

        if (!user) {
          user = await Client.create({
            name,
            email,
            avatarUrl,
            provider: "facebook",
            isGoogleUser: false,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await Client.findById(id);
  done(null, user);
});
