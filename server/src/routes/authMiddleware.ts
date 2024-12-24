import prisma from "../prisma/client";
module.exports.isAuth = (req, res, next) => {
  const botSecret = req.headers["x-bot-secret"];

  if (botSecret && botSecret === process.env.DISCORD_BOT_SECRET) {
    req.isBot = true;
    return next();
  }

  if (req.isAuthenticated()) {
    next();
  } else {
    res
      .status(401)
      .json({ msg: "You are not authorized to view this resource" });
  }
};

module.exports.isCompetitionAuth = async (req, res, next) => {
  const botSecret = req.headers["x-bot-secret"];

  if (botSecret && botSecret === process.env.DISCORD_BOT_SECRET) {
    req.isBot = true;
  }

  let currUserId: number;
  if (req.isBot) {
    const { discordId } = req.body;
    if (!discordId) {
      res
        .status(400)
        .json({ message: "Discord ID is required for bot submissions." });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { discord_id: discordId },
      select: { id: true },
    });

    if (!user) {
      res
        .status(404)
        .json({ message: "User not found for the provided Discord ID." });
      return;
    }

    currUserId = user.id;
  } else {
    currUserId = req.user.id;
  }

  const { competitionId, eventId, submissionId } = req.params;
  const competitionIdNumber = parseInt(competitionId, 10);
  if (isNaN(competitionIdNumber)) {
    res.status(400).send({ message: "Competition ID is not a number!" });
  }
  const valid = await prisma.users_in_competitions.findFirst({
    where: {
      user_id: currUserId,
      competition_id: competitionIdNumber,
    },
  });
  if (!valid) {
    res.status(401).send({ message: "No permission to enter competition" });
  }
  next();
};
