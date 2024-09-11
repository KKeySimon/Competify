require("dotenv").config();
import { CronJob } from "cron";
import prisma from "../prisma/client";
import { $Enums, Frequency } from "@prisma/client";
import { addDays, addMonths, addWeeks } from "date-fns";
import { sendEmail } from "./mailgun";

export const startCronJob = () => {
  // TODO: See if there are any upcoming events we missed and process

  CronJob.from({
    cronTime: "* * * * *", // every minute
    onTick: async () => {
      console.log("Checking notifications");
      await sendNotifications();
    },
    start: true,
    timeZone: "America/New_York",
  });
};

const sendNotifications = async () => {
  const competitionIds = await getCurrentEventCompetitions();

  if (competitionIds.size == 0) return;

  const usersInCompetitions = await getUsersInCompetitions(competitionIds);
  usersInCompetitions.forEach(
    async ({
      user_id,
      competition_id,
      user_email,
      competition_name,
      username,
    }) => {
      await sendNotification(
        user_id,
        competition_id,
        competition_name,
        user_email,
        username
      );
    }
  );
};

const sendNotification = async (
  user_id: number,
  competition_id: number,
  competition_name: string,
  user_email: string,
  username: string
) => {
  console.log(
    `${user_id}'s competition ${competition_id} is now starting to email ${user_email}`
  );
  const subject = `Competition ${competition_name} has just finished!`;
  const text = `Hello, ${username}. To see the results of ${competition_name}, visit http://localhost:5173/competition/${competition_id}`;
  const html = `<p>Hello, ${username}. To see the results of <strong>${competition_name}</strong>, visit <a href="http://localhost:5173/competition/${competition_id}">this link</a>.</p>`;
  sendEmail(user_email, subject, text, html);
};

const getUsersInCompetitions = async (competitionIds: Set<number>) => {
  // Query the users_in_competitions table
  const competitionIdsArr = Array.from(competitionIds);
  const results = await prisma.users_in_competitions.findMany({
    where: {
      competition_id: { in: competitionIdsArr },
    },
    select: {
      user_id: true,
      competition_id: true,
      competition: {
        select: {
          name: true,
        },
      },
      user: {
        select: {
          email: true,
          username: true,
        },
      },
    },
  });

  return results.map((result) => ({
    user_id: result.user_id,
    competition_id: result.competition_id,
    competition_name: result.competition.name,
    user_email: result.user.email,
    username: result.user.username,
  }));
};

const getCurrentEventCompetitions = async () => {
  const now = new Date();

  // Round down to the start of the current minute
  const startOfMinute = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    0,
    0
  );

  // Round up to the start of the next minute
  const endOfMinute = new Date(startOfMinute.getTime() + 60 * 1000); // Add one minute

  // Query for upcoming events within the current minute
  const upcomingEvents = await prisma.events.findMany({
    where: {
      upcoming: true,
      date: {
        gte: startOfMinute,
        lt: endOfMinute,
      },
    },
    select: {
      id: true,
      competition_id: true,
      date: true,
      belongs_to: {
        select: {
          repeats_every: true,
          frequency: true,
        },
      },
    },
  });

  updateUpcoming(upcomingEvents);

  const competitionIds = new Set<number>();
  upcomingEvents.forEach(({ competition_id }) => {
    competitionIds.add(competition_id);
  });
  return competitionIds;
};

interface OldUpcomingEvent {
  id: number;
  competition_id: number;
  date: Date;
  belongs_to: { repeats_every: number; frequency: $Enums.Frequency };
}

const updateUpcoming = (upcomingEvents: OldUpcomingEvent[]) => {
  upcomingEvents.forEach(async (event) => {
    await prisma.events.update({
      where: {
        id: event.id,
      },
      data: {
        upcoming: false,
      },
    });

    determineWinner(event);

    if (event.belongs_to.repeats_every !== 0) {
      let newDate: Date;
      if (event.belongs_to.frequency === Frequency.DAILY) {
        newDate = addDays(event.date, event.belongs_to.repeats_every);
      } else if (event.belongs_to.frequency === Frequency.WEEKLY) {
        newDate = addWeeks(event.date, event.belongs_to.repeats_every);
      } else if (event.belongs_to.frequency === Frequency.MONTHLY) {
        newDate = addMonths(event.date, event.belongs_to.repeats_every);
      } else {
        console.error("Invalid Frequency!");
      }
      console.log(newDate);

      await prisma.events.create({
        data: {
          competition_id: event.competition_id,
          date: newDate,
          upcoming: true,
        },
      });
    }
  });
};

const determineWinner = async (event: OldUpcomingEvent) => {
  const submissions = await prisma.submissions.findMany({
    where: {
      event_id: event.id,
    },
  });
  let best: { id: number; event_id: number; user_id: number; content: string };
  submissions.forEach((submission) => {
    // TODO: Insert priority algo (should it be largest/smallest? Biggest Percentage/Flat Increase?, etc)
    if (!best || submission.content > best.content) {
      best = submission;
    }
  });
  if (best) {
    await prisma.events.update({
      where: {
        id: event.id,
      },
      data: {
        winner_id: best.user_id,
      },
    });
  }
};
