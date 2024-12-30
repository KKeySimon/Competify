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
      scope: ["identify", "email"],
      passReqToCallback: true, // Pass the request object to the callback
    },
    async (req, accessToken, refreshToken, profile, cb) => {
      try {
        const {
          id: discordId,
          username,
          email,
          avatar,
          discriminator,
        } = profile;

        const userLoggedIn = req.user; // Check if the user is already logged in

        // Check if discord_id is already linked to another account
        const { rows: discordRows } = await pool.query(
          "SELECT * FROM users WHERE discord_id = $1",
          [discordId]
        );
        const discordLinkedUser = discordRows[0];

        if (discordLinkedUser) {
          if (userLoggedIn && discordLinkedUser.id !== userLoggedIn.id) {
            return cb(null, false, {
              message:
                "This Discord account is already linked to another user.",
            });
          }
          return cb(null, discordLinkedUser); // Discord already linked for the logged-in user
        }

        if (userLoggedIn) {
          // Associate discord_id with the logged-in user's account
          await pool.query(
            "UPDATE users SET discord_id = $1, username = $2 WHERE id = $3",
            [discordId, username, userLoggedIn.id]
          );

          const { rows: updatedRows } = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [userLoggedIn.id]
          );
          return cb(null, updatedRows[0]);
        }

        // If not logged in, check if email matches an existing account
        const { rows: emailRows } = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );
        const emailUser = emailRows[0];

        if (emailUser) {
          return cb(null, false, {
            message: "email_exists",
          });
        }

        // Create a new user if no existing account matches
        let profilePictureUrl = avatar
          ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`
          : `https://cdn.discordapp.com/embed/avatars/${
              parseInt(discriminator) % 5
            }.png`;

        const { rows: newUserRows } = await pool.query(
          `INSERT INTO users (discord_id, username, email, profile_picture_url, auth_type)
           VALUES ($1, $2, $3, $4, 'DISCORD') RETURNING *`,
          [discordId, username, email, profilePictureUrl]
        );

        return cb(null, newUserRows[0]);
      } catch (err) {
        return cb(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  if (user && user.id) {
    console.log("Serializing user:", user);
    done(null, user.id);
  } else {
    done(null, null);
  }
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
