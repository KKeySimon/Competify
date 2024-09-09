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
  usersInCompetitions.forEach(async ({ user_id, competition_id }) => {
    await sendNotification(user_id, competition_id);
  });
};

const sendNotification = async (user_id, competition_id) => {
  // TODO
  console.log(`${user_id}'s competition ${competition_id} is now starting`);
};

const getUsersInCompetitions = async (competitionIds) => {
  // Query the users_in_competitions table
  const results = await prisma.users_in_competitions.findMany({
    where: {
      competition_id: {
        in: competitionIds,
      },
    },
    select: {
      user_id: true,
      competition_id: true,
    },
  });

  return results.map((result) => ({
    user_id: result.user_id,
    competition_id: result.competition_id,
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
  const competitionIds = new Set();
  upcomingEvents.forEach(({ competition_id }) =>
    // TODO: Set upcoming of this event to false, create new upcoming event
    competitionIds.add(competition_id)
  );
  return competitionIds;
};
