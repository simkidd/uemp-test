import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from "cloudinary";
import { ENV } from "./env.js";
import { logger } from "../utils/logger.js";
import { AppError } from "../utils/app-error.js";

// Configure Cloudinary with environment credentials
cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload an in-memory file (req.file from multer) directly to Cloudinary via upload_stream
 *
 * @param file Express.Multer.File object from req.file
 * @param folder Cloudinary target folder path (default: "uemp/avatars")
 * @param options Additional Cloudinary UploadApiOptions
 * @returns Promise<{ url: string, publicId: string }>
 */
export const uploadToCloudinary = (
  file: Express.Multer.File,
  folder: string = "uemp/avatars",
  options?: UploadApiOptions,
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(
        new AppError("No file buffer provided. Please attach a valid file.", 400),
      );
    }

    const uploadOptions: UploadApiOptions = {
      folder,
      resource_type: "auto",
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          logger.error("Cloudinary upload failed:", error);
          return reject(
            new AppError(
              error?.message || "File upload to cloud storage failed",
              500,
            ),
          );
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    uploadStream.end(file.buffer);
  });
};

/**
 * Delete an asset from Cloudinary by its publicId
 *
 * @param publicId Cloudinary asset public ID
 * @param resourceType Asset type ("image" | "raw" | "video", default: "image")
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "raw" | "video" = "image",
): Promise<any> => {
  if (!publicId) return null;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    logger.error(`Failed to delete Cloudinary asset [${publicId}]:`, error);
    throw new AppError("Failed to remove file from cloud storage.", 500);
  }
};

export { cloudinary };
