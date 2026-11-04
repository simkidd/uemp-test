import { Response } from "express";
import { User } from "../models/user.model";
import { Auth } from "../models/auth.model";
import { Department } from "../models/department.model";
import { Faculty } from "../models/faculty.model";
import { Course } from "../models/course.model";
import { AcademicSession } from "../models/session.model";
import { Semester } from "../models/semester.model";
import { Result } from "../models/result.model";
import { CourseRegistration } from "../models/registration.model";
import { ResultAuditLog } from "../models/audit.model";
import {
  asyncHandler,
  AppError,
  sendSuccess,
  hashPassword,
  paginate,
} from "../utils";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { UserRole } from "../constants/roles";
import { ResultStatus } from "../constants/enums";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary";

export class AdminController {
  /**
   * Comprehensive administrative dashboard metrics
   */
  getDashboardOverview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const isSuperAdmin = req.user!.role === UserRole.SUPER_ADMIN;
    const isDeptAdmin = req.user!.role === UserRole.DEPARTMENT_ADMIN;
    const deptId = req.user!.department;

    const activeSession = await AcademicSession.findOne({ isCurrent: true });
    let activeSemester = null;
    if (activeSession) {
      activeSemester = await Semester.findOne({
        session: activeSession._id,
        isCurrent: true,
      });
    }

    const deptFilter: any = isDeptAdmin ? { department: deptId } : {};

    const [
      totalStudents,
      totalLecturers,
      totalAdmins,
      totalCourses,
      totalDepartments,
      totalFaculties,
      pendingSubmissionsCount,
      approvedResultsCount,
      totalRegistrations,
      recentAuditLogs,
    ] = await Promise.all([
      User.countDocuments({ role: UserRole.STUDENT, ...deptFilter }),
      User.countDocuments({ role: UserRole.LECTURER, ...deptFilter }),
      User.countDocuments({
        role: { $in: [UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN] },
        ...deptFilter,
      }),
      Course.countDocuments({ isActive: true, ...deptFilter }),
      isSuperAdmin ? Department.countDocuments({ isActive: true }) : Promise.resolve(1),
      isSuperAdmin ? Faculty.countDocuments({ isActive: true }) : Promise.resolve(1),
      Result.countDocuments({ status: ResultStatus.SUBMITTED, ...deptFilter }),
      Result.countDocuments({ status: ResultStatus.APPROVED, ...deptFilter }),
      CourseRegistration.countDocuments(
        activeSession && activeSemester
          ? { session: activeSession._id, semester: activeSemester._id, ...deptFilter }
          : deptFilter,
      ),
      ResultAuditLog.find()
        .populate("actor", "firstName lastName role email")
        .populate("course", "code title")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    return sendSuccess(
      res,
      {
        activeSession,
        activeSemester,
        metrics: {
          totalStudents,
          totalLecturers,
          totalAdmins,
          totalCourses,
          totalDepartments,
          totalFaculties,
          pendingSubmissionsCount,
          approvedResultsCount,
          totalRegistrations,
        },
        recentAuditLogs,
      },
      "Admin dashboard overview retrieved successfully",
    );
  });

  /**
   * Create user account with separate Auth credentials and User profile
   */
  createUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      email,
      password = "Password123!",
      role,
      firstName,
      lastName,
      otherName,
      phone,
      departmentId,
      facultyId,
      programmeId,
      level = 100,
      matricNumber,
      staffId,
      title = "Lecturer",
      designation,
    } = req.body;

    if (!email || !role || !firstName || !lastName) {
      throw new AppError("Email, role, first name, and last name are required.", 400);
    }

    // Role verification
    if (!Object.values(UserRole).includes(role)) {
      throw new AppError("Invalid user role specified.", 400);
    }

    // Dept Admin restrictions
    let targetDeptId = departmentId;
    if (req.user!.role === UserRole.DEPARTMENT_ADMIN) {
      if (role === UserRole.SUPER_ADMIN || role === UserRole.DEPARTMENT_ADMIN) {
        throw new AppError("Department Administrators cannot create administrative accounts.", 403);
      }
      targetDeptId = req.user!.department;
    }

    // Check if email already in use
    const existingAuth = await Auth.findOne({ email: email.toLowerCase().trim() });
    if (existingAuth) {
      throw new AppError("An account with this email address already exists.", 409);
    }

    // Format matric number or staff ID
    let formattedMatric: string | undefined = undefined;
    let formattedStaffId: string | undefined = undefined;

    if (role === UserRole.STUDENT) {
      formattedMatric =
        matricNumber?.trim()?.toUpperCase() ||
        `UEMP/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

      const existingMatric = await User.findOne({
        "studentProfile.matricNumber": formattedMatric,
      } as any);
      if (existingMatric) {
        throw new AppError("Matriculation number already exists.", 409);
      }
    } else if (role === UserRole.LECTURER) {
      formattedStaffId =
        staffId?.trim()?.toUpperCase() ||
        `STF/${Math.floor(100 + Math.random() * 900)}`;

      const existingStaff = await User.findOne({
        "lecturerProfile.staffId": formattedStaffId,
      } as any);
      if (existingStaff) {
        throw new AppError("Staff ID already exists.", 409);
      }
    }

    // Format avatar with Cloudinary upload support (via FormData req.file)
    let avatarData = { url: "", publicId: "" };
    if (req.file) {
      avatarData = await uploadToCloudinary(req.file, "uemp/avatars", {
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });
    }

    // 1. Create User profile
    const userData: any = {
      email: email.toLowerCase().trim(),
      role,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      otherName: otherName ? otherName.trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      avatar: avatarData,
      department: targetDeptId,
      faculty: facultyId,
      isActive: true,
      ...(role === UserRole.STUDENT && formattedMatric
        ? {
            studentProfile: {
              matricNumber: formattedMatric,
              programme: programmeId,
              level: Number(level) as any,
            },
          }
        : {}),
      ...(role === UserRole.LECTURER && formattedStaffId
        ? {
            lecturerProfile: {
              staffId: formattedStaffId,
              title,
              designation,
            },
          }
        : {}),
    };

    const user: any = await User.create(userData);

    // 2. Create Auth credentials referencing User (hash password with utils)
    const hashedPassword = await hashPassword(password);
    const auth = await Auth.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      user: user._id,
      isActive: true,
    });

    // Link auth back to user
    user.auth = auth._id;
    await user.save();

    return sendSuccess(
      res,
      { user, auth: { _id: auth._id, email: auth.email, role: auth.role } },
      "User account and authentication credentials created successfully",
      201,
    );
  });

  /**
   * Activate, deactivate, or suspend account (updates both Auth and User)
   */
  setUserStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { isActive, status } = req.body;

    const resolvedIsActive =
      isActive !== undefined
        ? Boolean(isActive)
        : status !== undefined
          ? status === "ACTIVE"
          : undefined;

    if (resolvedIsActive === undefined) {
      throw new AppError("Please provide isActive boolean status.", 400);
    }

    if (id === req.user!._id.toString()) {
      throw new AppError("You cannot modify the status of your own account.", 400);
    }

    const user = await User.findById(id);
    if (!user) {
      throw new AppError("User not found.", 404);
    }

    user.isActive = resolvedIsActive;
    await user.save();

    await Auth.findOneAndUpdate(
      { user: user._id },
      { isActive: resolvedIsActive },
    );

    return sendSuccess(
      res,
      { id: user._id, isActive: user.isActive },
      `Account ${user.isActive ? "activated" : "deactivated"} successfully`,
    );
  });

  /**
   * Reset user password (updates Auth model)
   */
  resetPassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { newPassword = "Password123!" } = req.body;

    if (newPassword.length < 6) {
      throw new AppError("Password must be at least 6 characters.", 400);
    }

    const user = await User.findById(id);
    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const auth = await Auth.findOne({ user: user._id });
    if (!auth) {
      throw new AppError("Authentication credentials not found for this user.", 404);
    }

    auth.password = await hashPassword(newPassword);
    auth.refreshToken = undefined;
    await auth.save();

    return sendSuccess(res, null, "User password reset successfully");
  });

  /**
   * List users with optional role, department, and search filters
   */
  getUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { role, departmentId, department, search, status, isActive } = req.query;

    const query: any = {};

    // Scoping for Dept Admin
    const targetDept = (departmentId || department) as string | undefined;
    if (req.user!.role === UserRole.DEPARTMENT_ADMIN) {
      query.department = req.user!.department;
    } else if (targetDept && targetDept !== "ALL" && targetDept !== "CENTRAL") {
      query.department = targetDept;
    } else if (targetDept === "CENTRAL") {
      query.department = { $exists: false };
    }

    if (role && Object.values(UserRole).includes(role as UserRole)) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = String(isActive) === "true";
    } else if (status && status !== "ALL") {
      if (status === "ACTIVE") query.isActive = true;
      if (status === "SUSPENDED" || status === "INACTIVE") query.isActive = false;
    }

    if (search) {
      const regex = new RegExp((search as string).trim(), "i");
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { "studentProfile.matricNumber": regex },
        { "lecturerProfile.staffId": regex },
      ];
    }

    const { data: users, pagination } = await paginate(
      User.find(query)
        .populate("department", "name code")
        .populate("faculty", "name code")
        .populate("studentProfile.programme", "name code")
        .sort({ createdAt: -1 }),
      req.query,
    );

    return sendSuccess(res, users, "Users retrieved successfully", 200, pagination);
  });

  /**
   * Get single user by ID (scoped for Department Admin)
   */
  getUserById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate("department", "name code")
      .populate("faculty", "name code")
      .populate("studentProfile.programme", "name code");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (
      req.user!.role === UserRole.DEPARTMENT_ADMIN &&
      user.department?.toString() !== req.user!.department?.toString()
    ) {
      throw new AppError("Access denied. Record is outside your department.", 403);
    }

    return sendSuccess(res, user, "User retrieved successfully");
  });

  /**
   * Update a user account / profile (Super Admin can update any; Dept Admin can update within their department)
   * Supports changing/updating student passport photo via multipart upload
   */
  updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { firstName, lastName, otherName, phone, level, designation, title } = req.body;

    const user = await User.findById(id);
    if (!user) {
      throw new AppError("User not found.", 404);
    }

    // Scoping: Department Admin can only edit within their department
    if (req.user!.role === UserRole.DEPARTMENT_ADMIN) {
      if (!user.department || user.department.toString() !== req.user!.department?.toString()) {
        throw new AppError("Department Administrators can only manage users within their department.", 403);
      }
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.DEPARTMENT_ADMIN) {
        throw new AppError("Department Administrators cannot edit administrative accounts.", 403);
      }
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (otherName !== undefined) user.otherName = otherName ? otherName.trim() : undefined;
    if (phone !== undefined) user.phone = phone ? phone.trim() : undefined;

    if (user.role === UserRole.STUDENT && user.studentProfile) {
      if (level !== undefined) {
        const parsedLevel = Number(level);
        if ([100, 200, 300, 400, 500, 600].includes(parsedLevel)) {
          user.studentProfile.level = parsedLevel as 100 | 200 | 300 | 400 | 500 | 600;
        }
      }
    }

    if (user.role === UserRole.LECTURER && user.lecturerProfile) {
      if (designation !== undefined) user.lecturerProfile.designation = designation.trim();
      if (title !== undefined) user.lecturerProfile.title = title.trim();
    }

    // Official passport upload (Admin can upload/replace student or lecturer passport)
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

    await user.save();

    return sendSuccess(res, user, "User profile updated successfully");
  });
}

export const adminController = new AdminController();
