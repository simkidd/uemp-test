import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Auth } from "../models/auth.model";
import { asyncHandler, AppError, sendSuccess, hashPassword, comparePassword } from "../utils";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary";
import { UserRole } from "../constants/roles";

export class AuthController {
  /**
   * Log in user using email, matriculation number, or staff ID
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { identifier, email, matricNumber, staffId, password } = req.body;

    const rawId = identifier || email || matricNumber || staffId;

    if (!rawId || !password) {
      throw new AppError("Please provide login identifier and password.", 400);
    }

    const trimmedId = String(rawId).trim();

    // 1. Find user profile by email, matric number, or staff ID
    const user = await User.findOne({
      $or: [
        { email: trimmedId.toLowerCase() },
        { "studentProfile.matricNumber": trimmedId.toUpperCase() },
        { "lecturerProfile.staffId": trimmedId.toUpperCase() },
      ],
    })
      .populate("department")
      .populate("faculty")
      .populate("studentProfile.programme");

    if (!user) {
      throw new AppError("Invalid credentials.", 401);
    }

    // 2. Find associated Auth credentials document
    const auth = await Auth.findOne({ user: user._id }).select("+password");

    if (!auth) {
      throw new AppError("Authentication credentials not configured for this account.", 401);
    }

    if (!auth.isActive || !user.isActive) {
      throw new AppError(
        "Account is deactivated or suspended. Please contact the administrator.",
        403,
      );
    }

    // 3. Verify password against Auth model using comparePassword utility
    const isMatch = await comparePassword(password, auth.password);
    if (!isMatch) {
      throw new AppError("Invalid credentials.", 401);
    }

    // 4. Generate JWT tokens
    const tokenPayload = {
      userId: user._id.toString(),
      authId: auth._id.toString(),
      email: auth.email,
      role: auth.role,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Save refresh token and update last login on Auth record
    auth.refreshToken = refreshToken;
    auth.lastLogin = new Date();
    await auth.save();

    return sendSuccess(
      res,
      {
        user,
        tokens: {
          accessToken,
          refreshToken,
        },
      },
      "Logged in successfully",
    );
  });

  /**
   * Log out authenticated user and invalidate refresh token
   */
  logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user) {
      await Auth.findOneAndUpdate(
        { user: req.user._id },
        { $unset: { refreshToken: 1 } },
      );
    }

    return sendSuccess(res, null, "Logged out successfully");
  });

  /**
   * Get current authenticated user profile
   */
  getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("User not authenticated", 401);
    }

    const user = await User.findById(req.user._id)
      .populate("auth", "-password -refreshToken")
      .populate("department")
      .populate("faculty")
      .populate("studentProfile.programme")
      .populate("studentProfile.entrySession");

    return sendSuccess(res, user, "User profile retrieved successfully");
  });

  /**
   * Refresh access token
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);

      const auth = await Auth.findOne({
        _id: decoded.authId || decoded.userId,
        refreshToken,
      });

      if (!auth || !auth.isActive) {
        throw new AppError("Invalid or expired session. Please log in again.", 401);
      }

      const user = await User.findById(auth.user)
        .populate("department")
        .populate("faculty")
        .populate("studentProfile.programme");
      if (!user || !user.isActive) {
        throw new AppError("User account not found or deactivated.", 401);
      }

      const tokenPayload = {
        userId: user._id.toString(),
        authId: auth._id.toString(),
        email: auth.email,
        role: auth.role,
      };

      const newAccessToken = signAccessToken(tokenPayload);
      const newRefreshToken = signRefreshToken(tokenPayload);

      // Refresh Token Rotation: persist new refresh token
      auth.refreshToken = newRefreshToken;
      await auth.save();

      return sendSuccess(
        res,
        {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user,
        },
        "Token refreshed successfully",
      );
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }
  });

  /**
   * Change account password (updates Auth model)
   */
  changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError("Please provide current and new passwords.", 400);
    }

    if (newPassword.length < 6) {
      throw new AppError("New password must be at least 6 characters.", 400);
    }

    const auth = await Auth.findOne({ user: req.user!._id }).select("+password");
    if (!auth) {
      throw new AppError("Authentication record not found.", 404);
    }

    const isMatch = await comparePassword(currentPassword, auth.password);
    if (!isMatch) {
      throw new AppError("Current password does not match.", 400);
    }

    auth.password = await hashPassword(newPassword);
    await auth.save();

    return sendSuccess(res, null, "Password changed successfully");
  });

  /**
   * Update permitted personal profile fields (including Cloudinary avatar with publicId)
   */
  updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { phone, firstName, lastName, otherName } = req.body;

    const user = await User.findById(req.user!._id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Permitted personal profile updates:
    // Students can update phone number, but cannot alter their official passport photo or registered names
    if (user.role === UserRole.STUDENT) {
      if (req.file) {
        throw new AppError(
          "Students are not permitted to change their official passport photograph. Please contact your Department Administrator.",
          403,
        );
      }

      if (firstName !== undefined || lastName !== undefined || otherName !== undefined) {
        throw new AppError(
          "Students cannot alter their official registered name. Please apply through the Academic Affairs office.",
          403,
        );
      }
    } else {
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (otherName !== undefined) user.otherName = otherName;

      if (req.file) {
        if (user.avatar?.publicId) {
          await deleteFromCloudinary(user.avatar.publicId);
        }
        user.avatar = await uploadToCloudinary(req.file, "uemp/avatars", {
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
          ],
        });
      }
    }

    if (phone !== undefined) user.phone = phone;

    await user.save();

    return sendSuccess(res, user, "Profile updated successfully");
  });
}

export const authController = new AuthController();
