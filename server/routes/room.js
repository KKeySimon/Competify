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
const asyncHandler = require("express-async-handler");

router.get(
  "/",
  isAuth,
  asyncHandler(async (req, res, next) => {
    const currUserId = req.user.id;

    /** @type {UsersInRooms[]} */
    const rooms = await prisma.usersInRooms.findMany({
      where: {
        userId: currUserId,
      },
      include: {
        room: {
          select: {
            name: true,
            createdBy: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });
    res.status(200).json(
      rooms.map((entry) => ({
        userId: entry.userId,
        roomId: entry.roomId,
        joinedAt: entry.joinedAt,
        roomName: entry.room.name,
        createdBy: entry.room.createdBy.username,
      }))
    );
  })
);

// TODO: Apply asyncHandler on all other functions in the server
// instead of repetitive try catch. This has a unique error so
// we handle it in this method
router.post(
  "/new",
  isAuth,
  asyncHandler(async (req, res, next) => {
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
      if (err.code === "P2002") {
        return res.status(409).send(err);
      }
      next(err);
    }
  })
);

module.exports = router;
