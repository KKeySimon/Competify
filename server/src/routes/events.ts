import express from "express";
import asyncHandler from "express-async-handler";
import prisma from "../prisma/client";
import { AuthRequest, CreateSubmissions } from "../types/types";
import { competitions, Frequency } from "@prisma/client";
import { addDays, addMonths, addWeeks, isBefore, isEqual } from "date-fns";

const router = express.Router({ mergeParams: true });
const isAuth = require("./authMiddleware").isAuth;
const isCompetitionAuth = require("./authMiddleware").isCompetitionAuth;

router.get(
  "/",
  isAuth,
  isCompetitionAuth,
  asyncHandler(async (req, res, next) => {
    console.log("Received");
    const { competitionId } = req.params;
    const competitionIdNumber = parseInt(competitionId, 10);

    const events = await prisma.events.findMany({
      where: {
        competition_id: competitionIdNumber,
        upcoming: false,
      },
      select: {
        competition_id: true,
        id: true,
        date: true,
        upcoming: true,
        winner_id: true,
        winner: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
    res.status(200).json(events);
  })
);

router.get(
  "/upcoming",
  isAuth,
  isCompetitionAuth,
  asyncHandler(async (req: AuthRequest<{}>, res, next) => {
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
    res.status(200).json(events);
  })
);

router.get(
  "/:eventId",
  isAuth,
  isCompetitionAuth,
  asyncHandler(async (req: AuthRequest<{}>, res, next) => {
    const currUserId = req.user.id;
    const { eventId } = req.params;
    const eventIdNumber = parseInt(eventId, 10);

    const submissions = await prisma.submissions.findMany({
      where: {
        event_id: eventIdNumber,
      },
      select: {
        id: true,
        event_id: true,
        user_id: true,
        content: true,
        belongs_to: {
          select: {
            username: true,
          },
        },
      },
    });
    res.status(200).json(submissions);
  })
);

router.post(
  "/:eventId/submit",
  isAuth,
  isCompetitionAuth,
  asyncHandler(async (req: AuthRequest<CreateSubmissions>, res, next) => {
    const currUserId = req.user.id;
    const { eventId } = req.params;
    const eventIdNumber = parseInt(eventId, 10);
    const content = req.body.content;

    const existingSubmission = await prisma.submissions.findUnique({
      where: {
        event_id_user_id: {
          event_id: eventIdNumber,
          user_id: currUserId,
        },
      },
    });

    if (existingSubmission) {
      const updatedSubmission = await prisma.submissions.update({
        where: {
          id: existingSubmission.id,
        },
        data: {
          content,
        },
        select: {
          id: true,
          event_id: true,
          user_id: true,
          content: true,
          belongs_to: {
            select: {
              username: true,
            },
          },
        },
      });
      res.status(200).json(updatedSubmission);
    } else {
      const submission = await prisma.submissions.create({
        data: {
          event_id: eventIdNumber,
          user_id: currUserId,
          content: req.body.content,
        },
        select: {
          id: true,
          event_id: true,
          user_id: true,
          content: true,
          belongs_to: {
            select: {
              username: true,
            },
          },
        },
      });
      res.status(201).json(submission);
    }
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
