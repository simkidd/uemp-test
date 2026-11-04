export const registrationSwagger = {
  "/registrations/available": {
    get: {
      tags: ["Course Registration"],
      summary: "Get Available Courses for Student (Workflow 1)",
      description:
        "Fetches courses matching the student's department, programme, academic level, and current active semester. Displays credit limits (minimum 12, maximum 24 units).",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Available courses retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Available courses retrieved successfully" },
                  data: {
                    type: "object",
                    properties: {
                      session: { type: "object" },
                      semester: { type: "object" },
                      creditLimits: {
                        type: "object",
                        properties: {
                          min: { type: "integer", example: 12 },
                          max: { type: "integer", example: 24 },
                        },
                      },
                      courses: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Course" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: "Registration window is closed or no active session/semester" },
        403: { description: "Forbidden: Students only" },
      },
    },
  },

  "/registrations": {
    post: {
      tags: ["Course Registration"],
      summary: "Register Semester Courses (Workflow 1)",
      description:
        "Submit selected courses for the active semester. Validates credit limits (12–24 units), ensures registration window is open, and prevents duplicate registration.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["courseIds"],
              properties: {
                courseIds: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of Course IDs selected by the student",
                  example: ["672750e39c5b967f01234701", "672750e39c5b967f01234702"],
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Course registration completed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Course registration completed successfully" },
                  data: { $ref: "#/components/schemas/CourseRegistration" },
                },
              },
            },
          },
        },
        400: { description: "Credit units out of range (must be 12–24) or registration window closed" },
        409: { description: "Courses already registered for this semester" },
      },
    },
    get: {
      tags: ["Course Registration"],
      summary: "List Registrations (Super Admin & Dept Admin)",
      description:
        "View student course registrations with session, semester, department, level, and pagination filters.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "departmentId", in: "query", schema: { type: "string" } },
        { name: "sessionId", in: "query", schema: { type: "string" } },
        { name: "semesterId", in: "query", schema: { type: "string" } },
        { name: "level", in: "query", schema: { type: "integer" } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
      ],
      responses: {
        200: {
          description: "Registrations retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Registrations retrieved successfully" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/CourseRegistration" },
                  },
                  pagination: { $ref: "#/components/schemas/PaginationMeta" },
                },
              },
            },
          },
        },
      },
    },
  },

  "/registrations/my": {
    get: {
      tags: ["Course Registration"],
      summary: "Get Student's Own Registrations",
      description: "Retrieve all semester course registrations submitted by the authenticated student.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "My registrations retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "My registrations retrieved successfully" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/CourseRegistration" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  "/registrations/slip/{registrationId}": {
    get: {
      tags: ["Course Registration"],
      summary: "Get Course Registration Slip (Printable Summary)",
      description:
        "Generates full registration slip data for official printing: student details, department, registered courses with units, and total credits.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "registrationId", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Registration slip retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Registration slip retrieved successfully" },
                  data: {
                    type: "object",
                    properties: {
                      registration: { $ref: "#/components/schemas/CourseRegistration" },
                      generatedAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
        404: { description: "Registration not found" },
      },
    },
  },
};
