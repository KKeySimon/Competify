require("dotenv").config();
import { CronJob } from "cron";
import prisma from "../prisma/client";
import { $Enums, Frequency } from "@prisma/client";
import { addDays, addMonths, addWeeks } from "date-fns";

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
    async ({ user_id, competition_id, user_email }) => {
      await sendNotification(user_id, competition_id, user_email);
    }
  );
};

const sendNotification = async (
  user_id: number,
  competition_id: number,
  user_email: string
) => {
  console.log(
    `${user_id}'s competition ${competition_id} is now starting to email ${user_email}`
  );
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
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  return results.map((result) => ({
    user_id: result.user_id,
    competition_id: result.competition_id,
    user_email: result.user.email,
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

// NOT TESTED
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

    await prisma.events.create({
      data: {
        competition_id: event.competition_id,
        date: newDate,
        upcoming: true,
      },
    });
  });
};
