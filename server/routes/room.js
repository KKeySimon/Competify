/**
 * @typedef { import("@prisma/client").PrismaClient } Prisma
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();
const isAuth = require("./authMiddleware").isAuth;

router.get("/", isAuth, async (req, res, next) => {
  console.log(req.user.id);
  const rooms = await prisma.usersInRooms.findMany({
    where: {
      userId: currUserId,
    },
  });
  console.log(rooms);
});

module.exports = router;
