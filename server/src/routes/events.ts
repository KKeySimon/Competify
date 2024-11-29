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
        submissions: {
          select: {
            user_id: true,
            content: true,
            content_number: true,
            belongs_to: {
              select: {
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
    res.status(200).json(events);
    return;
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
    return;
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
        content_number: true,
        created_at: true,
        belongs_to: {
          select: {
            username: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    const formattedSubmissions = submissions.map((submission) => ({
      ...submission,
      vote_count: submission._count.votes,
    }));

    res.status(200).json(formattedSubmissions);
    return;
  })
);

router.get(
  "/:eventId/votes",
  isAuth,
  isCompetitionAuth,
  asyncHandler(async (req: AuthRequest<any>, res, next) => {
    const currUserId = req.user.id;
    const { eventId } = req.params;
    const eventIdNumber = parseInt(eventId, 10);
    const userVotes = await prisma.votes.findMany({
      where: {
        user_id: currUserId,
        submission: {
          event_id: eventIdNumber,
        },
      },
      select: {
        id: true,
        submission_id: true,
        created_at: true,
      },
    });

    res.status(200).json(userVotes);
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

    const event = await prisma.events.findFirst({
      where: {
        id: eventIdNumber,
      },
    });
    let contentNumber;
    if (event.is_numerical) {
      contentNumber = parseInt(content, 10);
    }

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
        data: event.is_numerical
          ? { content_number: contentNumber }
          : { content: req.body.content },
        select: {
          id: true,
          event_id: true,
          user_id: true,
          content: true,
          created_at: true,
          content_number: true,
          belongs_to: {
            select: {
              username: true,
            },
          },
        },
      });
      res.status(200).json(updatedSubmission);
      return;
    } else {
      const submission = await prisma.submissions.create({
        data: {
          event_id: eventIdNumber,
          user_id: currUserId,
          ...(event.is_numerical
            ? { content_number: contentNumber }
            : { content: req.body.content }),
        },
        select: {
          id: true,
          event_id: true,
          user_id: true,
          content: true,
          content_number: true,
          created_at: true,
          belongs_to: {
            select: {
              username: true,
            },
          },
        },
      });
      res.status(201).json(submission);
      return;
    }
  })
);

// This is if policy changes mid-way, we need to see
// when the next upcoming event is. i.e., Usually, we could
// simply mark a upcoming event as finished add the repeating
// interval as a event. But if policy changes, previous event
// can't be used for calculation
export function upcomingEvent(competition: competitions) {
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

import submissionRoute from "./submissions";
router.use("/:eventId/submissions", submissionRoute);

export default router;
