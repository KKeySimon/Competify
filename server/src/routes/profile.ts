require("dotenv").config();

import express, { NextFunction, Response } from "express";
import asyncHandler from "express-async-handler";
import multer from "multer";
import { uploadProfilePicture } from "../util/s3";
import sharp from "sharp";
import prisma from "../prisma/client";
import { AuthRequest } from "../types/types";

const router = express.Router();
const isAuth = require("./authMiddleware").isAuth;

const fileFilter = (req, file, cb) => {
  const validImageTypes = ["image/jpeg", "image/png"];
  if (validImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG files are allowed."),
      false
    );
  }
};

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

const getProfile = async (userId: number) => {
  const profile = await prisma.users.findFirst({
    where: { id: userId },
    select: {
      profile_picture_url: true,
      username: true,
      auth_type: true,
      discord_id: true,
      submissions: {
        select: {
          id: true,
          content: true,
          content_number: true,
          submission_type: true,
          created_at: true,
          event_id: true,
          event: {
            select: {
              is_numerical: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      },
    },
  });

  if (!profile) {
    throw new Error("User not found");
  }

  const url =
    profile.profile_picture_url ||
    `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/profile_pictures/profile_default.jpg`;

  const submissions = profile.submissions.map((submission) => ({
    ...submission,
    is_numerical: submission.event.is_numerical,
  }));

  return {
    url,
    authType: profile.auth_type,
    username: profile.username,
    discord_id: profile.discord_id ? profile.discord_id.toString() : null, // Convert BigInt to string
    submissions: submissions,
  };
};

const getNumberOfWins = async (userId: number) => {
  const wins = await prisma.events.count({
    where: {
      winner_id: userId, // Count events where the user is the winner
    },
  });
  return wins;
};

router.get(
  "/me",
  isAuth,
  asyncHandler(async (req: AuthRequest<any>, res) => {
    if (req.user) {
      const currUserId = req.user.id;
      const profile = await getProfile(currUserId);
      const numberOfWins = await getNumberOfWins(currUserId);
      res.status(200).json({ ...profile, wins: numberOfWins, id: currUserId });
    } else {
      res.status(404).json({ message: "req.user.id not provided" });
    }

    return;
  })
);

router.get(
  "/:id",
  asyncHandler(async (req: AuthRequest<any>, res) => {
    const { id } = req.params;
    if (req.user) {
      const currUserId = req.user.id;
      const profile = await getProfile(parseInt(id));
      const numberOfWins = await getNumberOfWins(parseInt(id));

      res.status(200).json({
        ...profile,
        isSelf: currUserId === parseInt(id),
        wins: numberOfWins,
      });
    } else {
      res.status(404).json({ message: "req.user.id not provided" });
    }

    return;
  })
);

router.post(
  "/upload",
  isAuth,
  upload.single("file"),
  asyncHandler(async (req: any, res: Response) => {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded." });
      return;
    }

    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize(300, 300, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .toBuffer();

    const result = await uploadProfilePicture(
      resizedImageBuffer,
      process.env.AWS_S3_BUCKET,
      req.user.id
    );

    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${result}`;

    const imageRecord = await prisma.users.update({
      data: {
        profile_picture_url: fileUrl,
      },
      where: {
        id: req.user.id,
      },
    });

    res.status(200).json({
      message: "File uploaded successfully!",
    });
    return;
  })
);

export default router;
