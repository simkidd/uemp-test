import { Response } from "express";
import { Faculty } from "../models/faculty.model";
import { Department } from "../models/department.model";
import { Programme } from "../models/programme.model";
import { AcademicSession } from "../models/session.model";
import { Semester } from "../models/semester.model";
import { asyncHandler, AppError, sendSuccess } from "../utils";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { UserRole } from "../constants/roles";
import { SemesterType } from "../constants/enums";

export class AcademicController {
  // ================= FACULTIES =================

  getFaculties = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const faculties = await Faculty.find().sort({ name: 1 });
    return sendSuccess(res, faculties, "Faculties retrieved successfully");
  });

  createFaculty = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { name, code, description } = req.body;
    if (!name || !code) {
      throw new AppError("Faculty name and code are required.", 400);
    }

    const faculty = await Faculty.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description,
    });

    return sendSuccess(res, faculty, "Faculty created successfully", 201);
  });

  updateFaculty = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { name, code, description, isActive } = req.body;

    const faculty = await Faculty.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(code && { code: code.trim().toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true, runValidators: true },
    );

    if (!faculty) {
      throw new AppError("Faculty not found.", 404);
    }

    return sendSuccess(res, faculty, "Faculty updated successfully");
  });

  // ================= DEPARTMENTS =================

  getDepartments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { facultyId } = req.query;
    const query: any = {};
    if (facultyId) query.faculty = facultyId;

    const departments = await Department.find(query)
      .populate("faculty", "name code")
      .sort({ name: 1 });

    return sendSuccess(res, departments, "Departments retrieved successfully");
  });

  createDepartment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { name, code, facultyId } = req.body;
    if (!name || !code || !facultyId) {
      throw new AppError("Department name, code, and faculty are required.", 400);
    }

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      throw new AppError("Faculty not found.", 404);
    }

    const department = await Department.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      faculty: faculty._id,
    });

    return sendSuccess(res, department, "Department created successfully", 201);
  });

  updateDepartment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { name, code, facultyId, isActive } = req.body;

    const department = await Department.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(code && { code: code.trim().toUpperCase() }),
        ...(facultyId && { faculty: facultyId }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true, runValidators: true },
    ).populate("faculty", "name code");

    if (!department) {
      throw new AppError("Department not found.", 404);
    }

    return sendSuccess(res, department, "Department updated successfully");
  });

  // ================= PROGRAMMES =================

  getProgrammes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { departmentId } = req.query;
    const query: any = {};

    if (req.user!.role === UserRole.DEPARTMENT_ADMIN) {
      query.department = req.user!.department;
    } else if (departmentId) {
      query.department = departmentId;
    }

    const programmes = await Programme.find(query)
      .populate("department", "name code")
      .sort({ name: 1 });

    return sendSuccess(res, programmes, "Programmes retrieved successfully");
  });

  createProgramme = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { name, code, departmentId, degreeAwarded = "B.Sc.", durationYears = 4 } = req.body;

    let targetDeptId = departmentId;
    if (req.user!.role === UserRole.DEPARTMENT_ADMIN) {
      targetDeptId = req.user!.department;
    }

    if (!name || !code || !targetDeptId) {
      throw new AppError("Programme name, code, and department are required.", 400);
    }

    const programme = await Programme.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      department: targetDeptId,
      degreeAwarded: degreeAwarded.trim(),
      durationYears: Number(durationYears),
    });

    return sendSuccess(res, programme, "Programme created successfully", 201);
  });

  updateProgramme = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { name, code, degreeAwarded, durationYears, isActive } = req.body;

    const prog = await Programme.findById(id);
    if (!prog) {
      throw new AppError("Programme not found.", 404);
    }

    if (
      req.user!.role === UserRole.DEPARTMENT_ADMIN &&
      prog.department.toString() !== req.user!.department?.toString()
    ) {
      throw new AppError("Access denied. Programme outside your department.", 403);
    }

    if (name) prog.name = name.trim();
    if (code) prog.code = code.trim().toUpperCase();
    if (degreeAwarded) prog.degreeAwarded = degreeAwarded.trim();
    if (durationYears) prog.durationYears = Number(durationYears);
    if (isActive !== undefined) prog.isActive = isActive;

    await prog.save();

    return sendSuccess(res, prog, "Programme updated successfully");
  });

  // ================= SESSIONS & SEMESTERS =================

  getSessions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const sessions = await AcademicSession.find().sort({ createdAt: -1 });
    return sendSuccess(res, sessions, "Academic sessions retrieved successfully");
  });

  getCurrentSessionAndSemester = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const currentSession = await AcademicSession.findOne({ isCurrent: true });
    let currentSemester = null;

    if (currentSession) {
      currentSemester = await Semester.findOne({
        session: currentSession._id,
        isCurrent: true,
      });
    }

    return sendSuccess(
      res,
      { currentSession, currentSemester },
      "Current session and semester retrieved successfully",
    );
  });

  createSession = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { name, startDate, endDate, isCurrent } = req.body;
    if (!name) {
      throw new AppError("Academic session name (e.g. 2025/2026) is required.", 400);
    }

    if (isCurrent) {
      await AcademicSession.updateMany({}, { isCurrent: false });
      await Semester.updateMany({}, { isCurrent: false });
    }

    const session = await AcademicSession.create({
      name: name.trim(),
      startDate,
      endDate,
      isCurrent: Boolean(isCurrent),
    });

    // Auto-provision First and Second semesters
    await Semester.create([
      {
        name: SemesterType.FIRST,
        session: session._id,
        isCurrent: Boolean(isCurrent),
        isRegistrationOpen: false,
      },
      {
        name: SemesterType.SECOND,
        session: session._id,
        isCurrent: false,
        isRegistrationOpen: false,
      },
    ]);

    return sendSuccess(res, session, "Academic session created with First & Second semesters", 201);
  });

  setCurrentSession = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { isCurrent = true } = req.body;

    if (isCurrent) {
      await AcademicSession.updateMany({}, { isCurrent: false });
      const session = await AcademicSession.findByIdAndUpdate(
        id,
        { isCurrent: true },
        { new: true },
      );

      if (!session) {
        throw new AppError("Session not found.", 404);
      }

      // Ensure First Semester of this newly active session is active if none is active
      const activeInSession = await Semester.findOne({ session: id as any, isCurrent: true });
      if (!activeInSession) {
        await Semester.updateMany({}, { isCurrent: false });
        await Semester.findOneAndUpdate(
          { session: id as any, name: SemesterType.FIRST },
          { isCurrent: true },
          { upsert: true }
        );
      }

      return sendSuccess(res, session, "Academic session activated successfully");
    } else {
      const session = await AcademicSession.findByIdAndUpdate(
        id,
        { isCurrent: false },
        { new: true },
      );

      if (!session) {
        throw new AppError("Session not found.", 404);
      }

      await Semester.updateMany({ session: id as any }, { isCurrent: false });
      return sendSuccess(res, session, "Academic session deactivated successfully");
    }
  });

  getSemesters = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { sessionId } = req.query;
    const query: any = {};
    if (sessionId) query.session = sessionId;

    // Ensure all sessions have both FIRST and SECOND semester provisioned
    const sessionFilter: any = sessionId ? { _id: sessionId } : {};
    const allSessions = await AcademicSession.find(sessionFilter);
    for (const sess of allSessions) {
      const existing = await Semester.find({ session: sess._id as any });
      const hasFirst = existing.some((s) => s.name === SemesterType.FIRST);
      const hasSecond = existing.some((s) => s.name === SemesterType.SECOND);

      if (!hasFirst) {
        await Semester.create({
          name: SemesterType.FIRST,
          session: sess._id,
          isCurrent: sess.isCurrent,
          isRegistrationOpen: false,
        });
      }
      if (!hasSecond) {
        await Semester.create({
          name: SemesterType.SECOND,
          session: sess._id,
          isCurrent: false,
          isRegistrationOpen: false,
        });
      }
    }

    const semesters = await Semester.find(query)
      .populate("session", "name isCurrent")
      .sort({ createdAt: -1 });

    return sendSuccess(res, semesters, "Semesters retrieved successfully");
  });

  createSemester = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { name, sessionId, isCurrent, isRegistrationOpen } = req.body;
    if (!name || !sessionId) {
      throw new AppError("Semester name and session ID are required.", 400);
    }

    if (isCurrent) {
      await Semester.updateMany({}, { isCurrent: false });
    }

    const semester = await Semester.create({
      name,
      session: sessionId,
      isCurrent: Boolean(isCurrent),
      isRegistrationOpen: isRegistrationOpen !== undefined ? Boolean(isRegistrationOpen) : true,
    });

    return sendSuccess(res, semester, "Semester created successfully", 201);
  });

  setCurrentSemester = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const targetSemester = await Semester.findById(id);
    if (!targetSemester) {
      throw new AppError("Semester not found.", 404);
    }

    // Set other semesters to not current
    await Semester.updateMany({}, { isCurrent: false });
    targetSemester.isCurrent = true;
    await targetSemester.save();

    // Ensure session is also marked active
    await AcademicSession.updateMany({}, { isCurrent: false });
    await AcademicSession.findByIdAndUpdate(targetSemester.session, { isCurrent: true });

    return sendSuccess(res, targetSemester, "Active semester updated successfully");
  });

  toggleRegistrationWindow = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { isOpen } = req.body;

    const semester = await Semester.findById(id);
    if (!semester) {
      throw new AppError("Semester not found.", 404);
    }

    semester.isRegistrationOpen = Boolean(isOpen);
    await semester.save();

    return sendSuccess(
      res,
      semester,
      `Course registration ${semester.isRegistrationOpen ? "opened" : "closed"} successfully`,
    );
  });
}

export const academicController = new AcademicController();
