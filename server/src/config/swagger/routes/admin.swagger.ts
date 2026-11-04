export const adminSwagger = {
  "/admin/overview": {
    get: {
      tags: ["Administration"],
      summary: "Get Administrative Dashboard Metrics",
      description:
        "Retrieve institutional KPIs: total students, lecturers, admins, courses, pending result submissions, approved results, active session/semester, and recent audit logs.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Admin overview metrics fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Admin dashboard overview retrieved successfully" },
                  data: {
                    type: "object",
                    properties: {
                      activeSession: { type: "object" },
                      activeSemester: { type: "object" },
                      metrics: {
                        type: "object",
                        properties: {
                          totalStudents: { type: "integer", example: 1250 },
                          totalLecturers: { type: "integer", example: 84 },
                          totalAdmins: { type: "integer", example: 12 },
                          totalCourses: { type: "integer", example: 120 },
                          totalDepartments: { type: "integer", example: 8 },
                          totalFaculties: { type: "integer", example: 3 },
                          pendingSubmissionsCount: { type: "integer", example: 5 },
                          approvedResultsCount: { type: "integer", example: 42 },
                          totalRegistrations: { type: "integer", example: 1180 },
                        },
                      },
                      recentAuditLogs: { type: "array", items: { type: "object" } },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden: Super Admin or Department Admin only" },
      },
    },
  },

  "/admin/audit-logs": {
    get: {
      tags: ["Administration"],
      summary: "Audit Trail of Result Actions (Paginated)",
      description:
        "Administrative access to the immutable audit log of result submissions, approvals, rejections, and score changes. (Also accessible via /reports/audit-logs).",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "courseId", in: "query", schema: { type: "string" }, description: "Filter by course ID" },
        {
          name: "action",
          in: "query",
          schema: {
            type: "string",
            enum: ["RESULT_SAVED_DRAFT", "RESULT_SUBMITTED", "RESULT_APPROVED", "RESULT_REJECTED", "RESULT_REOPENED"],
          },
          description: "Filter by action type",
        },
        { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
        { name: "limit", in: "query", schema: { type: "integer", default: 25 }, description: "Items per page" },
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
                        comments: { type: "string" },
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
        401: { description: "Unauthorized" },
        403: { description: "Forbidden: Super Admin or Department Admin only" },
      },
    },
  },

  "/admin/users": {
    get: {
      tags: ["Administration"],
      summary: "List Users (Paginated & Filterable)",
      description:
        "List students, lecturers, and admins with search, role, department, and pagination support. Department Admins are automatically scoped to their department.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "role", in: "query", schema: { type: "string", enum: ["SUPER_ADMIN", "DEPARTMENT_ADMIN", "LECTURER", "STUDENT"] }, description: "Filter by role" },
        { name: "departmentId", in: "query", schema: { type: "string" }, description: "Filter by department ID (Super Admin only)" },
        { name: "search", in: "query", schema: { type: "string" }, description: "Search by name, email, matriculation number, or staff ID" },
        { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
        { name: "limit", in: "query", schema: { type: "integer", default: 20 }, description: "Page limit" },
      ],
      responses: {
        200: {
          description: "Users list fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Users retrieved successfully" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/User" },
                  },
                  pagination: { $ref: "#/components/schemas/PaginationMeta" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden: Super Admin or Department Admin only" },
      },
    },
    post: {
      tags: ["Administration"],
      summary: "Create User Account with Credentials and Avatar",
      description:
        "Creates both User profile and Auth credentials atomically. Supports multipart form data for uploading official passport photograph with facial centering.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["email", "role", "firstName", "lastName"],
              properties: {
                email: { type: "string", format: "email", example: "jane.doe@uemp.edu.ng" },
                password: { type: "string", default: "Password123!", example: "Password123!" },
                role: { type: "string", enum: ["SUPER_ADMIN", "DEPARTMENT_ADMIN", "LECTURER", "STUDENT"], example: "STUDENT" },
                firstName: { type: "string", example: "Jane" },
                lastName: { type: "string", example: "Doe" },
                otherName: { type: "string", example: "Chioma" },
                phone: { type: "string", example: "+2348098765432" },
                departmentId: { type: "string", example: "672750e39c5b967f01234511" },
                facultyId: { type: "string", example: "672750e39c5b967f01234500" },
                programmeId: { type: "string", example: "672750e39c5b967f01234522", description: "Required for Students" },
                level: { type: "integer", enum: [100, 200, 300, 400, 500, 600], default: 100, description: "Student academic level" },
                matricNumber: { type: "string", example: "UEMP/2026/CSC/099", description: "Optional: auto-generated if omitted" },
                staffId: { type: "string", example: "STF/CSC/042", description: "Optional: auto-generated if omitted" },
                title: { type: "string", example: "Prof.", description: "Lecturer title" },
                designation: { type: "string", example: "Professor of Software Engineering" },
                avatar: { type: "string", format: "binary", description: "Official passport photograph file" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "User account created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "User account and authentication credentials created successfully" },
                  data: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/User" },
                      auth: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          email: { type: "string" },
                          role: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: "Validation error" },
        409: { description: "Email, Matric Number, or Staff ID already exists" },
      },
    },
  },

  "/admin/users/{id}": {
    get: {
      tags: ["Administration"],
      summary: "Get User Details by ID",
      description: "Retrieve complete profile information, role, and academic metadata for a single user.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" },
      ],
      responses: {
        200: {
          description: "User details retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "User retrieved successfully" },
                  data: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },
        403: { description: "Forbidden: Department boundary violation" },
        404: { description: "User not found" },
      },
    },
    patch: {
      tags: ["Administration"],
      summary: "Update User Account / Change Student Passport",
      description:
        "Update user information. Authorized Department Admins and Super Admins can use this endpoint to replace an official student passport photo or correct registered names.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "User ID" },
      ],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                firstName: { type: "string", example: "Jane" },
                lastName: { type: "string", example: "Smith" },
                otherName: { type: "string", example: "Chioma" },
                phone: { type: "string", example: "+2348098765432" },
                level: { type: "integer", enum: [100, 200, 300, 400, 500, 600], description: "Update student level" },
                designation: { type: "string", description: "Update lecturer designation" },
                title: { type: "string", description: "Update lecturer title" },
                avatar: { type: "string", format: "binary", description: "New official passport photo" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "User profile updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "User profile updated successfully" },
                  data: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },
        403: { description: "Forbidden: Department boundary violation" },
        404: { description: "User not found" },
      },
    },
  },

  "/admin/users/{id}/status": {
    patch: {
      tags: ["Administration"],
      summary: "Activate / Deactivate / Suspend Account",
      description:
        "Toggle active status of user accounts across both Auth and User collections. Restricted to Super Admin per §2.D.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Target User ID" },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["isActive"],
              properties: {
                isActive: { type: "boolean", description: "True to activate, false to suspend/deactivate", example: false },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Account status updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Account deactivated successfully" },
                  data: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      isActive: { type: "boolean" },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: "Cannot modify status of own account or missing isActive" },
        403: { description: "Forbidden: Super Admin only" },
        404: { description: "User not found" },
      },
    },
  },

  "/admin/users/{id}/reset-password": {
    post: {
      tags: ["Administration"],
      summary: "Admin Password Reset",
      description:
        "Administratively reset a user's password and revoke active refresh tokens.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Target User ID" },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                newPassword: { type: "string", default: "Password123!", example: "NewTempPassword123!" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Password reset successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "User password reset successfully" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        404: { description: "User or authentication record not found" },
      },
    },
  },
};
