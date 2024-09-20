import { Frequency, Policy, Priority, competitions } from "@prisma/client";
import { Response, NextFunction } from "express";
import express from "express";
import asyncHandler from "express-async-handler";

import { AuthRequest, CreateCompetition } from "../types/types";
import prisma from "../prisma/client";

const router = express.Router();
const isAuth = require("./authMiddleware").isAuth;

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
        }))
      );
    }
  )
);

// TODO: Apply asyncHandler on all other functions in the server
// instead of repetitive try catch. This has a unique error so
// we handle it in this method
router.post(
  "/new",
  isAuth,
  asyncHandler(
    async (
      req: AuthRequest<CreateCompetition>,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      console.log(req.body);
      const startDate = new Date(req.body.startDate);
      if (startDate <= new Date()) {
        res.status(403).send({ message: "Start date must be in the future" });
      }

      const priority = req.body.priority;
      if (![Priority.HIGHEST, Priority.LOWEST].includes(priority)) {
        res.status(400).send({ message: "Invalid priority" });
      }

      const policy = req.body.policy;
      if (
        ![Policy.FLAT, Policy.FLAT_CHANGE, Policy.PERCENTAGE_CHANGE].includes(
          policy
        )
      ) {
        res.status(400).send({ message: "Invalid policy" });
      }

      let frequency: Frequency;
      switch (req.body.repeatInterval) {
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
      if (req.body.repeat) {
        createCompetition = await prisma.competitions.create({
          data: {
            name: req.body.name,
            start_time: startDate,
            end_time: new Date(req.body.endDate),
            repeats_every: req.body.repeatEvery,
            frequency: frequency,
            priority: priority,
            policy: policy,
            is_numerical: true, // TODO
            created_by: { connect: { id: req.user.id } },
          },
        });
      } else {
        createCompetition = await prisma.competitions.create({
          data: {
            name: req.body.name,
            start_time: startDate,
            end_time: undefined,
            repeats_every: 0,
            frequency: Frequency.NONE,
            priority: priority,
            policy: policy,
            is_numerical: true, // TODO
            created_by: { connect: { id: req.user.id } },
          },
        });
      }

      await prisma.events.create({
        data: {
          competition_id: createCompetition.id,
          date: startDate,
          upcoming: true,
        },
      });

      await prisma.users_in_competitions.create({
        data: {
          user: { connect: { id: req.user.id } },
          competition: { connect: { id: createCompetition.id } },
        },
      });
      const invitePromises = req.body.inviteList.map(
        async (inviteEmail: string) => {
          const invitee = await prisma.users.findFirst({
            where: { email: inviteEmail },
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
        }
      );
      const inviteAllUsers = await Promise.all(invitePromises);
      inviteAllUsers.filter(Boolean);

      res.status(201).json(createCompetition);
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
      });
      const valid = await prisma.users_in_competitions.findFirst({
        where: { user_id: currUserId, competition_id: parseInt(id) },
      });
      if (!competition) {
        res.status(404).send({ message: "Competition not found" });
      }
      if (!valid) {
        res.status(401).send({ message: "No permission to enter competition" });
      }
      res.status(200).send(competition);
    }
  )
);

import eventsRoute from "./events";
router.use("/:competitionId/events", eventsRoute);

export default router;
