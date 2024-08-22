const express = require("express");
const passport = require("passport");
const pool = require("../model/pool");
const router = express.Router();
const bcrypt = require("bcryptjs");

router.get("/", (req, res) => {
  console.log("index get request received!");
  res.json({ fruits: ["apple", "orange", "banana"] });
});

router.post("/sign-up", async (req, res, next) => {
  try {
    console.log(req.body);
    const hashedPassword = bcrypt.hash(req.body.password, 10);
    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      req.body.username,
      hashedPassword,
    ]);
    return res.status(201).json({ message: "Sign up successful!" });
  } catch (err) {
    // 23505 occurs when unique constraint is violated which in this case is the unique username constraint
    if (err.code === "23505") {
      // 409 means request can't be completed due to current state
      return res.status(409).json({ message: "Username already exists." });
    }
    return next(err);
  }
});

router.post("/login", function (req, res, next) {
  // https://github.com/jwalton/passport-api-docs?tab=readme-ov-file#reqloginuser-callback
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }

    req.login(user, next);
    return res.status(200).json({ message: "Login successful!" });
  })(req, res, next);
});

module.exports = router;
