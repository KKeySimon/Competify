require("dotenv").config();
import passport from "passport";
const LocalStrategy = require("passport-local").Strategy;
const DiscordStrategy = require("passport-discord").Strategy;
import pool from "../model/pool";
import bcrypt from "bcryptjs";

passport.use(
  new LocalStrategy(async (email, password, done) => {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE email = $1 AND auth_type::text = 'EMAIL'",
        [email]
      );
      const user = rows[0];

      if (!user) {
        return done(null, false, { message: "Incorrect email" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

var scopes = ["identify", "email"];

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? "https://competify.onrender.com/api/login/discord/callback"
          : "http://localhost:3000/api/login/discord/callback",
      scope: scopes,
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const {
          id: discordId,
          username,
          email,
          avatar,
          discriminator,
        } = profile;

        const { rows } = await pool.query(
          "SELECT * FROM users WHERE discord_id = $1",
          [profile.id]
        );
        let user = rows[0];

        if (!user) {
          // Construct the profile picture URL
          let profilePictureUrl = avatar
            ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${
                parseInt(discriminator) % 5
              }.png`;

          const insertResult = await pool.query(
            `INSERT INTO users (discord_id, username, email, profile_picture_url, auth_type)
             VALUES ($1, $2, $3, $4, 'DISCORD') RETURNING *`,
            [discordId, username, email, profilePictureUrl]
          );
          user = insertResult.rows[0];
        }

        return cb(null, user);
      } catch (err) {
        return cb(err, null);
      }
    }
  )
);
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    const user = rows[0];

    if (!user) {
      return done(null, false);
    }

    done(null, user);
  } catch (err) {
    done(err);
  }
});
