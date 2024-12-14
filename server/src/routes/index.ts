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
  return res.status(200).json({message: "Server alive!"});
})

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

router.post("/sign-up", async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await pool.query(
      "INSERT INTO users (username, password, email) VALUES ($1, $2, $3)",
      [req.body.username, hashedPassword, req.body.email]
    );
    return res.status(201).json({ message: "Sign up successful!" });
  } catch (err) {
    // 23505 occurs when unique constraint is violated which in this case is the unique username constraint
    if (err.code === "23505") {
      // 409 means request can't be completed due to current state
      return res.status(409).json({ message: "Username already exists" });
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
