/**
 * @typedef { import("@prisma/client").PrismaClient } Prisma
 * @typedef { import("@prisma/client").usersInRooms } UsersInRooms
 * @typedef { import("@prisma/client").rooms } Rooms
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();
const isAuth = require("./authMiddleware").isAuth;

router.get("/", isAuth, async (req, res, next) => {
  const currUserId = req.user.id;
  /** @type {UsersInRooms[]} */
  const rooms = await prisma.usersInRooms.findMany({
    where: {
      userId: currUserId,
    },
  });
});

router.post("/new", isAuth, async (req, res, next) => {
  console.log("FOR FREE???");
  try {
    const createRoom = await prisma.rooms.create({
      data: {
        name: req.body.name,
        createdBy: { connect: { id: req.user.id } },
      },
    });

    const addUserToRoom = await prisma.usersInRooms.create({
      data: {
        user: { connect: { id: req.user.id } },
        room: { connect: { id: createRoom.id } },
      },
    });
    res.status(201).json({ message: "Room created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
