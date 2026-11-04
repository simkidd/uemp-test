import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../constants/roles";

import { uploadAvatar } from "../middlewares/upload.middleware";

import { reportController } from "../controllers/report.controller";

const router = Router();

router.use(authenticate);

// Audit logs alias
router.get(
  "/audit-logs",
  authorize(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN),
  reportController.getAuditLogs,
);

// Admin dashboard overview
router.get(
  "/overview",
  authorize(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN),
  adminController.getDashboardOverview,
);

// List users (with search and filters)
router.get(
  "/users",
  authorize(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN),
  adminController.getUsers,
);

// Get single user details by ID
router.get(
  "/users/:id",
  authorize(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN),
  adminController.getUserById,
);

// Create user account (creates both Auth and User, supports multipart avatar upload)
router.post(
  "/users",
  authorize(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN),
  uploadAvatar,
  adminController.createUser,
);

// Update user details / change student passport photograph (Super Admin & Dept Admin)
router.patch(
  "/users/:id",
  authorize(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN),
  uploadAvatar,
  adminController.updateUser,
);

// Activate / Deactivate / Suspend account (Super Admin only per §2.D)
router.patch(
  "/users/:id/status",
  authorize(UserRole.SUPER_ADMIN),
  adminController.setUserStatus,
);

// Reset user password
router.post(
  "/users/:id/reset-password",
  authorize(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN),
  adminController.resetPassword,
);

export const adminRoutes = router;
