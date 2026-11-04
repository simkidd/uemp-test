import { Response } from "express";
import { Course } from "../models/course.model";
import { CourseAllocation } from "../models/allocation.model";
import { AcademicSession } from "../models/session.model";
import { Semester } from "../models/semester.model";
import { User } from "../models/user.model";
import { asyncHandler, AppError, sendSuccess } from "../utils";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { UserRole } from "../constants/roles";

export class CourseController {
  /**
   * Get courses list with filters
   */
  getCourses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { departmentId, level, semester, programmeId, search, isActive } = req.query;

    const query: any = {};

    if (req.user!.role === UserRole.DEPARTMENT_ADMIN) {
      query.department = req.user!.department;
    } else if (departmentId) {
      query.department = departmentId;
    }

    if (level) query.level = Number(level);
    if (semester) query.semester = semester;
    if (programmeId) query.programmes = programmeId;
    if (isActive !== undefined) query.isActive = isActive === "true";

    if (search) {
      const searchRegex = new RegExp(String(search).trim(), "i");
      query.$or = [{ code: searchRegex }, { title: searchRegex }];
    }

    const courses = await Course.find(query)
      .populate("department", "name code")
      .populate("programmes", "name code degreeAwarded")
      .sort({ code: 1 });

    return sendSuccess(res, courses, "Courses retrieved successfully");
  });

  /**
   * Get course by ID
   */
  getCourseById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate("department", "name code")
      .populate("programmes", "name code degreeAwarded");

    if (!course) {
      throw new AppError("Course not found.", 404);
    }

    return sendSuccess(res, course, "Course retrieved successfully");
  });

  /**
   * Create course (Super Admin or Dept Admin for own dept)
   */
  createCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      code,
      title,
      creditUnit,
      departmentId,
      programmeIds,
      level,
      semester,
      description,
    } = req.body;

    let targetDeptId = departmentId;
    if (req.user!.role === UserRole.DEPARTMENT_ADMIN) {
      targetDeptId = req.user!.department;
    }

    if (!code || !title || !creditUnit || !targetDeptId || !level || !semester) {
      throw new AppError(
        "Course code, title, credit unit, department, level, and semester are required.",
        400,
      );
    }

    const existing = await Course.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      throw new AppError("A course with this code already exists.", 409);
    }

    const course = await Course.create({
      code: code.trim().toUpperCase(),
      title: title.trim(),
      creditUnit: Number(creditUnit),
      department: targetDeptId,
      programmes: Array.isArray(programmeIds) ? programmeIds : [],
      level: Number(level) as any,
      semester,
      description,
    });

    return sendSuccess(res, course, "Course created successfully", 201);
  });

  /**
   * Update course
   */
  updateCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const {
      code,
      title,
      creditUnit,
      programmeIds,
      level,
      semester,
      description,
      isActive,
    } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      throw new AppError("Course not found.", 404);
    }

    if (
      req.user!.role === UserRole.DEPARTMENT_ADMIN &&
      course.department.toString() !== req.user!.department?.toString()
    ) {
      throw new AppError("Access denied. Course outside your department.", 403);
    }

    if (code) course.code = code.trim().toUpperCase();
    if (title) course.title = title.trim();
    if (creditUnit !== undefined) course.creditUnit = Number(creditUnit);
    if (programmeIds) course.programmes = programmeIds;
    if (level) course.level = Number(level) as any;

    if (semester) course.semester = semester;
    if (description !== undefined) course.description = description;
    if (isActive !== undefined) course.isActive = isActive;

    await course.save();

    return sendSuccess(res, course, "Course updated successfully");
  });


  /**
   * Allocate course to lecturer for session & semester
   */
  allocateCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { courseId, lecturerId, sessionId, semesterId } = req.body;

    let targetSessionId = sessionId;
    let targetSemesterId = semesterId;

    if (!targetSessionId || !targetSemesterId) {
      const activeSession = await AcademicSession.findOne({ isCurrent: true });
      if (activeSession) {
        targetSessionId = targetSessionId || activeSession._id;
        const activeSemester = await Semester.findOne({
          session: activeSession._id,
          isCurrent: true,
        });
        if (activeSemester) {
          targetSemesterId = targetSemesterId || activeSemester._id;
        }
      }
    }

    if (!courseId || !lecturerId || !targetSessionId || !targetSemesterId) {
      throw new AppError(
        "Course and lecturer are required, along with an active session and semester.",
        400,
      );
    }

    const [course, lecturer] = await Promise.all([
      Course.findById(courseId),
      User.findById(lecturerId),
    ]);

    if (!course) throw new AppError("Course not found.", 404);
    if (!lecturer || lecturer.role !== UserRole.LECTURER) {
      throw new AppError("Valid lecturer account required.", 400);
    }

    // Dept Admin can only allocate within their own department
    if (
      req.user!.role === UserRole.DEPARTMENT_ADMIN &&
      course.department.toString() !== req.user!.department?.toString()
    ) {
      throw new AppError("Access denied. Cannot allocate courses outside your department.", 403);
    }

    const allocation = await CourseAllocation.findOneAndUpdate(
      { course: courseId, session: targetSessionId, semester: targetSemesterId },
      {
        lecturer: lecturerId,
        assignedBy: req.user!._id,
      },

      { upsert: true, new: true, runValidators: true },
    )
      .populate("course", "code title creditUnit")
      .populate("lecturer", "firstName lastName email lecturerProfile")
      .populate("session", "name")
      .populate("semester", "name");

    return sendSuccess(res, allocation, "Course allocated to lecturer successfully");
  });

  /**
   * Get allocations
   */
  getAllocations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { sessionId, semesterId, departmentId, lecturerId } = req.query;
    const query: any = {};

    if (sessionId) query.session = sessionId;
    if (semesterId) query.semester = semesterId;
    if (lecturerId) query.lecturer = lecturerId;

    let allocations = await CourseAllocation.find(query)
      .populate({
        path: "course",
        populate: { path: "department", select: "name code" },
      })
      .populate("lecturer", "firstName lastName email lecturerProfile")
      .populate("session", "name isCurrent")
      .populate("semester", "name isCurrent")
      .sort({ createdAt: -1 });

    // Filter by department if needed
    if (req.user!.role === UserRole.DEPARTMENT_ADMIN) {
      const deptId = req.user!.department?.toString();
      allocations = allocations.filter(
        (a: any) => a.course?.department?._id?.toString() === deptId,
      );
    } else if (departmentId) {
      allocations = allocations.filter(
        (a: any) => a.course?.department?._id?.toString() === departmentId,
      );
    }

    return sendSuccess(res, allocations, "Allocations retrieved successfully");
  });

  /**
   * Delete course allocation
   */
  deleteAllocation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const allocation = await CourseAllocation.findById(id).populate("course");
    if (!allocation) {
      throw new AppError("Allocation not found.", 404);
    }

    if (
      req.user!.role === UserRole.DEPARTMENT_ADMIN &&
      (allocation.course as any)?.department?.toString() !== req.user!.department?.toString()
    ) {
      throw new AppError(
        "Access denied. Cannot delete allocation for course outside your department.",
        403,
      );
    }

    await CourseAllocation.findByIdAndDelete(id);
    return sendSuccess(res, null, "Allocation removed successfully");
  });


  /**
   * Get courses assigned to currently logged-in lecturer (Workflow 2 step 2)
   */
  getLecturerAssignedCourses = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      if (req.user!.role !== UserRole.LECTURER) {
        throw new AppError("Only lecturers can access assigned courses.", 403);
      }

      // Find active session and semester
      const activeSession = await AcademicSession.findOne({ isCurrent: true });
      let activeSemester = null;
      if (activeSession) {
        activeSemester = await Semester.findOne({
          session: activeSession._id,
          isCurrent: true,
        });
      }

      const query: any = { lecturer: req.user!._id };
      if (activeSession) query.session = activeSession._id;
      if (activeSemester) query.semester = activeSemester._id;

      const allocations = await CourseAllocation.find(query)
        .populate({
          path: "course",
          populate: { path: "department", select: "name code" },
        })
        .populate("session", "name")
        .populate("semester", "name")
        .sort({ createdAt: -1 });

      return sendSuccess(res, allocations, "Assigned courses retrieved successfully");
    },
  );
}

export const courseController = new CourseController();
