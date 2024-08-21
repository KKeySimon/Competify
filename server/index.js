const express = require("express");
const index = express.Router();

index.get("/", (req, res) => {
  console.log("index get request received!");
  res.json({ fruits: ["apple", "orange", "banana"] });
});

module.exports = index;
