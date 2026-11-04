import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db";
import {
  Auth,
  User,
  Faculty,
  Department,
  Programme,
  AcademicSession,
  Semester,
  Course,
  CourseAllocation,
  CourseRegistration,
  Result,
  ResultAuditLog,
} from "../models";
import { UserRole } from "../constants/roles";
import { AuditAction, ResultStatus, SemesterType } from "../constants/enums";
import { calculateGradeAndPoint } from "../utils/helpers";
import { hashPassword } from "../utils";

const seedDatabase = async () => {
  try {
    console.log("[Seed] Connecting to database...");
    await connectDB();

    console.log("[Seed] Clearing existing collections...");
    await Promise.all([
      Auth.deleteMany({}),
      User.deleteMany({}),
      Faculty.deleteMany({}),
      Department.deleteMany({}),
      Programme.deleteMany({}),
      AcademicSession.deleteMany({}),
      Semester.deleteMany({}),
      Course.deleteMany({}),
      CourseAllocation.deleteMany({}),
      CourseRegistration.deleteMany({}),
      Result.deleteMany({}),
      ResultAuditLog.deleteMany({}),
    ]);

    const defaultPassword = "Password123!";
    const hashedPassword = await hashPassword(defaultPassword);

    console.log("[Seed] 1. Creating Faculties & Departments...");
    const scienceFaculty = await Faculty.create({
      name: "Faculty of Science",
      code: "SCI",
      description: "Faculty of Basic, Physical and Computational Sciences",
    });

    const engineeringFaculty = await Faculty.create({
      name: "Faculty of Engineering",
      code: "ENG",
      description: "Faculty of Engineering and Technology",
    });

    const csDept = await Department.create({
      name: "Computer Science",
      code: "CSC",
      faculty: scienceFaculty._id,
    });

    const mathDept = await Department.create({
      name: "Mathematics",
      code: "MTH",
      faculty: scienceFaculty._id,
    });

    const eeDept = await Department.create({
      name: "Electrical & Electronics Engineering",
      code: "EEE",
      faculty: engineeringFaculty._id,
    });

    console.log("[Seed] 2. Creating Programmes...");
    const csProg = await Programme.create({
      name: "Computer Science",
      code: "CSC",
      department: csDept._id,
      degreeAwarded: "B.Sc.",
      durationYears: 4,
    });

    const mathProg = await Programme.create({
      name: "Mathematics",
      code: "MTH",
      department: mathDept._id,
      degreeAwarded: "B.Sc.",
      durationYears: 4,
    });

    const eeProg = await Programme.create({
      name: "Electrical & Electronics Engineering",
      code: "EEE",
      department: eeDept._id,
      degreeAwarded: "B.Eng.",
      durationYears: 5,
    });

    console.log("[Seed] 3. Creating Academic Session & Semesters...");
    const session = await AcademicSession.create({
      name: "2025/2026",
      isCurrent: true,
      startDate: new Date("2025-09-01"),
      endDate: new Date("2026-07-31"),
    });

    const firstSemester = await Semester.create({
      name: SemesterType.FIRST,
      session: session._id,
      isCurrent: true,
      isRegistrationOpen: true,
    });

    const secondSemester = await Semester.create({
      name: SemesterType.SECOND,
      session: session._id,
      isCurrent: false,
      isRegistrationOpen: false,
    });

    console.log("[Seed] 4. Creating Courses...");
    const coursesData = [
      // 100 Level CS (Total: 15 units, allows clean 12-24 registration testing)
      {
        code: "CSC 101",
        title: "Introduction to Computer Science",
        creditUnit: 3,
        department: csDept._id,
        programmes: [csProg._id],
        level: 100,
        semester: SemesterType.FIRST,
        description: "Fundamental concepts of computing and problem-solving.",
      },
      {
        code: "CSC 103",
        title: "Introduction to Web Technologies",
        creditUnit: 2,
        department: csDept._id,
        programmes: [csProg._id],
        level: 100,
        semester: SemesterType.FIRST,
        description: "Basics of HTML, CSS, JavaScript, and Internet protocols.",
      },
      {
        code: "CSC 105",
        title: "Algorithm Development & Logic",
        creditUnit: 2,
        department: csDept._id,
        programmes: [csProg._id],
        level: 100,
        semester: SemesterType.FIRST,
        description: "Flowcharts, pseudocode, and algorithmic thinking.",
      },
      {
        code: "MTH 101",
        title: "Elementary Mathematics I",
        creditUnit: 3,
        department: csDept._id,
        programmes: [csProg._id],
        level: 100,
        semester: SemesterType.FIRST,
        description: "Algebra, trigonometry, and coordinate geometry.",
      },
      {
        code: "PHY 101",
        title: "General Physics I",
        creditUnit: 3,
        department: csDept._id,
        programmes: [csProg._id],
        level: 100,
        semester: SemesterType.FIRST,
        description: "Mechanics, thermal physics, and properties of matter.",
      },
      {
        code: "GST 101",
        title: "Use of English & Communication Skills",
        creditUnit: 2,
        department: csDept._id,
        programmes: [csProg._id],
        level: 100,
        semester: SemesterType.FIRST,
        description: "Academic writing, comprehension, and phonetics.",
      },

      // 200 Level CS (Total: 14 units)
      {
        code: "CSC 201",
        title: "Data Structures and Algorithms",
        creditUnit: 3,
        department: csDept._id,
        programmes: [csProg._id],
        level: 200,
        semester: SemesterType.FIRST,
        description: "Linear and non-linear data structures, algorithm complexity.",
      },
      {
        code: "CSC 203",
        title: "Object-Oriented Programming in Java/C++",
        creditUnit: 3,
        department: csDept._id,
        programmes: [csProg._id],
        level: 200,
        semester: SemesterType.FIRST,
        description: "OOP paradigms: encapsulation, inheritance, polymorphism.",
      },
      {
        code: "CSC 205",
        title: "Computer Architecture & Organization",
        creditUnit: 2,
        department: csDept._id,
        programmes: [csProg._id],
        level: 200,
        semester: SemesterType.FIRST,
        description: "CPU organization, ALU, registers, cache, assembly language.",
      },
      {
        code: "CSC 207",
        title: "Database Fundamentals",
        creditUnit: 3,
        department: csDept._id,
        programmes: [csProg._id],
        level: 200,
        semester: SemesterType.FIRST,
        description: "Database modeling, SQL, and relational design.",
      },
      {
        code: "MTH 201",
        title: "Linear Algebra I",
        creditUnit: 3,
        department: csDept._id,
        programmes: [csProg._id],
        level: 200,
        semester: SemesterType.FIRST,
        description: "Matrices, determinants, and vector spaces.",
      },

      // 300 Level CS
      {
        code: "CSC 301",
        title: "Software Engineering & Architecture",
        creditUnit: 3,
        department: csDept._id,
        programmes: [csProg._id],
        level: 300,
        semester: SemesterType.FIRST,
        description: "SDLC, agile methods, architectural patterns, design principles.",
      },
      {
        code: "CSC 303",
        title: "Operating Systems Principles",
        creditUnit: 3,
        department: csDept._id,
        programmes: [csProg._id],
        level: 300,
        semester: SemesterType.FIRST,
        description: "Process management, virtual memory, concurrency, file systems.",
      },
    ];

    const courses = await Course.insertMany(coursesData);
    const csc201 = courses.find((c) => c.code === "CSC 201")!;
    const csc203 = courses.find((c) => c.code === "CSC 203")!;
    const csc205 = courses.find((c) => c.code === "CSC 205")!;
    const csc207 = courses.find((c) => c.code === "CSC 207")!;
    const mth201 = courses.find((c) => c.code === "MTH 201")!;
    const csc301 = courses.find((c) => c.code === "CSC 301")!;

    console.log("[Seed] 5. Creating User Accounts for All 4 Roles (with Auth & User separation)...");

    const createAccount = async (userData: any): Promise<any> => {
      const { email, role, avatar, ...rest } = userData;
      const user = await User.create({
        email: email.toLowerCase().trim(),
        role,
        avatar: avatar || {
          url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.firstName + " " + userData.lastName)}`,
          publicId: undefined,
        },
        ...rest,
      });

      const auth = await Auth.create({
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role,
        user: user._id,
        isActive: true,
      });

      user.auth = auth._id as any;
      await user.save();
      return user;
    };

    // A. Super Admin
    const superAdmin = await createAccount({
      email: "superadmin@uemp.edu.ng",
      role: UserRole.SUPER_ADMIN,
      firstName: "Adeyemi",
      lastName: "Adeleke",
      phone: "+2348011223344",
      avatar: {
        url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        publicId: undefined,
      },
      isActive: true,
    });

    // B. Department Admin (Computer Science)
    const deptAdmin = await createAccount({
      email: "deptadmin.cs@uemp.edu.ng",
      role: UserRole.DEPARTMENT_ADMIN,
      firstName: "Ngozi",
      lastName: "Okonjo",
      department: csDept._id,
      faculty: scienceFaculty._id,
      phone: "+2348022334455",
      avatar: {
        url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
        publicId: undefined,
      },
      isActive: true,
    });

    // C. Lecturers
    const lecturerSmith = await createAccount({
      email: "lecturer.smith@uemp.edu.ng",
      role: UserRole.LECTURER,
      firstName: "Babatunde",
      lastName: "Smith",
      department: csDept._id,
      faculty: scienceFaculty._id,
      phone: "+2348033445566",
      avatar: {
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        publicId: undefined,
      },
      isActive: true,
      lecturerProfile: {
        staffId: "STF/CSC/101",
        title: "Dr.",
        designation: "Senior Lecturer",
      },
    });

    const lecturerDoe = await createAccount({
      email: "lecturer.doe@uemp.edu.ng",
      role: UserRole.LECTURER,
      firstName: "Chioma",
      lastName: "Doe",
      department: csDept._id,
      faculty: scienceFaculty._id,
      phone: "+2348044556677",
      avatar: {
        url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
        publicId: undefined,
      },
      isActive: true,
      lecturerProfile: {
        staffId: "STF/CSC/102",
        title: "Mrs.",
        designation: "Lecturer I",
      },
    });

    // D. Students
    // Student 1 (200L - With course registrations and approved results)
    const studentEmeka = await createAccount({
      email: "student.emeka@uemp.edu.ng",
      role: UserRole.STUDENT,
      firstName: "Emeka",
      lastName: "Chukwu",
      otherName: "David",
      department: csDept._id,
      faculty: scienceFaculty._id,
      phone: "+2348055667788",
      avatar: {
        url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
        publicId: undefined,
      },
      isActive: true,
      studentProfile: {
        matricNumber: "UEMP/2024/001",
        programme: csProg._id,
        level: 200,
        entrySession: session._id,
      },
    });

    // Student 2 (200L - Registered courses, result submitted)
    const studentFatima = await createAccount({
      email: "student.fatima@uemp.edu.ng",
      role: UserRole.STUDENT,
      firstName: "Fatima",
      lastName: "Bello",
      otherName: "Amina",
      department: csDept._id,
      faculty: scienceFaculty._id,
      phone: "+2348066778899",
      avatar: {
        url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
        publicId: undefined,
      },
      isActive: true,
      studentProfile: {
        matricNumber: "UEMP/2024/002",
        programme: csProg._id,
        level: 200,
        entrySession: session._id,
      },
    });

    // Student 3 (100L - Fresh student, has NOT registered courses yet -> ready for live Workflow 1 test)
    const studentKemi = await createAccount({
      email: "student.kemi@uemp.edu.ng",
      role: UserRole.STUDENT,
      firstName: "Kemi",
      lastName: "Adesanya",
      otherName: "Grace",
      department: csDept._id,
      faculty: scienceFaculty._id,
      phone: "+2348077889900",
      avatar: {
        url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
        publicId: undefined,
      },
      isActive: true,
      studentProfile: {
        matricNumber: "UEMP/2025/001",
        programme: csProg._id,
        level: 100,
        entrySession: session._id,
      },
    });

    console.log("[Seed] 6. Creating Course Allocations...");
    // Lecturer Smith teaches CSC 201, CSC 205, and CSC 301
    await CourseAllocation.create({
      course: csc201._id,
      lecturer: lecturerSmith._id,
      session: session._id,
      semester: firstSemester._id,
      assignedBy: deptAdmin._id,
    });

    await CourseAllocation.create({
      course: csc205._id,
      lecturer: lecturerSmith._id,
      session: session._id,
      semester: firstSemester._id,
      assignedBy: deptAdmin._id,
    });

    await CourseAllocation.create({
      course: csc301._id,
      lecturer: lecturerSmith._id,
      session: session._id,
      semester: firstSemester._id,
      assignedBy: deptAdmin._id,
    });

    // Lecturer Doe teaches CSC 203 and CSC 207
    await CourseAllocation.create({
      course: csc203._id,
      lecturer: lecturerDoe._id,
      session: session._id,
      semester: firstSemester._id,
      assignedBy: deptAdmin._id,
    });

    await CourseAllocation.create({
      course: csc207._id,
      lecturer: lecturerDoe._id,
      session: session._id,
      semester: firstSemester._id,
      assignedBy: deptAdmin._id,
    });

    console.log("[Seed] 7. Creating Course Registrations (14 Credit Units, within 12-24 limit)...");
    // Emeka registers for 200L First Semester courses (CSC 201, CSC 203, CSC 205, CSC 207, MTH 201 = 14 units)
    await CourseRegistration.create({
      student: studentEmeka._id,
      session: session._id,
      semester: firstSemester._id,
      department: csDept._id,
      programme: csProg._id,
      level: 200,
      courses: [
        { course: csc201._id, creditUnit: csc201.creditUnit, registeredAt: new Date() },
        { course: csc203._id, creditUnit: csc203.creditUnit, registeredAt: new Date() },
        { course: csc205._id, creditUnit: csc205.creditUnit, registeredAt: new Date() },
        { course: csc207._id, creditUnit: csc207.creditUnit, registeredAt: new Date() },
        { course: mth201._id, creditUnit: mth201.creditUnit, registeredAt: new Date() },
      ],
      totalCreditUnits: 14,
      status: "APPROVED",
    });

    // Fatima registers for 200L First Semester courses
    await CourseRegistration.create({
      student: studentFatima._id,
      session: session._id,
      semester: firstSemester._id,
      department: csDept._id,
      programme: csProg._id,
      level: 200,
      courses: [
        { course: csc201._id, creditUnit: csc201.creditUnit, registeredAt: new Date() },
        { course: csc203._id, creditUnit: csc203.creditUnit, registeredAt: new Date() },
        { course: csc205._id, creditUnit: csc205.creditUnit, registeredAt: new Date() },
        { course: csc207._id, creditUnit: csc207.creditUnit, registeredAt: new Date() },
        { course: mth201._id, creditUnit: mth201.creditUnit, registeredAt: new Date() },
      ],
      totalCreditUnits: 14,
      status: "APPROVED",
    });

    console.log("[Seed] 8. Creating Sample Results & Audit Trail...");

    // Result 1: CSC 201 -> APPROVED (visible to students Emeka & Fatima!)
    const csc201ScoreEmeka = calculateGradeAndPoint(82); // 27 CA + 55 Exam = 82 -> A, 5.0
    const csc201ScoreFatima = calculateGradeAndPoint(74); // 24 CA + 50 Exam = 74 -> A, 5.0

    const result201 = await Result.create({
      course: csc201._id,
      session: session._id,
      semester: firstSemester._id,
      department: csDept._id,
      lecturer: lecturerSmith._id,
      status: ResultStatus.APPROVED,
      scores: [
        {
          student: studentEmeka._id,
          caScore: 27,
          examScore: 55,
          totalScore: 82,
          grade: csc201ScoreEmeka.grade,
          gradePoint: csc201ScoreEmeka.gradePoint,
          creditUnit: csc201.creditUnit,
        },
        {
          student: studentFatima._id,
          caScore: 24,
          examScore: 50,
          totalScore: 74,
          grade: csc201ScoreFatima.grade,
          gradePoint: csc201ScoreFatima.gradePoint,
          creditUnit: csc201.creditUnit,
        },
      ],
      submittedAt: new Date(Date.now() - 3600000 * 24),
      reviewedAt: new Date(Date.now() - 3600000 * 12),
      reviewedBy: deptAdmin._id,
    });

    // Audit logs for Result 1
    await ResultAuditLog.create({
      result: result201._id,
      course: csc201._id,
      actor: lecturerSmith._id,
      action: AuditAction.RESULT_SUBMITTED,
      previousStatus: ResultStatus.DRAFT,
      newStatus: ResultStatus.SUBMITTED,
      comments: "Result submitted by Dr. Babatunde Smith",
    });

    await ResultAuditLog.create({
      result: result201._id,
      course: csc201._id,
      actor: deptAdmin._id,
      action: AuditAction.RESULT_APPROVED,
      previousStatus: ResultStatus.SUBMITTED,
      newStatus: ResultStatus.APPROVED,
      comments: "Result approved by HOD Dr. Ngozi Okonjo",
    });

    // Result 2: CSC 203 -> SUBMITTED (in pending queue for Dept Admin to review & approve/reject)
    const csc203ScoreEmeka = calculateGradeAndPoint(68); // B, 4.0
    const csc203ScoreFatima = calculateGradeAndPoint(62); // B, 4.0

    const result203 = await Result.create({
      course: csc203._id,
      session: session._id,
      semester: firstSemester._id,
      department: csDept._id,
      lecturer: lecturerDoe._id,
      status: ResultStatus.SUBMITTED,
      scores: [
        {
          student: studentEmeka._id,
          caScore: 25,
          examScore: 43,
          totalScore: 68,
          grade: csc203ScoreEmeka.grade,
          gradePoint: csc203ScoreEmeka.gradePoint,
          creditUnit: csc203.creditUnit,
        },
        {
          student: studentFatima._id,
          caScore: 22,
          examScore: 40,
          totalScore: 62,
          grade: csc203ScoreFatima.grade,
          gradePoint: csc203ScoreFatima.gradePoint,
          creditUnit: csc203.creditUnit,
        },
      ],
      submittedAt: new Date(),
    });

    await ResultAuditLog.create({
      result: result203._id,
      course: csc203._id,
      actor: lecturerDoe._id,
      action: AuditAction.RESULT_SUBMITTED,
      previousStatus: ResultStatus.DRAFT,
      newStatus: ResultStatus.SUBMITTED,
      comments: "Scores submitted for departmental review by Mrs. Chioma Doe",
    });

    // Result 3: CSC 205 -> DRAFT (Lecturer Smith has saved draft scores)
    await Result.create({
      course: csc205._id,
      session: session._id,
      semester: firstSemester._id,
      department: csDept._id,
      lecturer: lecturerSmith._id,
      status: ResultStatus.DRAFT,
      scores: [
        {
          student: studentEmeka._id,
          caScore: 20,
          examScore: 0,
          totalScore: 20,
          grade: "F",
          gradePoint: 0,
          creditUnit: csc205.creditUnit,
        },
      ],
    });

    console.log("=================================================");
    console.log("   UEMP DATABASE SEEDED SUCCESSFULLY!           ");
    console.log("=================================================");
    console.log("TEST CREDENTIALS (Password for all: Password123!)");
    console.log("-------------------------------------------------");
    console.log("1. Super Admin:      superadmin@uemp.edu.ng");
    console.log("2. Dept Admin (CS):  deptadmin.cs@uemp.edu.ng");
    console.log("3. Lecturer 1:       lecturer.smith@uemp.edu.ng (or STF/CSC/101)");
    console.log("4. Lecturer 2:       lecturer.doe@uemp.edu.ng (or STF/CSC/102)");
    console.log("5. Student (200L):   student.emeka@uemp.edu.ng (or UEMP/2024/001)");
    console.log("6. Student (200L):   student.fatima@uemp.edu.ng (or UEMP/2024/002)");
    console.log("7. Student (100L):   student.kemi@uemp.edu.ng (or UEMP/2025/001) [Unregistered]");
    console.log("=================================================");

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error("[Seed Error] Failed to seed database:", err);
    await disconnectDB();
    process.exit(1);
  }
};

seedDatabase();
