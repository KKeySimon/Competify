import prisma from "../prisma/client";
module.exports.isAuth = (req, res, next) => {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    next();
  } else {
    res
      .status(401)
      .json({ msg: "You are not authorized to view this resource" });
  }
};

module.exports.isCompetitionAuth = async (req, res, next) => {
  const currUserId = req.user.id;
  const { competitionId, eventId, submissionId } = req.params;
  const competitionIdNumber = parseInt(competitionId, 10);
  if (isNaN(competitionIdNumber)) {
    res.status(400).send({ message: "Competition ID is not a number!" });
  }
  const valid = await prisma.users_in_competitions.findFirst({
    where: {
      user_id: currUserId,
      competition_id: parseInt(competitionId),
    },
  });
  if (!valid) {
    res.status(401).send({ message: "No permission to enter competition" });
  }
  next();
};
