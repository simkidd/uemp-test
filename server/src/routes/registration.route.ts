import { Router } from "express";
import { registrationController } from "../controllers/registration.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../constants/roles";

const router = Router();

router.use(authenticate);

// Student registration workflows
router.get(
  "/available",
  authorize(UserRole.STUDENT),
  registrationController.getAvailableCourses,
);

router.post(
  "/",
  authorize(UserRole.STUDENT),
  registrationController.registerCourses,
);

router.get(
  "/my",
  authorize(UserRole.STUDENT),
  registrationController.getMyRegistrations,
);

router.get("/slip/:registrationId", registrationController.getRegistrationSlip);

// Department Admin & Super Admin view registrations
router.get(
  "/",
  authorize(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN),
  registrationController.getRegistrations,
);

export const registrationRoutes = router;
