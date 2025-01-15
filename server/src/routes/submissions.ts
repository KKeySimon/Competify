import express, { Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthRequest, CreateCompetition } from "../types/types";
import prisma from "../prisma/client";

const router = express.Router({ mergeParams: true });
const isAuth = require("./authMiddleware").isAuth;
const isCompetitionAuth = require("./authMiddleware").isCompetitionAuth;

router.post(
  "/:submissionId/vote/submit",
  isAuth,
  isCompetitionAuth,
  asyncHandler(async (req: AuthRequest<any>, res: Response, next) => {
    const userId = req.user.id;
    const { eventId, submissionId } = req.params;
    const submissionIdNum = parseInt(submissionId, 10);
    const eventIdNum = parseInt(eventId, 10);

    const existingVote = await prisma.votes.findUnique({
      where: {
        submission_id_user_id: {
          submission_id: submissionIdNum,
          user_id: userId,
        },
      },
    });

    if (existingVote) {
      res.status(400).json({
        success: false,
        message:
          "Duplicate vote detected. You have already voted for this submission.",
      });
      return;
    }

    const vote = await prisma.votes.create({
      data: {
        submission_id: submissionIdNum,
        user_id: userId,
      },
    });

    res.status(201).json({
      success: true,
      data: vote,
      message: "Vote created successfully.",
    });
    return;
  })
);

router.delete(
  "/:submissionId/vote/submit",
  isAuth,
  isCompetitionAuth,
  asyncHandler(async (req: AuthRequest<any>, res: Response, next) => {
    const userId = req.user.id;
    const { eventId, submissionId } = req.params;
    const submissionIdNum = parseInt(submissionId, 10);
    const eventIdNum = parseInt(eventId, 10);

    const vote = await prisma.votes.findUnique({
      where: {
        submission_id_user_id: {
          submission_id: submissionIdNum,
          user_id: userId,
        },
      },
    });

    if (!vote) {
      res.status(404).json({
        success: false,
        message: "Vote not found or already deleted.",
      });
      return;
    }

    await prisma.votes.delete({
      where: {
        submission_id_user_id: {
          submission_id: submissionIdNum,
          user_id: userId,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Vote deleted successfully.",
    });
    return;
  })
);

export default router;
