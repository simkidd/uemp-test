import { Response } from "express";
import { User } from "../models/user.model";
import { Course } from "../models/course.model";
import { Department } from "../models/department.model";
import { Faculty } from "../models/faculty.model";
import { CourseRegistration } from "../models/registration.model";
import { Result } from "../models/result.model";
import { ResultAuditLog } from "../models/audit.model";
import { AcademicSession } from "../models/session.model";
import { Semester } from "../models/semester.model";
import { asyncHandler, sendSuccess, paginate } from "../utils";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { UserRole } from "../constants/roles";
import { ResultStatus } from "../constants/enums";

export class ReportController {
  /**
   * Dashboard statistics for Super Admin and Department Admin
   */
  getDashboardStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
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

    const userDeptFilter: any = isDeptAdmin ? { department: deptId } : {};
    const courseDeptFilter: any = isDeptAdmin ? { department: deptId } : {};
    const resultDeptFilter: any = isDeptAdmin ? { department: deptId } : {};

    const [
      totalStudents,
      totalLecturers,
      totalCourses,
      totalDepartments,
      totalFaculties,
      pendingResultsCount,
      approvedResultsCount,
      totalRegistrations,
    ] = await Promise.all([
      User.countDocuments({ role: UserRole.STUDENT, ...userDeptFilter }),
      User.countDocuments({ role: UserRole.LECTURER, ...userDeptFilter }),
      Course.countDocuments({ isActive: true, ...courseDeptFilter }),
      isSuperAdmin ? Department.countDocuments({ isActive: true }) : Promise.resolve(1),
      isSuperAdmin ? Faculty.countDocuments({ isActive: true }) : Promise.resolve(1),
      Result.countDocuments({ status: ResultStatus.SUBMITTED, ...resultDeptFilter }),
      Result.countDocuments({ status: ResultStatus.APPROVED, ...resultDeptFilter }),
      CourseRegistration.countDocuments(
        activeSession && activeSemester
          ? {
              session: activeSession._id,
              semester: activeSemester._id,
              ...userDeptFilter,
            }
          : userDeptFilter,
      ),
    ]);

    // Recent audit logs
    const recentAuditLogs = await ResultAuditLog.find(
      isDeptAdmin ? { "metadata.department": deptId } : {},
    )
      .populate("actor", "firstName lastName role email")
      .populate("course", "code title")
      .sort({ createdAt: -1 })
      .limit(8);

    return sendSuccess(
      res,
      {
        activeSession,
        activeSemester,
        counts: {
          totalStudents,
          totalLecturers,
          totalCourses,
          totalDepartments,
          totalFaculties,
          pendingResultsCount,
          approvedResultsCount,
          totalRegistrations,
        },
        recentAuditLogs,
      },
      "Dashboard statistics retrieved successfully",
    );
  });

  /**
   * Result Audit Logs for administrative oversight
   */
  getAuditLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { action, courseId, page = 1, limit = 25 } = req.query;

    const query: any = {};
    if (action) query.action = action;
    if (courseId) query.course = courseId;

    const { data: logs, pagination } = await paginate(
      ResultAuditLog.find(query)
        .populate("actor", "firstName lastName role email")
        .populate("course", "code title creditUnit")
        .sort({ createdAt: -1 }),
      req.query,
      { defaultLimit: 25 },
    );

    return sendSuccess(res, logs, "Audit logs retrieved successfully", 200, pagination);
  });

  /**
   * Department broadsheet report
   */
  getDepartmentBroadsheet = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { departmentId, sessionId, semesterId, level } = req.query;

    let targetDeptId: any = departmentId;
    if (req.user!.role === UserRole.DEPARTMENT_ADMIN) {
      targetDeptId = req.user!.department;
    }

    const query: any = { status: ResultStatus.APPROVED };
    if (targetDeptId) query.department = targetDeptId;
    if (sessionId) query.session = sessionId;
    if (semesterId) query.semester = semesterId;

    const results = await Result.find(query)
      .populate("course", "code title creditUnit level")
      .populate("scores.student", "firstName lastName studentProfile")
      .populate("session", "name")
      .populate("semester", "name");

    return sendSuccess(res, results, "Broadsheet data retrieved successfully");
  });
}

export const reportController = new ReportController();
