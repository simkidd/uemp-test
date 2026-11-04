import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { AppError } from "../utils/app-error";

// Configure in-memory storage so req.file has buffer available for Cloudinary streaming
const storage = multer.memoryStorage();

// Image file type filter
const imageFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("Only image files (jpeg, jpg, png, webp) are permitted.", 400));
  }
};

/**
 * Configurable single file upload middleware
 */
export const uploadSingle = (
  fieldName: string = "file",
  maxSizeInMB: number = 5,
) => {
  return multer({
    storage,
    limits: {
      fileSize: maxSizeInMB * 1024 * 1024,
    },
    fileFilter: imageFilter,
  }).single(fieldName);
};

/**
 * Preset middleware for avatar image upload (field: "avatar", max 5MB)
 */
export const uploadAvatar = uploadSingle("avatar", 5);

/**
 * Preset middleware for document upload (field: "document", max 10MB)
 */
export const uploadDocument = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
}).single("document");
