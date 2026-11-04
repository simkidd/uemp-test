import { Router } from "express";
import { reportController } from "../controllers/report.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../constants/roles";

const router = Router();

router.use(authenticate);

router.get(
  "/stats",
  authorize(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN, UserRole.LECTURER),
  reportController.getDashboardStats,
);

router.get(
  "/audit-logs",
  authorize(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN),
  reportController.getAuditLogs,
);

router.get(
  "/broadsheet",
  authorize(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN),
  reportController.getDepartmentBroadsheet,
);

export const reportRoutes = router;
