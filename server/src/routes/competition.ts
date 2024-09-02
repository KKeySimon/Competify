import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
const prisma = new PrismaClient();

import express from "express";
const router = express.Router();
const isAuth = require("./authMiddleware").isAuth;
import asyncHandler from "express-async-handler";
import { AuthRequest } from "../types/types";

router.get(
  "/",
  isAuth,
  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const currUserId = req.user.id;

    const rooms = await prisma.users_in_competitions.findMany({
      where: {
        user_id: currUserId,
      },
      include: {
        competition: {
          select: {
            name: true,
            created_by: {
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
        userId: entry.user_id,
        competitionId: entry.competition_id,
        joinedAt: entry.joined_at,
        name: entry.competition.name,
        createdBy: entry.competition.created_by.username,
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
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      const createCompetition = await prisma.competitions.create({
        data: {
          name: req.body.name,
          created_by: { connect: { id: req.user.id } },
          start_time: new Date(),
          repeats_every: 0,
        },
      });

      await prisma.users_in_competitions.create({
        data: {
          user: { connect: { id: req.user.id } },
          competition: { connect: { id: createCompetition.id } },
        },
      });
      const invitePromises = req.body.inviteList.map(
        async (inviteEmail: string) => {
          const invitee = await prisma.users.findFirst({
            where: { email: inviteEmail },
          });

          if (!invitee || req.user.id === invitee.id) {
            return null;
          }

          return prisma.invites.create({
            data: {
              inviter: { connect: { id: req.user.id } },
              invitee: { connect: { id: invitee.id } },
              competition: { connect: { id: createCompetition.id } },
            },
          });
        }
      );
      const inviteAllUsers = await Promise.all(invitePromises);
      const filteredInvites = inviteAllUsers.filter(Boolean);

      res.status(201).json(filteredInvites);
    }
  )
);

// Not finished
router.get(
  "/:id",
  isAuth,
  asyncHandler(async (req: AuthRequest, res: Response, next): Promise<void> => {
    const { id } = req.params;
    const currUserId = req.user.id;
    const competition = await prisma.competitions.findFirst({
      where: { id: parseInt(id) },
    });
    const valid = await prisma.users_in_competitions.findFirst({
      where: { user_id: currUserId, competition_id: parseInt(id) },
    });
    console.log(competition);
    if (!competition) {
      res.status(404).send({ message: "Competition not found" });
    }
    if (!valid) {
      res.status(401).send({ message: "No permission to enter competition" });
    }
    res.status(200).send(valid);
  })
);

export default router;
