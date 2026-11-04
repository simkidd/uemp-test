export const reportSwagger = {
  "/reports/stats": {
    get: {
      tags: ["Reports & Analytics"],
      summary: "Role-scoped Dashboard Statistics",
      description: "Aggregated counts and performance metrics scoped by caller role and department.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Statistics retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
  },

  "/reports/audit-logs": {
    get: {
      tags: ["Reports & Analytics"],
      summary: "Audit Trail of Result Actions (Paginated)",
      description:
        "Immutable log of all examination result actions: score submission, departmental approval, rejection remarks, and reopening authorizations.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "courseId", in: "query", schema: { type: "string" } },
        { name: "action", in: "query", schema: { type: "string", enum: ["RESULT_SAVED_DRAFT", "RESULT_SUBMITTED", "RESULT_APPROVED", "RESULT_REJECTED", "RESULT_REOPENED"] } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 25 } },
      ],
      responses: {
        200: {
          description: "Audit logs retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Audit logs retrieved successfully" },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        _id: { type: "string" },
                        action: { type: "string" },
                        actor: { $ref: "#/components/schemas/User" },
                        course: { $ref: "#/components/schemas/Course" },
                        details: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                      },
                    },
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

  "/reports/broadsheet": {
    get: {
      tags: ["Reports & Analytics"],
      summary: "Department Broadsheet Report",
      description:
        "Generates a multi-course matrix broadsheet for a department, semester, and academic level, listing all students, their respective course scores, units passed, and semester GPAs.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "departmentId", in: "query", required: true, schema: { type: "string" } },
        { name: "sessionId", in: "query", schema: { type: "string" } },
        { name: "semesterId", in: "query", schema: { type: "string" } },
        { name: "level", in: "query", schema: { type: "integer" } },
      ],
      responses: {
        200: {
          description: "Department broadsheet retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Department broadsheet generated successfully" },
                  data: {
                    type: "object",
                    properties: {
                      department: { type: "object" },
                      courses: { type: "array", items: { $ref: "#/components/schemas/Course" } },
                      students: { type: "array", items: { type: "object" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
