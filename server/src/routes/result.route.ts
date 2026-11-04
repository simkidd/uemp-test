import { Router } from "express";
import { resultController } from "../controllers/result.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../constants/roles";

const router = Router();

router.use(authenticate);

// Student results endpoints (Strictly approved results only)
router.get(
  "/my-results",
  authorize(UserRole.STUDENT),
  resultController.getStudentResults,
);

router.get(
  "/statement",
  resultController.getStudentResultStatement,
);

// Workflow 2: Lecturer endpoints
router.get(
  "/course/:courseId/students",
  authorize(UserRole.LECTURER, UserRole.DEPARTMENT_ADMIN, UserRole.SUPER_ADMIN),
  resultController.getRegisteredStudentsForCourse,
);

router.post(
  "/save-or-submit",
  authorize(UserRole.LECTURER, UserRole.DEPARTMENT_ADMIN, UserRole.SUPER_ADMIN),
  resultController.saveOrSubmitResult,
);

// Results query list (by course, session, etc.)
router.get(
  "/",
  authorize(UserRole.LECTURER, UserRole.DEPARTMENT_ADMIN, UserRole.SUPER_ADMIN),
  resultController.getResults,
);


// Workflow 3: Department Admin & Super Admin review & approval
router.get(
  "/pending",
  authorize(UserRole.DEPARTMENT_ADMIN, UserRole.SUPER_ADMIN),
  resultController.getPendingSubmissions,
);

router.get(
  "/:id",
  authorize(UserRole.LECTURER, UserRole.DEPARTMENT_ADMIN, UserRole.SUPER_ADMIN),
  resultController.getResultDetails,
);

router.post(
  "/:id/approve",
  authorize(UserRole.DEPARTMENT_ADMIN, UserRole.SUPER_ADMIN),
  resultController.approveResult,
);

router.post(
  "/:id/reject",
  authorize(UserRole.DEPARTMENT_ADMIN, UserRole.SUPER_ADMIN),
  resultController.rejectResult,
);

router.post(
  "/:id/reopen",
  authorize(UserRole.DEPARTMENT_ADMIN, UserRole.SUPER_ADMIN),
  resultController.reopenResult,
);

export const resultRoutes = router;
