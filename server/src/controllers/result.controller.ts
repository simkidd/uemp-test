import { Response } from "express";
import { Result } from "../models/result.model";
import { User } from "../models/user.model";
import { Course } from "../models/course.model";
import { CourseAllocation } from "../models/allocation.model";
import { CourseRegistration } from "../models/registration.model";
import { AcademicSession } from "../models/session.model";
import { Semester } from "../models/semester.model";
import { ResultAuditLog } from "../models/audit.model";
import { asyncHandler, AppError, sendSuccess } from "../utils";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { UserRole } from "../constants/roles";
import { AuditAction, ResultStatus } from "../constants/enums";
import {
  calculateGradeAndPoint,
  calculateGPA,
  calculateCGPA,
  getDegreeClassification,
} from "../utils/helpers";

export class ResultController {
  /**
   * Workflow 2 Step 4:
   * Get class list of students registered for an assigned course
   */
  getRegisteredStudentsForCourse = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { courseId } = req.params;
      const { sessionId, semesterId } = req.query;

      let targetSessionId = sessionId ? String(sessionId) : "";
      let targetSemesterId = semesterId ? String(semesterId) : "";

      if (!targetSessionId || !targetSemesterId) {
        const activeSession = await AcademicSession.findOne({ isCurrent: true });
        if (activeSession) {
          targetSessionId = activeSession._id.toString();
          const activeSemester = await Semester.findOne({
            session: activeSession._id,
            isCurrent: true,
          });
          if (activeSemester) {
            targetSemesterId = activeSemester._id.toString();
          }
        }
      }

      if (!targetSessionId || !targetSemesterId) {
        throw new AppError("Active session and semester could not be determined.", 400);
      }

      const course = await Course.findById(courseId);
      if (!course) {
        throw new AppError("Course not found.", 404);
      }

      // Check Lecturer authorization: can only manage assigned courses
      if (req.user!.role === UserRole.LECTURER) {
        const allocation = await CourseAllocation.findOne({
          course: courseId,
          lecturer: req.user!._id,
          session: targetSessionId,
          semester: targetSemesterId,
        } as any);

        if (!allocation) {
          throw new AppError(
            "Access denied. You are not assigned to teach this course for the selected session and semester.",
            403,
          );
        }
      } else if (req.user!.role === UserRole.DEPARTMENT_ADMIN) {
        if (course.department.toString() !== req.user!.department?.toString()) {
          throw new AppError("Access denied. Course outside your assigned department.", 403);
        }
      }

      // Find all student registrations that contain this course
      const registrations = await CourseRegistration.find({
        session: targetSessionId,
        semester: targetSemesterId,
        "courses.course": courseId,
      } as any).populate(
        "student",
        "firstName lastName otherName email studentProfile department",
      );

      // Check if a result record already exists
      const existingResult: any = await Result.findOne({
        course: courseId,
        session: targetSessionId,
        semester: targetSemesterId,
      } as any).populate("lecturer", "firstName lastName email lecturerProfile");

      const students = registrations.map((reg: any) => {
        const studentObj = reg.student;
        const savedScore = existingResult?.scores?.find(
          (s: any) => s.student.toString() === studentObj._id.toString(),
        );

        return {
          studentId: studentObj._id,
          matricNumber: studentObj.studentProfile?.matricNumber || "N/A",
          firstName: studentObj.firstName,
          lastName: studentObj.lastName,
          otherName: studentObj.otherName,
          caScore: savedScore?.caScore ?? 0,
          examScore: savedScore?.examScore ?? 0,
          totalScore: savedScore?.totalScore ?? 0,
          grade: savedScore?.grade ?? "-",
          gradePoint: savedScore?.gradePoint ?? 0,
        };
      });

      return sendSuccess(
        res,
        {
          course,
          session: targetSessionId,
          semester: targetSemesterId,
          resultStatus: existingResult?.status || "NOT_STARTED",
          resultId: existingResult?._id,
          isReopened: existingResult?.isReopened || false,
          rejectionReason: existingResult?.rejectionReason,
          students,
        },
        "Registered students retrieved successfully",
      );
    },
  );

  /**
   * Workflow 2 Step 5, 6, 7:
   * Lecturer saves scores as DRAFT or SUBMITS for departmental review
   */
  saveOrSubmitResult = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { courseId, sessionId, semesterId, scores, action } = req.body;

    if (!courseId || !sessionId || !semesterId || !Array.isArray(scores)) {
      throw new AppError("Course ID, session, semester, and scores are required.", 400);
    }

    const isSubmit = action === "SUBMIT";

    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError("Course not found.", 404);
    }

    // Business Rule #3: Lecturer can only enter results for courses assigned to them
    if (req.user!.role === UserRole.LECTURER) {
      const allocation = await CourseAllocation.findOne({
        course: courseId,
        lecturer: req.user!._id,
        session: sessionId,
        semester: semesterId,
      });

      if (!allocation) {
        throw new AppError(
          "Access denied. You can only enter results for courses assigned to you.",
          403,
        );
      }
    } else if (req.user!.role === UserRole.DEPARTMENT_ADMIN) {
      if (course.department.toString() !== req.user!.department?.toString()) {
        throw new AppError("Access denied. Course outside your assigned department.", 403);
      }
    } else if (req.user!.role !== UserRole.SUPER_ADMIN) {
      throw new AppError("Unauthorized role for result entry.", 403);
    }

    // Check existing result
    let result: any = await Result.findOne({
      course: courseId,
      session: sessionId,
      semester: semesterId,
    });

    if (result) {
      if (result.status === ResultStatus.SUBMITTED && !result.isReopened) {
        throw new AppError(
          "Result has already been submitted for review and cannot be edited until reviewed or reopened.",
          400,
        );
      }

      if (result.status === ResultStatus.APPROVED && !result.isReopened) {
        throw new AppError(
          "Result has already been approved and is locked. Requires authorized reopening to modify.",
          400,
        );
      }
    }

    // Validate and compute scores
    const computedScores = scores.map((s: any) => {
      const caScore = Math.max(0, Math.min(40, Number(s.caScore) || 0));
      const examScore = Math.max(0, Math.min(70, Number(s.examScore) || 0));
      const totalScore = Math.round((caScore + examScore) * 100) / 100;
      const { grade, gradePoint } = calculateGradeAndPoint(totalScore);

      return {
        student: s.studentId || s.student,
        caScore,
        examScore,
        totalScore,
        grade,
        gradePoint,
        creditUnit: course.creditUnit,
      };
    });

    const previousStatus = result?.status || ResultStatus.DRAFT;
    const newStatus = isSubmit ? ResultStatus.SUBMITTED : ResultStatus.DRAFT;

    if (!result) {
      result = new Result({
        course: course._id,
        session: sessionId,
        semester: semesterId,
        department: course.department,
        lecturer: req.user!._id,
        status: newStatus,
        scores: computedScores,
        ...(isSubmit ? { submittedAt: new Date() } : {}),
      });
    } else {
      result.scores = computedScores as any;
      result.status = newStatus;
      if (isSubmit) {
        result.submittedAt = new Date();
        result.isReopened = false;
      }
    }

    await result.save();

    // Traceable audit log (Requirement §6 rule #8)
    await ResultAuditLog.create({
      result: result._id,
      course: course._id,
      actor: req.user!._id,
      action: isSubmit ? AuditAction.RESULT_SUBMITTED : AuditAction.RESULT_DRAFT_SAVED,
      previousStatus,
      newStatus,
      comments: isSubmit
        ? `Result submitted for departmental review by ${req.user!.firstName} ${req.user!.lastName}`
        : `Result draft saved by ${req.user!.firstName} ${req.user!.lastName}`,
      metadata: { studentCount: computedScores.length },
    });

    return sendSuccess(
      res,
      result,
      isSubmit
        ? "Results submitted successfully for departmental review."
        : "Result draft saved successfully.",
    );
  });

  /**
   * Workflow 3 Step 2:
   * Department Admin views pending result submissions
   */
  getPendingSubmissions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { sessionId, semesterId } = req.query;

    const query: any = {
      status: ResultStatus.SUBMITTED,
    };

    if (req.user!.role === UserRole.DEPARTMENT_ADMIN) {
      query.department = req.user!.department;
    } else if (req.user!.role !== UserRole.SUPER_ADMIN) {
      throw new AppError("Access denied.", 403);
    }

    if (sessionId) query.session = sessionId;
    if (semesterId) query.semester = semesterId;

    const pending = await Result.find(query)
      .populate("course", "code title creditUnit level")
      .populate("lecturer", "firstName lastName email lecturerProfile")
      .populate("session", "name")
      .populate("semester", "name")
      .populate("department", "name code")
      .sort({ submittedAt: -1 });

    return sendSuccess(res, pending, "Pending submissions retrieved successfully");
  });

  /**
   * Workflow 3 Step 3 & 4:
   * View single result sheet with full details for review
   */
  getResultDetails = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const result: any = await Result.findById(id)
      .populate("course", "code title creditUnit level")
      .populate("lecturer", "firstName lastName email lecturerProfile")
      .populate("session", "name")
      .populate("semester", "name")
      .populate("department", "name code")
      .populate("reviewedBy", "firstName lastName email")
      .populate("scores.student", "firstName lastName studentProfile email");

    if (!result) {
      throw new AppError("Result record not found.", 404);
    }

    if (req.user!.role === UserRole.DEPARTMENT_ADMIN) {
      if (result.department.toString() !== req.user!.department?.toString()) {
        throw new AppError("Access denied. Record is outside your department.", 403);
      }
    } else if (req.user!.role === UserRole.LECTURER) {
      if (result.lecturer._id.toString() !== req.user!._id.toString()) {
        throw new AppError("Access denied. This result is assigned to another lecturer.", 403);
      }
    }

    return sendSuccess(res, result, "Result details retrieved successfully");
  });

  /**
   * Workflow 3 Step 5 & 7:
   * Department Admin approves result submission
   */
  approveResult = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    let result: any = null;
    try {
      result = await Result.findById(id);
    } catch {
      // ignore
    }
    if (!result) {
      result = await Result.findOne({ course: id, status: ResultStatus.SUBMITTED } as any);
    }

    if (!result) {
      throw new AppError("Result not found.", 404);
    }

    // Business Rule #5: Only authorized departmental administrators can approve results for their department
    if (req.user!.role === UserRole.DEPARTMENT_ADMIN) {
      if (result.department.toString() !== req.user!.department?.toString()) {
        throw new AppError(
          "Access denied. You can only approve results for your own department.",
          403,
        );
      }
    } else if (req.user!.role !== UserRole.SUPER_ADMIN) {
      throw new AppError("Access denied. Only Department Admin or Super Admin can approve results.", 403);
    }

    // Business Rule: Lecturers cannot approve their own submitted results
    if (result.lecturer.toString() === req.user!._id.toString()) {
      throw new AppError("Conflict of interest: You cannot approve results submitted by yourself.", 403);
    }

    if (result.status !== ResultStatus.SUBMITTED) {
      throw new AppError(
        `Result must be in SUBMITTED state before approval. Current state: ${result.status}`,
        400,
      );
    }

    const previousStatus = result.status;
    result.status = ResultStatus.APPROVED;
    result.reviewedAt = new Date();
    result.reviewedBy = req.user!._id;
    result.rejectionReason = "";
    result.isReopened = false;
    await result.save();

    // Audit log
    await ResultAuditLog.create({
      result: result._id,
      course: result.course,
      actor: req.user!._id,
      action: AuditAction.RESULT_APPROVED,
      previousStatus,
      newStatus: ResultStatus.APPROVED,
      comments: `Result approved by ${req.user!.firstName} ${req.user!.lastName} (${req.user!.role})`,
    });

    return sendSuccess(res, result, "Result approved successfully. It is now visible to students.");
  });

  /**
   * Workflow 3 Step 5 & 6:
   * Department Admin rejects result submission with feedback
   */
  rejectResult = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { reason, remarks } = req.body;
    const feedback = reason || remarks;

    if (!feedback || !feedback.trim()) {
      throw new AppError("Please provide a rejection reason/feedback for the lecturer.", 400);
    }

    let result: any = null;
    try {
      result = await Result.findById(id);
    } catch {
      // ignore
    }
    if (!result) {
      result = await Result.findOne({ course: id, status: ResultStatus.SUBMITTED } as any);
    }


    if (!result) {
      throw new AppError("Result not found.", 404);
    }

    if (req.user!.role === UserRole.DEPARTMENT_ADMIN) {
      if (result.department.toString() !== req.user!.department?.toString()) {
        throw new AppError("Access denied. Record outside your department.", 403);
      }
    } else if (req.user!.role !== UserRole.SUPER_ADMIN) {
      throw new AppError("Access denied.", 403);
    }

    const previousStatus = result.status;
    result.status = ResultStatus.REJECTED;
    result.reviewedAt = new Date();
    result.reviewedBy = req.user!._id;
    result.rejectionReason = feedback.trim();
    result.isReopened = true;
    await result.save();


    // Audit log
    await ResultAuditLog.create({
      result: result._id,
      course: result.course,
      actor: req.user!._id,
      action: AuditAction.RESULT_REJECTED,
      previousStatus,
      newStatus: ResultStatus.REJECTED,
      comments: `Result rejected. Reason: ${reason.trim()}`,
    });

    return sendSuccess(
      res,
      result,
      "Result rejected and returned to lecturer for correction.",
    );
  });

  /**
   * Authorized Reopening Process:
   * Reopens an approved or submitted result for correction
   */
  reopenResult = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;

    const result: any = await Result.findById(id);
    if (!result) {
      throw new AppError("Result not found.", 404);
    }

    if (req.user!.role === UserRole.DEPARTMENT_ADMIN) {
      if (result.department.toString() !== req.user!.department?.toString()) {
        throw new AppError("Access denied. Record outside your department.", 403);
      }
    } else if (req.user!.role !== UserRole.SUPER_ADMIN) {
      throw new AppError("Only Department Admin or Super Admin can authorize result reopening.", 403);
    }

    const previousStatus = result.status;
    result.isReopened = true;
    result.reopenedBy = req.user!._id;
    result.reopenedAt = new Date();
    result.status = ResultStatus.DRAFT;
    await result.save();

    await ResultAuditLog.create({
      result: result._id,
      course: result.course,
      actor: req.user!._id,
      action: AuditAction.RESULT_REOPENED,
      previousStatus,
      newStatus: ResultStatus.DRAFT,
      comments: `Result reopened for correction by ${req.user!.firstName} ${req.user!.lastName}. Note: ${reason || "No comment"}`,
    });

    return sendSuccess(res, result, "Result reopened for correction successfully.");
  });

  /**
   * Business Rule #6:
   * Students can ONLY view approved results!
   * Calculates semester GPA and CGPA using credit-unit-weighted calculation.
   */
  getStudentResults = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== UserRole.STUDENT) {
      throw new AppError("Only students can view their personal results.", 403);
    }

    const studentId = req.user!._id;

    // Find all results containing this student where status is APPROVED
    const approvedResults: any[] = await Result.find({
      status: ResultStatus.APPROVED,
      "scores.student": studentId,
    } as any)
      .populate("course", "code title creditUnit level semester")
      .populate("session", "name")
      .populate("semester", "name")
      .populate("department", "name code")
      .sort({ "session.name": 1, "semester.name": 1 });

    const groupedResultsMap = new Map<string, any>();

    for (const resDoc of approvedResults) {
      const sessionName = resDoc.session?.name || "Unknown Session";
      const semesterName = resDoc.semester?.name || "Unknown Semester";
      const key = `${sessionName} - ${semesterName}`;

      const scoreEntry = resDoc.scores.find(
        (s: any) => s.student.toString() === studentId.toString(),
      );

      if (scoreEntry) {
        if (!groupedResultsMap.has(key)) {
          groupedResultsMap.set(key, {
            session: sessionName,
            semester: semesterName,
            courses: [],
          });
        }

        groupedResultsMap.get(key).courses.push({
          courseCode: resDoc.course?.code,
          courseTitle: resDoc.course?.title,
          creditUnit: scoreEntry.creditUnit,
          caScore: scoreEntry.caScore,
          examScore: scoreEntry.examScore,
          totalScore: scoreEntry.totalScore,
          grade: scoreEntry.grade,
          gradePoint: scoreEntry.gradePoint,
        });
      }
    }

    const semesterSummaries: any[] = [];
    const allSemesterTotals: Array<{ totalUnits: number; totalPoints: number }> = [];

    for (const [key, data] of groupedResultsMap.entries()) {
      const { gpa, totalUnits, totalPoints } = calculateGPA(data.courses);
      allSemesterTotals.push({ totalUnits, totalPoints });

      semesterSummaries.push({
        sessionAndSemester: key,
        session: data.session,
        semester: data.semester,
        courses: data.courses,
        totalUnits,
        totalPoints,
        gpa,
      });
    }

    const cgpa = calculateCGPA(allSemesterTotals);
    const classification = getDegreeClassification(cgpa);

    return sendSuccess(
      res,
      {
        student: {
          firstName: req.user!.firstName,
          lastName: req.user!.lastName,
          matricNumber: req.user!.studentProfile?.matricNumber,
          department: req.user!.department,
        },
        semesters: semesterSummaries,
        cgpa,
        classification,
      },
      "Academic results retrieved successfully",
    );
  });

  /**
   * Get student result statement for download / print
   */
  getStudentResultStatement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const targetStudentId =
      req.user!.role === UserRole.STUDENT
        ? req.user!._id
        : req.params.studentId || req.query.studentId;

    if (!targetStudentId) {
      throw new AppError("Student ID is required.", 400);
    }

    const student = await User.findById(targetStudentId)
      .populate("department", "name code")
      .populate("faculty", "name code")
      .populate("studentProfile.programme", "name code degreeAwarded");

    if (!student) {
      throw new AppError("Student not found.", 404);
    }

    if (
      req.user!.role === UserRole.DEPARTMENT_ADMIN &&
      student.department?._id?.toString() !== req.user!.department?.toString()
    ) {
      throw new AppError("Access denied. Student is outside your department.", 403);
    }

    // Business Rule #6: ONLY approved results
    const approvedResults: any[] = await Result.find({
      status: ResultStatus.APPROVED,
      "scores.student": targetStudentId,
    } as any)
      .populate("course", "code title creditUnit level semester")
      .populate("session", "name")
      .populate("semester", "name")
      .sort({ "session.name": 1, "semester.name": 1 });

    const groupedMap = new Map<string, any>();

    for (const resDoc of approvedResults) {
      const sessionName = resDoc.session?.name || "Session";
      const semesterName = resDoc.semester?.name || "Semester";
      const key = `${sessionName} - ${semesterName}`;

      const scoreEntry = resDoc.scores.find(
        (s: any) => s.student.toString() === targetStudentId.toString(),
      );

      if (scoreEntry) {
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            session: sessionName,
            semester: semesterName,
            courses: [],
          });
        }

        groupedMap.get(key).courses.push({
          code: resDoc.course?.code,
          title: resDoc.course?.title,
          creditUnit: scoreEntry.creditUnit,
          caScore: scoreEntry.caScore,
          examScore: scoreEntry.examScore,
          totalScore: scoreEntry.totalScore,
          grade: scoreEntry.grade,
          gradePoint: scoreEntry.gradePoint,
        });
      }
    }

    const semesters: any[] = [];
    const totals: Array<{ totalUnits: number; totalPoints: number }> = [];

    for (const [key, data] of groupedMap.entries()) {
      const { gpa, totalUnits, totalPoints } = calculateGPA(data.courses);
      totals.push({ totalUnits, totalPoints });
      semesters.push({
        term: key,
        session: data.session,
        semester: data.semester,
        courses: data.courses,
        gpa,
        totalUnits,
        totalPoints,
      });
    }

    const cgpa = calculateCGPA(totals);
    const classification = getDegreeClassification(cgpa);

    return sendSuccess(
      res,
      {
        student,
        semesters,
        totalCreditUnitsCompleted: totals.reduce((acc, t) => acc + t.totalUnits, 0),
        cgpa,
        classification,
        generatedAt: new Date().toISOString(),
      },
      "Result statement generated successfully",
    );
  });
}

export const resultController = new ResultController();
