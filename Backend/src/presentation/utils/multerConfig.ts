import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import { AppConstants } from "../../application/constants/AppConstants";

/**
 * Multer configuration – Presentation/Utils Layer
 * Extracted from user.routes.ts so it can be reused in any route that needs file uploads.
 */

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
      file.originalname,
    )}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedExtensions = /jpeg|jpg|png|pdf/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error(AppConstants.errors.INVALID_FILE_TYPE));
  }
};

/** Ready-to-use multer instance for profile document uploads. */
export const uploadProfileDocs = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});
