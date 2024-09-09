import express from "express";
import asyncHandler from "express-async-handler";
import prisma from "../prisma/client";
import { AuthRequest, CreateSubmissions } from "../types/types";
import { competitions, Frequency } from "@prisma/client";
import { addDays, addMonths, addWeeks, isBefore, isEqual } from "date-fns";

const router = express.Router({ mergeParams: true });
const isAuth = require("./authMiddleware").isAuth;
const isCompetitionAuth = require("./authMiddleware").isCompetitionAuth;

// Tested
router.get(
  "/upcoming",
  isAuth,
  isCompetitionAuth,
  asyncHandler(async (req: AuthRequest<{}>, res, next) => {
    res.status(500);
    const currUserId = req.user.id;
    const { competitionId } = req.params;
    const competitionIdNumber = parseInt(competitionId, 10);

    const events = await prisma.events.findFirst({
      where: {
        competition_id: competitionIdNumber,
        upcoming: true,
        belongs_to: {
          users_in_competitions: {
            some: {
              user_id: currUserId,
            },
          },
        },
      },
    });
    console.log(events);
    res.status(200).json(events);
  })
);

// ------------ EVERYTHING UNDER IS NOT TESTED ------------
router.post(
  "/:eventId/submit",
  isAuth,
  isCompetitionAuth,
  asyncHandler(async (req: AuthRequest<CreateSubmissions>, res, next) => {
    const currUserId = req.user.id;
    const { eventId } = req.params;
    const eventIdNumber = parseInt(eventId, 10);
    const submission = await prisma.submissions.create({
      data: {
        event_id: eventIdNumber,
        user_id: currUserId,
        content: req.body.content,
      },
    });
    res.status(201).json(submission);
  })
);

router.post(
  "/:eventId/edit/:submissionId",
  isAuth,
  isCompetitionAuth,
  asyncHandler(async (req: AuthRequest<CreateSubmissions>, res, next) => {
    const currUserId = req.user.id;
    const { eventId, submissionId } = req.params;
    const eventIdNumber = parseInt(eventId, 10);
    const submissionIdNumber = parseInt(submissionId, 10);
    const existingSubmission = await prisma.submissions.findUnique({
      where: { id: submissionIdNumber },
    });
    if (!existingSubmission) {
      res.status(404).send({ message: "Submission not found" });
    }
    if (existingSubmission.user_id !== currUserId) {
      res.status(401).send({
        message: "No edit permission on submission",
      });
    }
    if (existingSubmission.event_id !== eventIdNumber) {
      res.status(400).send({ message: "Wrong event id" });
    }
    const submission = await prisma.submissions.update({
      where: {
        id: submissionIdNumber,
      },
      data: {
        content: req.body.content,
      },
    });
    res.status(201).json(submission);
  })
);

// This is if policy changes mid-way, we need to see
// when the next upcoming event is. i.e., Usually, we could
// simply mark a upcoming event as finished add the repeating
// interval as a event. But if policy changes, previous event
// can't be used for calculation
function upcomingEvent(competition: competitions) {
  const now = new Date();
  let time = competition.start_time;
  if (competition.repeats_every === 0) {
    return competition.start_time;
  }
  while (isBefore(time, now) || isEqual(time, now)) {
    switch (competition.frequency) {
      case Frequency.DAILY: {
        time = addDays(time, competition.repeats_every);
        break;
      }
      case Frequency.WEEKLY: {
        time = addWeeks(time, competition.repeats_every);
        break;
      }
      case Frequency.MONTHLY: {
        time = addMonths(time, competition.repeats_every);
        break;
      }
      default: {
        console.error("should never reach this statement!");
        break;
      }
    }
  }

  return time;
}

export default router;
