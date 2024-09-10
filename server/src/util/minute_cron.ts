require("dotenv").config();
import { CronJob } from "cron";
import prisma from "../prisma/client";

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
  });
  // return list of competition ids
  const competitionIds = new Set<number>();
  upcomingEvents.forEach(({ competition_id }) =>
    // TODO: Set upcoming of this event to false, create new upcoming event
    competitionIds.add(competition_id)
  );
  return competitionIds;
};
