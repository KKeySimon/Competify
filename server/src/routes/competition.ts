require("dotenv").config();

import { Frequency, Priority, AuthType, competitions } from "@prisma/client";
import { Response, NextFunction } from "express";
import express from "express";
import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest, CreateCompetition } from "../types/types";
import prisma from "../prisma/client";

const router = express.Router();
const isAuth = require("./authMiddleware").isAuth;
const isCompetitionAuth = require("./authMiddleware").isCompetitionAuth;

router.get(
  "/",
  isAuth,
  asyncHandler(
    async (req: AuthRequest<{}>, res: Response, next: NextFunction) => {
      const currUserId = req.user.id;

      const competitions = await prisma.users_in_competitions.findMany({
        where: {
          user_id: currUserId,
        },
        include: {
          competition: {
            select: {
              name: true,
              created_by: {
                select: {
                  username: true,
                  profile_picture_url: true,
                },
              },
              created_at: true,
              repeats_every: true,
              events: {
                where: {
                  upcoming: true,
                },
                select: {
                  date: true,
                },
              },
              users_in_competitions: {
                select: {
                  user_id: true,
                },
              },
            },
          },
        },
      });
      res.status(200).json(
        competitions.map((entry) => ({
          userId: entry.user_id,
          competitionId: entry.competition_id,
          joinedAt: entry.joined_at,
          name: entry.competition.name,
          createdBy: entry.competition.created_by.username,
          repeatsEvery: entry.competition.repeats_every,
          profilePictureUrl: entry.competition.created_by.profile_picture_url,
          createdAt: entry.competition.created_at,
          upcoming: entry.competition.events.map((event) => event.date),
          participantCount: entry.competition.users_in_competitions.length,
        }))
      );
      return;
    }
  )
);

router.get(
  "/public",
  asyncHandler(
    async (req: AuthRequest<{}>, res: Response, next: NextFunction) => {
      try {
        const publicCompetitions = await prisma.competitions.findMany({
          where: {
            public: true,
          },
          select: {
            id: true,
            name: true,
            created_by: {
              select: {
                username: true,
                profile_picture_url: true,
              },
            },
            created_at: true,
            repeats_every: true,
            events: {
              where: {
                upcoming: true,
              },
              select: {
                date: true,
              },
            },
            users_in_competitions: {
              select: {
                user_id: true,
              },
            },
          },
        });

        res.status(200).json(
          publicCompetitions.map((competition) => ({
            competitionId: competition.id,
            name: competition.name,
            createdBy: competition.created_by.username,
            profilePictureUrl: competition.created_by.profile_picture_url,
            createdAt: competition.created_at,
            repeatsEvery: competition.repeats_every,
            upcoming: competition.events.map((event) => event.date),
            participantCount: competition.users_in_competitions.length,
          }))
        );
      } catch (error) {
        next(error);
      }
    }
  )
);

router.post(
  "/new",
  isAuth,
  asyncHandler(
    async (
      req: AuthRequest<CreateCompetition>,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      const startDate = new Date(req.body.startDate);
      if (startDate <= new Date()) {
        res.status(403).send({ message: "Start date must be in the future" });
        return;
      }

      const priority = req.body.priority;
      if (![Priority.HIGHEST, Priority.LOWEST].includes(priority)) {
        res.status(400).send({ message: "Invalid priority" });
        return;
      }

      // const policy = req.body.policy;
      // if (
      //   ![Policy.FLAT, Policy.FLAT_CHANGE, Policy.PERCENTAGE_CHANGE].includes(
      //     policy
      //   )
      // ) {
      //   res.status(400).send({ message: "Invalid policy" });
      //   return;
      // }

      let frequency: Frequency;
      switch (req.body.repeatInterval.toLowerCase()) {
        case "daily":
          frequency = Frequency.DAILY;
          break;
        case "weekly":
          frequency = Frequency.WEEKLY;
          break;
        case "monthly":
          frequency = Frequency.MONTHLY;
          break;
        default:
          throw new Error("Invalid frequency type");
      }
      let createCompetition: competitions;
      const endDate =
        req.body.repeatEvery === 0 ? undefined : new Date(req.body.endDate);

      createCompetition = await prisma.competitions.create({
        data: {
          name: req.body.name,
          start_time: startDate,
          end_time: endDate,
          repeats_every: req.body.repeatEvery,
          frequency: frequency,
          priority: priority,
          public: req.body.public,
          // policy: policy,
          is_numerical: req.body.is_numerical,
          description: req.body.description,
          created_by: { connect: { id: req.user.id } },
        },
      });

      await prisma.events.create({
        data: {
          competition_id: createCompetition.id,
          // policy: policy,
          priority: priority,
          date: startDate,
          upcoming: true,
          is_numerical: req.body.is_numerical,
        },
      });

      await prisma.users_in_competitions.create({
        data: {
          user: { connect: { id: req.user.id } },
          competition: { connect: { id: createCompetition.id } },
        },
      });
      const invitePromises = req.body.invites.map(async (invite) => {
        if (!Object.values(AuthType).includes(invite.authType as AuthType)) {
          throw new Error(`Invalid authType: ${invite.authType}`);
        }
        const authType = invite.authType as AuthType;

        const invitee = await prisma.users.findFirst({
          where: {
            username: invite.username,
            auth_type: authType,
          },
        });

        if (!invitee || req.user.id === invitee.id) {
          return null;
        }

        return prisma.invites.create({
          data: {
            inviter: { connect: { id: req.user.id } },
            invitee: { connect: { id: invitee.id } },
            competition: { connect: { id: createCompetition.id } },
          },
        });
      });

      try {
        await Promise.all(invitePromises);
      } catch (error) {
        res.status(500).json({ message: error });
      }
      const inviteAllUsers = await Promise.all(invitePromises);
      inviteAllUsers.filter(Boolean);

      res.status(201).json(createCompetition);
      return;
    }
  )
);

router.put(
  "/:id",
  isAuth,
  asyncHandler(
    async (
      req: AuthRequest<CreateCompetition>,
      res: Response
    ): Promise<void> => {
      const { id } = req.params;
      const currUserId = req.user.id;

      const competition = await prisma.competitions.findUnique({
        where: { id: Number(id) },
        include: { created_by: true },
      });

      if (!competition) {
        res.status(404).send({ message: "Competition not found" });
        return;
      }

      if (competition.created_by.id !== currUserId) {
        res
          .status(403)
          .send({ message: "Not authorized to update this competition" });
        return;
      }

      const startDate = new Date(req.body.startDate);
      if (startDate <= new Date()) {
        res.status(403).send({ message: "Start date must be in the future" });
        return;
      }

      const priority = req.body.priority;
      if (![Priority.HIGHEST, Priority.LOWEST].includes(priority)) {
        res.status(400).send({ message: "Invalid priority" });
        return;
      }

      // const policy = req.body.policy;
      // if (
      //   ![Policy.FLAT, Policy.FLAT_CHANGE, Policy.PERCENTAGE_CHANGE].includes(
      //     policy
      //   )
      // ) {
      //   res.status(400).send({ message: "Invalid policy" });
      //   return;
      // }

      let frequency: Frequency;
      switch (req.body.repeatInterval.toLowerCase()) {
        case "daily":
          frequency = Frequency.DAILY;
          break;
        case "weekly":
          frequency = Frequency.WEEKLY;
          break;
        case "monthly":
          frequency = Frequency.MONTHLY;
          break;
        default:
          res.status(400).send({ message: "Invalid frequency type" });
          return;
      }

      const endDate =
        req.body.repeatEvery === 0 ? undefined : new Date(req.body.endDate);

      const updatedCompetition = await prisma.competitions.update({
        where: { id: Number(id) },
        data: {
          name: req.body.name,
          start_time: startDate,
          end_time: endDate,
          repeats_every: req.body.repeatEvery,
          frequency: frequency,
          priority: priority,
          public: req.body.public,
          // policy: policy,
          description: req.body.description,
          is_numerical: req.body.is_numerical,
        },
      });

      const invitePromises = req.body.invites.map(async (invite) => {
        if (!Object.values(AuthType).includes(invite.authType as AuthType)) {
          throw new Error(`Invalid authType: ${invite.authType}`);
        }
        const authType = invite.authType as AuthType;

        const invitee = await prisma.users.findFirst({
          where: {
            username: invite.username,
            auth_type: authType,
          },
        });

        if (!invitee || req.user.id === invitee.id) {
          return null;
        }

        return prisma.invites.create({
          data: {
            inviter: { connect: { id: req.user.id } },
            invitee: { connect: { id: invitee.id } },
            competition: { connect: { id: updatedCompetition.id } },
          },
        });
      });

      try {
        await Promise.all(invitePromises);
      } catch (error) {
        res.status(500).json({ message: error });
      }
      const firstUpcomingEvent = await prisma.events.findFirst({
        where: {
          competition_id: updatedCompetition.id,
          upcoming: true,
        },
      });

      if (firstUpcomingEvent) {
        await prisma.events.update({
          where: { id: firstUpcomingEvent.id },
          data: {
            // policy: policy,
            priority: priority,
            date: upcomingEvent(updatedCompetition),
            upcoming: true,
            is_numerical: req.body.is_numerical,
          },
        });
      } else {
        await prisma.events.create({
          data: {
            competition_id: updatedCompetition.id,
            // policy: policy,
            priority: priority,
            date: upcomingEvent(updatedCompetition),
            upcoming: true,
            is_numerical: req.body.is_numerical,
          },
        });
      }

      res.status(200).send(updatedCompetition);
      return;
    }
  )
);

router.delete(
  "/:id",
  isAuth,
  asyncHandler(
    async (req: AuthRequest<{}>, res: Response, next): Promise<void> => {
      const { id } = req.params;
      const competitionIdNumber = parseInt(id, 10);
      if (isNaN(competitionIdNumber)) {
        res.status(400).send({ message: "Competition ID is not a number!" });
      }
      console.log("helo");

      const currUserId = req.user.id;
      const competition = await prisma.competitions.findFirst({
        where: { id: competitionIdNumber, user_id: currUserId },
      });
      if (!competition) {
        res.status(404).json({
          message: "Competition not found or not authorized to delete.",
        });
        return;
      }

      await prisma.competitions.delete({
        where: { id: competitionIdNumber },
      });

      res.status(200).json({ message: "Competition deleted successfully!" });
      return;
    }
  )
);

router.get(
  "/:id",
  isAuth,
  asyncHandler(
    async (req: AuthRequest<{}>, res: Response, next): Promise<void> => {
      const { id } = req.params;
      const currUserId = req.user.id;
      const competition = await prisma.competitions.findFirst({
        where: { id: parseInt(id) },
        include: {
          users_in_competitions: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  profile_picture_url: true,
                },
              },
            },
          },
          created_by: {
            select: {
              username: true,
              id: true,
              profile_picture_url: true,
            },
          },
        },
      });
      if (!competition) {
        res.status(404).send({ message: "Competition not found" });
        return;
      }
      if (!competition.public) {
        const isUserInCompetition = competition.users_in_competitions.some(
          (uc) => uc.user_id === currUserId
        );
        if (!isUserInCompetition) {
          res
            .status(401)
            .send({ message: "No permission to view competition users" });
          return;
        }
      }
      res.status(200).send(competition);
      return;
    }
  )
);

router.post(
  "/:competitionId/admin",
  isAuth,
  isCompetitionAuth,
  asyncHandler(
    async (req: AuthRequest<any>, res: Response, next): Promise<void> => {
      const { competitionId } = req.params;
      const { userId } = req.body;
      const currUserId = req.user.id;

      const competitionIdNumber = parseInt(competitionId, 10);
      if (isNaN(competitionIdNumber)) {
        res.status(400).json({ message: "Competition ID is not a number!" });
        return;
      }

      const competitionOwner = prisma.competitions.findFirst({
        where: { user_id: currUserId, id: competitionIdNumber },
      });

      if (!competitionOwner) {
        res.status(403).json({
          message: "Only the owner of the competition may assign admins!",
        });
        return;
      }

      const isUserInCompetition = prisma.users_in_competitions.findFirst({
        where: { user_id: userId, competition_id: competitionIdNumber },
      });
      if (!isUserInCompetition) {
        res.status(404).json({
          message: "User does not found in competition!",
        });
      }

      await prisma.users_in_competitions.update({
        where: {
          user_id_competition_id: {
            user_id: userId,
            competition_id: competitionIdNumber,
          },
        },
        data: {
          is_admin: true,
        },
      });

      res.status(200).json({
        message: `User ${userId} has been successfully assigned as an admin for competition ${competitionId}!`,
      });
      return;
    }
  )
);

router.delete(
  "/:competitionId/admin",
  isAuth,
  isCompetitionAuth,
  asyncHandler(
    async (req: AuthRequest<any>, res: Response, next): Promise<void> => {
      const { competitionId } = req.params;
      const { userId } = req.body;
      const currUserId = req.user.id;

      const competitionIdNumber = parseInt(competitionId, 10);
      if (isNaN(competitionIdNumber)) {
        res.status(400).json({ message: "Competition ID is not a number!" });
        return;
      }

      const competitionOwner = await prisma.competitions.findFirst({
        where: { user_id: currUserId, id: competitionIdNumber },
      });

      if (!competitionOwner) {
        res.status(403).json({
          message: "Only the owner of the competition may remove admins!",
        });
        return;
      }

      const isUserInCompetition = await prisma.users_in_competitions.findFirst({
        where: { user_id: userId, competition_id: competitionIdNumber },
      });

      if (!isUserInCompetition) {
        res.status(404).json({
          message: "User is not part of this competition!",
        });
        return;
      }

      await prisma.users_in_competitions.update({
        where: {
          user_id_competition_id: {
            user_id: userId,
            competition_id: competitionIdNumber,
          },
        },
        data: {
          is_admin: false,
        },
      });

      res.status(200).json({
        message: `User ${userId} has been removed as an admin for competition ${competitionId}!`,
      });
      return;
    }
  )
);

router.delete(
  "/:competitionId/kick",
  isAuth,
  isCompetitionAuth,
  asyncHandler(async (req: AuthRequest<any>, res: Response): Promise<void> => {
    const { competitionId } = req.params;
    const { userId } = req.body;
    const currUserId = req.user.id;

    const competitionIdNumber = parseInt(competitionId, 10);
    if (isNaN(competitionIdNumber)) {
      res.status(400).json({ message: "Competition ID is not a number!" });
      return;
    }

    const competition = await prisma.competitions.findFirst({
      where: { id: competitionIdNumber },
      include: {
        users_in_competitions: true,
      },
    });

    if (!competition) {
      res.status(404).json({ message: "Competition not found!" });
      return;
    }

    const isOwner = competition.user_id === currUserId;
    const isAdmin = competition.users_in_competitions.some(
      (uic) => uic.user_id === currUserId && uic.is_admin
    );

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        message: "You must be an admin or the owner to kick a user!",
      });
      return;
    }

    if (userId === competition.user_id) {
      res.status(403).json({
        message: "The owner cannot be removed from the competition!",
      });
      return;
    }

    const targetUser = competition.users_in_competitions.find(
      (uic) => uic.user_id === userId
    );

    if (!targetUser) {
      res
        .status(404)
        .json({ message: "User is not part of this competition!" });
      return;
    }

    if (!isOwner && targetUser.is_admin) {
      res.status(403).json({
        message: "Admins can only remove non-admin users!",
      });
      return;
    }

    await prisma.users_in_competitions.delete({
      where: {
        user_id_competition_id: {
          user_id: userId,
          competition_id: competitionIdNumber,
        },
      },
    });

    res.status(200).json({
      message: `User ${userId} has been removed from competition ${competitionId}!`,
    });
    return;
  })
);

router.delete(
  "/:competitionId/leave",
  isAuth,
  isCompetitionAuth,
  asyncHandler(async (req: AuthRequest<any>, res: Response): Promise<void> => {
    const { competitionId } = req.params;
    const currUserId = req.user.id;

    const competitionIdNumber = parseInt(competitionId, 10);
    if (isNaN(competitionIdNumber)) {
      res.status(400).json({ message: "Competition ID is not a number!" });
      return;
    }

    const competition = await prisma.competitions.findFirst({
      where: { id: competitionIdNumber },
    });

    if (!competition) {
      res.status(404).json({ message: "Competition not found!" });
      return;
    }

    if (competition.user_id === currUserId) {
      res.status(403).json({
        message:
          "The owner cannot leave the competition! Instead delete the competition!",
      });
      return;
    }

    const isParticipant = await prisma.users_in_competitions.findFirst({
      where: {
        user_id: currUserId,
        competition_id: competitionIdNumber,
      },
    });

    if (!isParticipant) {
      res.status(404).json({
        message: "You are not part of this competition!",
      });
      return;
    }

    await prisma.users_in_competitions.delete({
      where: {
        user_id_competition_id: {
          user_id: currUserId,
          competition_id: competitionIdNumber,
        },
      },
    });

    res.status(200).json({
      message: `You have successfully left the competition ${competitionId}!`,
    });
  })
);

router.post(
  "/:competitionId/generate-invite",
  isAuth,
  isCompetitionAuth,
  asyncHandler(async (req: AuthRequest<any>, res: Response): Promise<void> => {
    const { competitionId } = req.params;
    const currUserId = req.user.id;

    const competitionIdNumber = parseInt(competitionId, 10);
    if (isNaN(competitionIdNumber)) {
      res.status(400).json({ message: "Competition ID is not a number!" });
      return;
    }

    const competition = await prisma.competitions.findFirst({
      where: { id: competitionIdNumber },
      include: { users_in_competitions: true },
    });

    if (!competition) {
      res.status(404).json({ message: "Competition not found!" });
      return;
    }

    const isOwner = competition.user_id === currUserId;
    const isAdmin = competition.users_in_competitions.some(
      (uic) => uic.user_id === currUserId && uic.is_admin
    );

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        message: "Only the owner or admins can generate invite links!",
      });
      return;
    }

    const existingInvite = await prisma.competition_invites.findFirst({
      where: { competition_id: competitionIdNumber },
    });

    if (existingInvite) {
      res.status(200).json({
        inviteLink: `${process.env.CLIENT_URL}/join/${existingInvite.token}`,
      });
      return;
    }

    const inviteToken = uuidv4();

    await prisma.competition_invites.create({
      data: {
        competition_id: competitionIdNumber,
        token: inviteToken,
      },
    });

    res.status(200).json({
      inviteLink: `${process.env.CLINET_URL}/join/${inviteToken}`,
    });
  })
);

router.post(
  "/join/:inviteToken",
  isAuth,
  asyncHandler(async (req: AuthRequest<any>, res: Response): Promise<void> => {
    const { inviteToken } = req.params;
    const currUserId = req.user.id;

    const invite = await prisma.competition_invites.findFirst({
      where: { token: inviteToken },
    });

    if (!invite) {
      res.status(404).json({ message: "Invalid or expired invite link!" });
      return;
    }

    const isAlreadyInCompetition = await prisma.users_in_competitions.findFirst(
      {
        where: {
          user_id: currUserId,
          competition_id: invite.competition_id,
        },
      }
    );

    if (isAlreadyInCompetition) {
      res.status(400).json({
        message: "You are already a member of this competition!",
      });
      return;
    }

    await prisma.users_in_competitions.create({
      data: {
        user_id: currUserId,
        competition_id: invite.competition_id,
      },
    });

    res.status(200).json({
      message: "You have successfully joined the competition!",
    });
  })
);

import eventsRoute, { upcomingEvent } from "./events";
router.use("/:competitionId/events", eventsRoute);

export default router;
