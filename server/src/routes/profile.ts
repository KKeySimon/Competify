import express, { NextFunction, Response } from "express";
import asyncHandler from "express-async-handler";
import multer from "multer";
import { uploadProfilePicture } from "../util/s3";

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

router.post(
  "/upload",
  isAuth,
  upload.single("file"),
  asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded." });
    }

    const result = await uploadProfilePicture(
      req.file.buffer,
      "kkey-competify",
      req.user.id
    );
    res
      .status(200)
      .json({ message: "File uploaded successfully!", file: result });
  })
);

export default router;
