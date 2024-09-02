const express = require("express");
const router = express.Router();
const isAuth = require("./authMiddleware").isAuth;
const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post(
  "/new",
  isAuth,
  asyncHandler(async (req, res, next) => {
    const { name, startTime, endTime, daysOfWeek, repeatsEvery, frequency } =
      req.body;
    const createCompetition = await prisma.competitions.create({
      data: {
        name: name,
        startTime: startTime,
        endTime: endTime,
        daysOfWeek: daysOfWeek,
        repeatsEvery: repeatsEvery,
        frequency: frequency,
      },
    });
  })
);
