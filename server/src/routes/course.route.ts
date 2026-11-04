import { Router } from "express";
import { courseController } from "../controllers/course.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../constants/roles";

const router = Router();

router.use(authenticate);

// Lecturer assigned courses
router.get(
  "/assigned",
  authorize(UserRole.LECTURER),
  courseController.getLecturerAssignedCourses,
);

// Course allocations
router.get(
  "/allocations",
  authorize(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN),
  courseController.getAllocations,
);

router.post(
  "/allocate",
  authorize(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN),
  courseController.allocateCourse,
);

router.delete(
  "/allocations/:id",
  authorize(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN),
  courseController.deleteAllocation,
);


// Courses list
router.get("/", courseController.getCourses);
router.get("/:id", courseController.getCourseById);

// Create course
router.post(
  "/",
  authorize(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN),
  courseController.createCourse,
);

// Update course
router.put(
  "/:id",
  authorize(UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN),
  courseController.updateCourse,
);

export const courseRoutes = router;
