import express from "express";
import asyncHandler from "express-async-handler";
import prisma from "../prisma/client";
import { AuthRequest, CreateSubmissions } from "../types/types";
import {
  competitions,
  Frequency,
  SubmissionType,
  events,
} from "@prisma/client";
import { addDays, addMonths, addWeeks, isBefore, isEqual } from "date-fns";

const router = express.Router({ mergeParams: true });
const isAuth = require("./authMiddleware").isAuth;
const isCompetitionAuth = require("./authMiddleware").isCompetitionAuth;
const sortSubmissions = (submissions: any[]) => {
  return submissions.sort((a, b) => {
    const aVotes = a.votes.length;
    const bVotes = b.votes.length;

    if (bVotes !== aVotes) {
      return bVotes - aVotes; // Sort by votes descending
    }

    const aDate = new Date(a.created_at).getTime();
    const bDate = new Date(b.created_at).getTime();
    return aDate - bDate; // Sort by created_at ascending
  });
};
const formatEvent = (event: any) => {
  const submissionsSorted = sortSubmissions(event.submissions);

  return {
    id: event.id,
    competition_id: event.competition_id,
    date: event.date,
    winner: event.winner
      ? {
          username: event.winner.username,
          profile_picture_url: event.winner.profile_picture_url,
        }
      : null,
    submissions: submissionsSorted.map((submission) => ({
      ...submission,
      user: {
        id: submission.user_id,
        username: submission.belongs_to.username,
        profile_picture_url: submission.belongs_to.profile_picture_url,
      },
      vote_count: submission.votes.length,
    })),
  };
};

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
            updated_at: true,
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

    const formattedEvents = events.map(formatEvent);
    res.status(200).json(formattedEvents);
    return;
  })
);

router.get(
  "/upcoming",
  isAuth,
  isCompetitionAuth,
  asyncHandler(async (req: AuthRequest<{}>, res, next) => {
    let currUserId: number;
    if (req.isBot) {
      const { discordId } = req.query;
      if (typeof discordId !== "string") {
        res.status(400).json({ message: "Invalid discordId type." });
        return;
      }
      const discordIdAsBigInt = BigInt(discordId);

      const user = await prisma.users.findUnique({
        where: { discord_id: discordIdAsBigInt },
        select: { id: true },
      });

      currUserId = user.id;
    } else {
      currUserId = req.user.id;
    }
    const { competitionId } = req.params;
    const competitionIdNumber = parseInt(competitionId, 10);
    const events = await prisma.events.findFirst({
      where: {
        competition_id: competitionIdNumber,
        upcoming: true,
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
        updated_at: true,
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
  "/upcoming/submit",
  isAuth,
  isCompetitionAuth,
  asyncHandler(async (req: AuthRequest<any>, res, next) => {
    let currUserId: number;
    if (req.isBot) {
      const { discordId } = req.query;
      if (typeof discordId !== "string") {
        res.status(400).json({ message: "Invalid discordId type." });
        return;
      }
      const discordIdAsBigInt = BigInt(discordId);

      const user = await prisma.users.findUnique({
        where: { discord_id: discordIdAsBigInt },
        select: { id: true },
      });

      currUserId = user.id;
    } else {
      currUserId = req.user.id;
    }
    const { competitionId } = req.params;
    const competitionIdNumber = parseInt(competitionId, 10);

    const competition = await prisma.competitions.findFirst({
      where: {
        id: competitionIdNumber,
      },
    });

    if (competition.public) {
      const userInCompetition = await prisma.users_in_competitions.findUnique({
        where: {
          user_id_competition_id: {
            user_id: currUserId,
            competition_id: competitionIdNumber,
          },
        },
      });

      if (!userInCompetition) {
        await prisma.users_in_competitions.create({
          data: {
            user_id: currUserId,
            competition_id: competitionIdNumber,
          },
        });
      }
    }

    const event = await prisma.events.findFirst({
      where: {
        competition_id: competitionIdNumber,
        upcoming: true,
      },
    });

    if (!event) {
      res
        .status(404)
        .json({ message: "No upcoming event available for submission." });
      return;
    }

    const eventIdNumber = event.id;

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
          ? {
              content_number: submissionNumber,
            }
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
          updated_at: true,
          content_number: true,
          belongs_to: {
            select: {
              username: true,
              profile_picture_url: true,
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
