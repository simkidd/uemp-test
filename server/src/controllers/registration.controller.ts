import { Response } from "express";
import { CourseRegistration } from "../models/registration.model";
import { Course } from "../models/course.model";
import { AcademicSession } from "../models/session.model";
import { Semester } from "../models/semester.model";
import { User } from "../models/user.model";
import {
  asyncHandler,
  AppError,
  sendSuccess,
  paginate,
} from "../utils";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { UserRole } from "../constants/roles";

export class RegistrationController {
  /**
   * Workflow 1 Step 2 & 3:
   * Get available courses for student matching department, programme, level, and active semester
   */
  getAvailableCourses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== UserRole.STUDENT) {
      throw new AppError("Only students can view available registration courses.", 403);
    }

    const student = await User.findById(req.user!._id)
      .populate("department")
      .populate("studentProfile.programme");

    if (!student || !student.studentProfile) {
      throw new AppError("Student academic profile is incomplete.", 400);
    }

    // 1. Get current active session and semester
    const activeSession = await AcademicSession.findOne({ isCurrent: true });
    if (!activeSession) {
      throw new AppError("No active academic session configured.", 400);
    }

    const activeSemester = await Semester.findOne({
      session: activeSession._id,
      isCurrent: true,
    });

    if (!activeSemester) {
      throw new AppError("No active semester configured for current session.", 400);
    }

    // 2. Check if student already registered for this session & semester
    const existingRegistration = await CourseRegistration.findOne({
      student: student._id,
      session: activeSession._id,
      semester: activeSemester._id,
    }).populate("courses.course");

    // 3. Find eligible courses:
    // Department matches student's department, level matches student's level, semester matches active semester
    const courses: any[] = await Course.find({
      department: student.department as any,
      level: student.studentProfile.level,
      semester: activeSemester.name,
      isActive: true,
    } as any).populate("department", "name code");

    return sendSuccess(
      res,
      {
        activeSession,
        activeSemester,
        isRegistrationOpen: activeSemester.isRegistrationOpen,
        studentInfo: {
          matricNumber: student.studentProfile.matricNumber,
          level: student.studentProfile.level,
          department: student.department,
          programme: student.studentProfile.programme,
        },
        hasRegistered: Boolean(existingRegistration),
        existingRegistration,
        availableCourses: courses,
      },
      "Available courses retrieved successfully",
    );
  });

  /**
   * Workflow 1 Step 4 & 5:
   * Student selects courses and registers for the semester
   */
  registerCourses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== UserRole.STUDENT) {
      throw new AppError("Only students can register for courses.", 403);
    }

    const { courseIds } = req.body;

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      throw new AppError("Please select at least one course to register.", 400);
    }

    const student = await User.findById(req.user!._id);
    if (!student || !student.studentProfile) {
      throw new AppError("Student academic profile is incomplete.", 400);
    }

    const activeSession = await AcademicSession.findOne({ isCurrent: true });
    if (!activeSession) {
      throw new AppError("No active academic session found.", 400);
    }

    const activeSemester = await Semester.findOne({
      session: activeSession._id,
      isCurrent: true,
    });

    if (!activeSemester) {
      throw new AppError("No active semester found.", 400);
    }

    if (!activeSemester.isRegistrationOpen) {
      throw new AppError(
        "Course registration is currently closed for this semester.",
        400,
      );
    }

    // Business Rule #2: Check duplicate registration
    const existingRegistration = await CourseRegistration.findOne({
      student: student._id,
      session: activeSession._id,
      semester: activeSemester._id,
    });

    if (existingRegistration) {
      throw new AppError(
        "You have already registered courses for this semester. Duplicate registration is not permitted.",
        409,
      );
    }

    // Verify selected courses exist and belong to the correct semester and department/level
    const courses: any[] = await Course.find({
      _id: { $in: courseIds },
      department: student.department as any,
      semester: activeSemester.name,
      isActive: true,
    } as any);

    if (courses.length !== courseIds.length) {
      throw new AppError(
        "One or more selected courses are invalid, inactive, or not available for your programme/level/semester.",
        400,
      );
    }

    const registeredItems = courses.map((c) => ({
      course: c._id,
      creditUnit: c.creditUnit,
      registeredAt: new Date(),
    }));

    const totalCreditUnits = registeredItems.reduce(
      (acc, item) => acc + item.creditUnit,
      0,
    );

    const registration: any = await CourseRegistration.create({
      student: student._id,
      session: activeSession._id,
      semester: activeSemester._id,
      department: student.department as any,
      programme: student.studentProfile.programme,
      level: student.studentProfile.level,
      courses: registeredItems,
      totalCreditUnits,
      status: "REGISTERED",
    });

    const populatedRegistration = await CourseRegistration.findById(registration._id)
      .populate("courses.course")
      .populate("session", "name")
      .populate("semester", "name");

    return sendSuccess(
      res,
      populatedRegistration,
      "Courses registered successfully",
      201,
    );
  });

  /**
   * Workflow 1 Step 6:
   * View logged-in student's course registrations
   */
  getMyRegistrations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== UserRole.STUDENT) {
      throw new AppError("Only students can view their registrations.", 403);
    }

    const { sessionId, semesterId } = req.query;
    const query: any = { student: req.user!._id };

    if (sessionId) query.session = sessionId;
    if (semesterId) query.semester = semesterId;

    const registrations = await CourseRegistration.find(query)
      .populate("courses.course")
      .populate("session", "name isCurrent")
      .populate("semester", "name isCurrent")
      .populate("department", "name code")
      .populate("programme", "name code degreeAwarded")
      .sort({ createdAt: -1 });

    return sendSuccess(res, registrations, "Registered courses retrieved successfully");
  });

  /**
   * Get registration summary / slip for printing
   */
  getRegistrationSlip = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { registrationId } = req.params;

    const registration = await CourseRegistration.findById(registrationId)
      .populate("student", "firstName lastName otherName email studentProfile")
      .populate("courses.course")
      .populate("session", "name")
      .populate("semester", "name")
      .populate("department", "name code")
      .populate("programme", "name code degreeAwarded");

    if (!registration) {
      throw new AppError("Registration not found.", 404);
    }

    // If student, ensure they only view their own slip
    if (
      req.user!.role === UserRole.STUDENT &&
      registration.student._id.toString() !== req.user!._id.toString()
    ) {
      throw new AppError("Access denied. You can only view your own registration slip.", 403);
    }

    // If Dept Admin, ensure department matches
    if (
      req.user!.role === UserRole.DEPARTMENT_ADMIN &&
      registration.department.toString() !== req.user!.department?.toString()
    ) {
      throw new AppError("Access denied. Record outside your department.", 403);
    }

    return sendSuccess(res, registration, "Registration slip retrieved successfully");
  });

  /**
   * Workflow 1 Step 7:
   * Department Admin and Super Admin view student course registrations
   */
  getRegistrations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { sessionId, semesterId, departmentId, level, page = 1, limit = 20 } = req.query;

    const query: any = {};

    if (req.user!.role === UserRole.DEPARTMENT_ADMIN) {
      query.department = req.user!.department;
    } else if (departmentId) {
      query.department = departmentId;
    }

    if (sessionId) query.session = sessionId;
    if (semesterId) query.semester = semesterId;
    if (level) query.level = Number(level);

    const { data: registrations, pagination } = await paginate(
      CourseRegistration.find(query)
        .populate("student", "firstName lastName email studentProfile")
        .populate("courses.course", "code title creditUnit")
        .populate("session", "name")
        .populate("semester", "name")
        .populate("department", "name code")
        .populate("programme", "name code")
        .sort({ createdAt: -1 }),
      req.query,
    );

    return sendSuccess(
      res,
      registrations,
      "Registrations retrieved successfully",
      200,
      pagination,
    );
  });
}

export const registrationController = new RegistrationController();
