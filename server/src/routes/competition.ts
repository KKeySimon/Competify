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
              repeats_every: true,
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
        }))
      );
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
          policy: policy,
          is_numerical: true, // TODO
          created_by: { connect: { id: req.user.id } },
        },
      });

      await prisma.events.create({
        data: {
          competition_id: createCompetition.id,
          policy: policy,
          priority: priority,
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
      const invitePromises = req.body.invites.map(
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

router.put(
  "/:id",
  isAuth,
  asyncHandler(
    async (
      req: AuthRequest<CreateCompetition>,
      res: Response,
      next
    ): Promise<void> => {
      const { id } = req.params;
      const currUserId = req.user.id;

      const competition = await prisma.competitions.findUnique({
        where: { id: Number(id) },
        include: { created_by: true },
      });

      if (!competition) {
        res.status(404).send({ message: "Competition not found" });
      }

      if (competition.created_by.id !== currUserId) {
        res
          .status(403)
          .send({ message: "Not authorized to update this competition" });
      }

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
          policy: policy,
          // is_numerical: true,
        },
      });

      await prisma.events.upsert({
        where: { id: updatedCompetition.id, upcoming: true },
        update: {
          policy: policy,
          priority: priority,
          date: upcomingEvent(updatedCompetition),
          upcoming: true,
        },
        create: {
          competition_id: updatedCompetition.id,
          policy: policy,
          priority: priority,
          date: startDate,
          upcoming: true,
        },
      });

      res.status(200).send(updatedCompetition);
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
          users_in_competitions: true,
        },
      });
      if (!competition) {
        res.status(404).send({ message: "Competition not found" });
      }
      const isUserInCompetition = competition.users_in_competitions.some(
        (uc) => uc.user_id === currUserId
      );
      if (!isUserInCompetition) {
        res
          .status(401)
          .send({ message: "No permission to view competition users" });
      }
      res.status(200).send(competition);
    }
  )
);

import eventsRoute, { upcomingEvent } from "./events";
router.use("/:competitionId/events", eventsRoute);

export default router;
