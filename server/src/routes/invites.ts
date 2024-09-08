import express from "express";
import asyncHandler from "express-async-handler";
import { AuthRequest } from "../types/types";
import { HandleInvite } from "../types/types";

import prisma from "../prisma/client";

const router = express.Router();
const isAuth = require("./authMiddleware").isAuth;

// returns all invites received from logged in user
router.get(
  "/",
  isAuth,
  asyncHandler(async (req: AuthRequest<{}>, res, next) => {
    const currUserId = req.user.id;
    const invites = await prisma.invites.findMany({
      where: {
        invitee_id: currUserId,
      },
      include: {
        inviter: {
          select: {
            username: true,
          },
        },
        competition: {
          select: {
            name: true,
          },
        },
      },
    });
    res.status(200).json(
      invites.map((entry) => ({
        inviterId: entry.inviter_id,
        inviterName: entry.inviter.username,
        inviteeId: entry.invitee_id,
        competitionId: entry.competition_id,
        competitionName: entry.competition.name,
        sentAt: entry.sent_at,
      }))
    );
  })
);

router.post(
  "/handle",
  isAuth,
  asyncHandler(async (req: AuthRequest<HandleInvite>, res, next) => {
    const currUserId = req.user.id;
    const { inviter_id, competition_id } = req.body;
    const invite = await prisma.invites.findFirst({
      where: {
        invitee_id: currUserId,
        inviter_id: inviter_id,
        competition_id: competition_id,
      },
    });

    if (!invite) {
      res.status(404).send({ message: "Invite not found" });
    }

    await prisma.invites.delete({
      where: {
        inviter_id_invitee_id_competition_id: {
          inviter_id: inviter_id,
          invitee_id: currUserId,
          competition_id: competition_id,
        },
      },
    });

    await prisma.users_in_competitions.create({
      data: {
        user_id: currUserId,
        competition_id: competition_id,
      },
    });
    res.status(200).send({ message: "Successfully joined competition" });
  })
);

router.delete(
  "/handle",
  isAuth,
  asyncHandler(async (req: AuthRequest<HandleInvite>, res, next) => {
    const currUserId = req.user.id;
    const { inviter_id, competition_id } = req.body;
    const invite = await prisma.invites.findFirst({
      where: {
        invitee_id: currUserId,
        inviter_id: inviter_id,
        competition_id: competition_id,
      },
    });

    if (!invite) {
      res.status(404).send({ message: "Invite not found" });
    }

    await prisma.invites.delete({
      where: {
        inviter_id_invitee_id_competition_id: {
          inviter_id: inviter_id,
          invitee_id: currUserId,
          competition_id: competition_id,
        },
      },
    });

    res.status(200).send({ message: "Successfully rejected invite" });
  })
);

export default router;
