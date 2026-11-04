import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { User } from "../models/user.model";
import { Auth } from "../models/auth.model";
import { IUser } from "../interfaces/user.interface";
import { UserRole } from "../constants/roles";
import { AppError } from "../utils/app-error";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

/**
 * Authentication middleware to verify JWT access tokens
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required. No Bearer token provided.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication token is missing.",
      });
      return;
    }

    const decoded = verifyAccessToken(token);

    const auth = await Auth.findOne({
      $or: [{ _id: decoded.userId }, { user: decoded.userId }],
    });

    if (!auth || !auth.isActive) {
      res.status(401).json({
        success: false,
        message: "Account not found or deactivated.",
      });
      return;
    }

    const user = await User.findById(auth.user);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: "User profile not found or deactivated.",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: "Invalid or malformed authentication token.",
    });
    return;
  }
};

/**
 * RBAC authorization middleware to restrict endpoints to specified roles
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("User is not authenticated.", 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(
        new AppError(
          `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
          403,
        ),
      );
      return;
    }

    next();
  };
};

/**
 * Middleware ensuring Department Admins only operate within their assigned department
 */
export const requireDepartmentScope = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    next(new AppError("User is not authenticated.", 401));
    return;
  }

  // Super Admin has university-wide scope
  if (req.user.role === UserRole.SUPER_ADMIN) {
    next();
    return;
  }

  const userDeptId = req.user.department?.toString();

  const targetDeptId =
    req.params.departmentId ||
    (req.query.departmentId as string) ||
    req.body.department;

  if (targetDeptId && userDeptId && targetDeptId !== userDeptId) {
    next(
      new AppError(
        "Access denied. You cannot manage or access records outside your assigned department.",
        403,
      ),
    );
    return;
  }

  next();
};
