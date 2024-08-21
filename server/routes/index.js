const express = require("express");
const passport = require("passport");
const pool = require("../model/pool");
const router = express.Router();

router.get("/", (req, res) => {
  console.log("index get request received!");
  res.json({ fruits: ["apple", "orange", "banana"] });
});

router.post("/sign-up", async (req, res, next) => {
  try {
    console.log(req.body);
    // await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
    //   req.body.username,
    //   req.body.password,
    // ]);
    return res.status(201).json({ message: "Sign up successful!" });
  } catch (err) {
    return next(err);
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

module.exports = router;
