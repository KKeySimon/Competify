import express from "express";
import passport from "passport";
import pool from "../model/pool";
const router = express.Router();
import bcrypt from "bcryptjs";

// Simple Authorization Check
router.get("/", (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({ message: "Authorized" });
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

router.get("/ping", (req, res, next) => {
  return res.status(200).json({ message: "Server alive!" });
});

router.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      return res
        .status(200)
        .json({ message: "Login successful!", id: user.id });
    });
  })(req, res, next);
});

router.get(
  "/login/discord",
  passport.authenticate("discord", { scope: ["identify", "email"] })
);

router.get("/login/discord/callback", (req, res, next) => {
  passport.authenticate("discord", (err, user, info) => {
    if (err || !user) {
      const message = info?.message || "unknown_error";
      return res.redirect(`${process.env.CLIENT_URL}/login?error=${message}`);
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return res.redirect(
          `${process.env.CLIENT_URL}/login?error=login_failed`
        );
      }
      return res.redirect(`${process.env.CLIENT_URL}/`);
    });
  })(req, res, next);
});

router.post("/sign-up", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res
        .status(400)
        .json({ message: "All fields are required for local registration" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, password, email) VALUES ($1, $2, $3)",
      [username, hashedPassword, email]
    );
    return res.status(201).json({ message: "Sign up successful!" });
  } catch (err) {
    // 23505 occurs when unique constraint is violated
    if (err.code === "23505") {
      // 409 means request can't be completed due to current state
      if (err.constraint == "users_username_auth_type_key") {
        return res.status(409).json({ message: "Username already in use." });
      } else if (err.constraint == "users_email_key") {
        return res.status(409).json({ message: "Email already in use." });
      } else {
        console.error("Shouldn't get here: ", err);
      }
    }
    return next(err);
  }
});

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.send("logout complete!");
  });
});

// TODO: Change naming to plural form. This is standard
import competitionRoute from "./competition";
router.use("/competition", competitionRoute);

import invitesRoute from "./invites";
router.use("/invites", invitesRoute);

import profileRoute from "./profile";
router.use("/profile", profileRoute);

module.exports = router;
