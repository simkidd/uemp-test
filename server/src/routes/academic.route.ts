import { Router } from "express";
import { academicController } from "../controllers/academic.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../constants/roles";

const router = Router();

router.use(authenticate);

// Current session and semester
router.get("/current", academicController.getCurrentSessionAndSemester);

// Faculties
router.get("/faculties", academicController.getFaculties);
router.post(
  "/faculties",
  authorize(UserRole.SUPER_ADMIN),
  academicController.createFaculty,
);
router.put(
  "/faculties/:id",
  authorize(UserRole.SUPER_ADMIN),
  academicController.updateFaculty,
);

// Departments
router.get("/departments", academicController.getDepartments);
router.post(
  "/departments",
  authorize(UserRole.SUPER_ADMIN),
  academicController.createDepartment,
);
router.put(
  "/departments/:id",
  authorize(UserRole.SUPER_ADMIN),
  academicController.updateDepartment,
);

// Programmes
router.get("/programmes", academicController.getProgrammes);
router.post(
  "/programmes",
  authorize(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN),
  academicController.createProgramme,
);
router.put(
  "/programmes/:id",
  authorize(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN),
  academicController.updateProgramme,
);

// Academic Sessions
router.get("/sessions", academicController.getSessions);
router.post(
  "/sessions",
  authorize(UserRole.SUPER_ADMIN),
  academicController.createSession,
);
router.patch(
  "/sessions/:id/set-current",
  authorize(UserRole.SUPER_ADMIN),
  academicController.setCurrentSession,
);

// Semesters
router.get("/semesters", academicController.getSemesters);
router.post(
  "/semesters",
  authorize(UserRole.SUPER_ADMIN),
  academicController.createSemester,
);
router.patch(
  "/semesters/:id/set-current",
  authorize(UserRole.SUPER_ADMIN),
  academicController.setCurrentSemester,
);
router.patch(
  "/semesters/:id/toggle-registration",
  authorize(UserRole.SUPER_ADMIN),
  academicController.toggleRegistrationWindow,
);

export const academicRoutes = router;
