import { Application, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerRoutesPaths } from "./routes";
import { logger } from "../../utils/logger";

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "University Education Management Portal (UEMP) API",
    version: "1.0.0",
    description:
      "Official REST API documentation for the UEMP portal platform. Designed for Super Admins, Department Admins, Lecturers, and Students.",
    contact: {
      name: "Lead Web Praxis Media Limited - UEMP Portal Engineering",
    },
  },
  servers: [
    {
      url: "/api/v1",
      description: "Default API v1 Base Path",
    },
    {
      url: "http://localhost:5000/api/v1",
      description: "Local Development Server",
    },
  ],
  tags: [
    {
      name: "System Health",
      description: "API server, database connection, and environment operational status",
    },
    {
      name: "Authentication",
      description: "User authentication, profile management, credentials, and session control",
    },
    {
      name: "Administration",
      description: "University administrative management, user creation, and status controls",
    },
    {
      name: "Course Registration",
      description: "Workflow 1: Student semester course registration and slips",
    },
    {
      name: "Results & Grading",
      description: "Workflows 2 & 3: CA/Exam score entry, submission, departmental approval, and GPA/CGPA",
    },
    {
      name: "Courses",
      description: "Curriculum courses directory, course allocations, and teaching assignments",
    },
    {
      name: "Academic Structure",
      description: "Faculties, departments, programmes, sessions, and semesters",
    },
    {
      name: "Reports & Analytics",
      description: "Broadsheets, student result statements, and audit logging",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT access token (without 'Bearer ' prefix).",
      },
    },
    schemas: {
      PaginationMeta: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 20 },
          total: { type: "integer", example: 45 },
          totalPages: { type: "integer", example: 3 },
          hasNextPage: { type: "boolean", example: true },
          hasPrevPage: { type: "boolean", example: false },
        },
      },
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation completed successfully" },
          data: { type: "object" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error message describing the issue" },
          errors: {
            type: "array",
            items: { type: "object" },
            nullable: true,
          },
        },
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "672750e39c5b967f01234567" },
          firstName: { type: "string", example: "Chinedu" },
          lastName: { type: "string", example: "Okafor" },
          otherName: { type: "string", example: "Emeka", nullable: true },
          email: { type: "string", format: "email", example: "chinedu.okafor@uemp.edu.ng" },
          phone: { type: "string", example: "+2348012345678", nullable: true },
          role: {
            type: "string",
            enum: ["SUPER_ADMIN", "DEPARTMENT_ADMIN", "LECTURER", "STUDENT"],
            example: "STUDENT",
          },
          department: {
            type: "object",
            properties: {
              _id: { type: "string", example: "672750e39c5b967f01234511" },
              name: { type: "string", example: "Computer Science" },
              code: { type: "string", example: "CSC" },
            },
            nullable: true,
          },
          faculty: {
            type: "object",
            properties: {
              _id: { type: "string", example: "672750e39c5b967f01234500" },
              name: { type: "string", example: "Faculty of Science" },
              code: { type: "string", example: "FSC" },
            },
            nullable: true,
          },
          avatar: {
            type: "object",
            properties: {
              url: {
                type: "string",
                example: "https://res.cloudinary.com/uemp/image/upload/v1/uemp/avatars/avatar1.jpg",
              },
              publicId: { type: "string", example: "uemp/avatars/avatar1" },
            },
            nullable: true,
          },
          studentProfile: {
            type: "object",
            properties: {
              matricNumber: { type: "string", example: "UEMP/2023/CSC/001" },
              level: { type: "integer", enum: [100, 200, 300, 400, 500, 600], example: 300 },
              programme: { type: "string", example: "672750e39c5b967f01234522" },
            },
            nullable: true,
          },
          lecturerProfile: {
            type: "object",
            properties: {
              staffId: { type: "string", example: "STF/CSC/001" },
              title: { type: "string", example: "Dr." },
              designation: { type: "string", example: "Senior Lecturer" },
            },
            nullable: true,
          },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Course: {
        type: "object",
        properties: {
          _id: { type: "string", example: "672750e39c5b967f01234701" },
          code: { type: "string", example: "CSC 301" },
          title: { type: "string", example: "Data Structures & Algorithms" },
          creditUnit: { type: "integer", example: 3 },
          level: { type: "integer", example: 300 },
          semester: { type: "string", enum: ["FIRST", "SECOND"], example: "FIRST" },
          isElective: { type: "boolean", example: false },
          department: { type: "object" },
          isActive: { type: "boolean", example: true },
        },
      },
      CourseRegistration: {
        type: "object",
        properties: {
          _id: { type: "string", example: "672750e39c5b967f01234801" },
          student: { $ref: "#/components/schemas/User" },
          session: { type: "object" },
          semester: { type: "object" },
          department: { type: "object" },
          programme: { type: "object" },
          level: { type: "integer", example: 300 },
          totalCreditUnits: { type: "integer", example: 18 },
          courses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                course: { $ref: "#/components/schemas/Course" },
                creditUnit: { type: "integer", example: 3 },
              },
            },
          },
          status: { type: "string", example: "APPROVED" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Result: {
        type: "object",
        properties: {
          _id: { type: "string", example: "672750e39c5b967f01234901" },
          course: { $ref: "#/components/schemas/Course" },
          session: { type: "object" },
          semester: { type: "object" },
          department: { type: "object" },
          lecturer: { $ref: "#/components/schemas/User" },
          status: {
            type: "string",
            enum: ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"],
            example: "APPROVED",
          },
          scores: {
            type: "array",
            items: {
              type: "object",
              properties: {
                student: { $ref: "#/components/schemas/User" },
                caScore: { type: "number", example: 28 },
                examScore: { type: "number", example: 54 },
                totalScore: { type: "number", example: 82 },
                grade: { type: "string", example: "A" },
                gradePoint: { type: "number", example: 5 },
              },
            },
          },
          rejectionRemarks: { type: "string", nullable: true },
          submittedAt: { type: "string", format: "date-time", nullable: true },
          approvedAt: { type: "string", format: "date-time", nullable: true },
        },
      },
    },
  },
  paths: {
    ...swaggerRoutesPaths,
  },
};

export function setupSwagger(app: Application): void {
  // Swagger UI route
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "UEMP Portal API Documentation",
      customCss: ".swagger-ui .topbar { display: block; background-color: #0f172a; }",
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: "list",
        filter: true,
      },
    }),
  );

  // Raw JSON spec endpoint
  app.get("/api/docs.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  logger.info("[Swagger] Documentation initialized at /api/docs");
}
