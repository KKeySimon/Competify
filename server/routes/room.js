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
    console.log(req.body);
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
      const invitePromises = req.body.inviteList.map(async (inviteEmail) => {
        const invitee = await prisma.users.findFirst({
          where: { email: inviteEmail },
        });

        if (!invitee) {
          return null;
        }

        if (req.user.id === invitee.id) {
          return null;
        }

        return prisma.invites.create({
          data: {
            inviter: { connect: { id: req.user.id } },
            invitee: { connect: { id: invitee.id } },
            room: { connect: { id: createRoom.id } },
          },
        });
      });
      const inviteAllUsers = await Promise.all(invitePromises);
      const filteredInvites = inviteAllUsers.filter(Boolean);

      res.status(201).json(filteredInvites);
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).send(err);
      }
      next(err);
    }
  })
);

// Not finished
router.get(
  "/:id",
  isAuth,
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const currUserId = req.user.id;
    try {
      const room = await prisma.rooms.findFirst({
        where: { id: parseInt(id) },
      });
      const valid = await prisma.usersInRooms.findFirst({
        where: { userId: currUserId, roomId: parseInt(id) },
      });
      console.log(room);
      if (!room) {
        return res.status(404).send({ message: "Room not found" });
      }
      if (!valid) {
        return res.status(401).send({ message: "No permission to enter room" });
      }
      return res.status(201).send(valid);
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: "An error occurred." });
    }
  })
);

module.exports = router;
