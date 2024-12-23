import express from "express";
import asyncHandler from "express-async-handler";
import prisma from "../prisma/client";
import { AuthRequest, CreateSubmissions } from "../types/types";
import { competitions, Frequency, SubmissionType } from "@prisma/client";
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
      orderBy: {
        date: "desc",
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
            created_at: true,
            votes: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    const formattedEvents = events.map((event) => {
      const submissionsSorted = event.submissions.sort((a, b) => {
        const aVotes = a.votes.length;
        const bVotes = b.votes.length;

        // Sort primarily by votes (descending)
        if (bVotes !== aVotes) {
          return bVotes - aVotes;
        }

        // If tied by votes, sort by created_at (earlier first)
        const aDate = new Date(a.created_at).getTime();
        const bDate = new Date(b.created_at).getTime();
        return aDate - bDate;
      });

      return {
        ...event,
        submissions: submissionsSorted,
      };
    });

    res.status(200).json(formattedEvents);
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

    const eventData = await prisma.events.findFirst({
      where: {
        id: eventIdNumber,
      },
      select: {
        date: true,
        is_numerical: true,
        priority: true,
        upcoming: true,
        winner: {
          select: {
            username: true,
            profile_picture_url: true,
          },
        },
        belongs_to: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    if (!eventData) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

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
        submission_type: true,
        belongs_to: {
          select: {
            username: true,
            profile_picture_url: true,
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

    res.status(200).json({
      event: eventData,
      submissions: formattedSubmissions,
    });

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
  asyncHandler(async (req: AuthRequest<any>, res, next) => {
    const currUserId = req.user.id;
    const { eventId } = req.params;
    const eventIdNumber = parseInt(eventId, 10);
    const submissionText = req.body.content.submission;
    let inputType: SubmissionType;
    switch (req.body.content.inputType.toLowerCase()) {
      case "text":
        inputType = SubmissionType.TEXT;
        break;
      case "url":
        inputType = SubmissionType.URL;
        break;
      case "image":
        inputType = SubmissionType.IMAGE_URL;
        break;
      default:
        throw new Error("Invalid input type");
    }

    const event = await prisma.events.findFirst({
      where: {
        id: eventIdNumber,
      },
    });
    let submissionNumber;
    if (event.is_numerical) {
      submissionNumber = parseInt(submissionText, 10);
    } else {
      if (submissionText.length > 200) {
        res
          .status(400)
          .json({ message: "Submission exceeds max length (200)." });
        return;
      }
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
      let updatedSubmission = await prisma.submissions.update({
        where: {
          id: existingSubmission.id,
        },
        data: event.is_numerical
          ? { content_number: submissionNumber }
          : {
              content: submissionText,
              submission_type: inputType,
            },
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
          submission_type: true,
          _count: {
            select: {
              votes: true,
            },
          },
        },
      });

      const formattedSubmissions = {
        ...updatedSubmission,
        vote_count: updatedSubmission._count.votes,
      };
      res.status(200).json(formattedSubmissions);
      return;
    } else {
      const submission = await prisma.submissions.create({
        data: event.is_numerical
          ? {
              event_id: eventIdNumber,
              user_id: currUserId,
              content_number: submissionNumber,
            }
          : {
              event_id: eventIdNumber,
              user_id: currUserId,
              content: submissionText,
              submission_type: inputType,
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
      const formattedSubmissions = {
        ...submission,
        vote_count: submission._count.votes,
      };
      res.status(201).json(formattedSubmissions);
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
