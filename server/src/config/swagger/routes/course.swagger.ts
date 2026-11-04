export const courseSwagger = {
  "/courses/assigned": {
    get: {
      tags: ["Courses"],
      summary: "Get Lecturer Assigned Courses",
      description: "Retrieve all courses allocated to the authenticated lecturer for teaching and score entry.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Assigned courses retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Assigned courses retrieved successfully" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Course" },
                  },
                },
              },
            },
          },
        },
        403: { description: "Forbidden: Lecturers only" },
      },
    },
  },

  "/courses/allocations": {
    get: {
      tags: ["Courses"],
      summary: "List Course Allocations",
      description: "List course allocations across lecturers, academic sessions, and semesters.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "departmentId", in: "query", schema: { type: "string" } },
        { name: "sessionId", in: "query", schema: { type: "string" } },
        { name: "semesterId", in: "query", schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Course allocations retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Course allocations retrieved successfully" },
                  data: { type: "array", items: { type: "object" } },
                },
              },
            },
          },
        },
      },
    },
  },

  "/courses/allocate": {
    post: {
      tags: ["Courses"],
      summary: "Allocate Course to Lecturer",
      description: "Assigns a course to a lecturer for a specific academic session and semester.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["courseId", "lecturerId"],
              properties: {
                courseId: { type: "string", example: "672750e39c5b967f01234701" },
                lecturerId: { type: "string", example: "672750e39c5b967f01234601" },
                sessionId: { type: "string" },
                semesterId: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Course allocated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Course allocated successfully" },
                  data: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
  },

  "/courses": {
    get: {
      tags: ["Courses"],
      summary: "List Courses",
      description: "Retrieve departmental and institutional course directory.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "departmentId", in: "query", schema: { type: "string" } },
        { name: "level", in: "query", schema: { type: "integer" } },
        { name: "semester", in: "query", schema: { type: "string", enum: ["FIRST", "SECOND"] } },
      ],
      responses: {
        200: {
          description: "Courses retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Courses retrieved successfully" },
                  data: {
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
    post: {
      tags: ["Courses"],
      summary: "Create Course",
      description: "Create a new course in the curriculum.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["code", "title", "creditUnit", "departmentId", "semester", "level"],
              properties: {
                code: { type: "string", example: "CSC 301" },
                title: { type: "string", example: "Data Structures & Algorithms" },
                creditUnit: { type: "integer", minimum: 1, maximum: 6, example: 3 },
                departmentId: { type: "string", example: "672750e39c5b967f01234511" },
                semester: { type: "string", enum: ["FIRST", "SECOND"], example: "FIRST" },
                level: { type: "integer", enum: [100, 200, 300, 400, 500, 600], example: 300 },
                isElective: { type: "boolean", default: false },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Course created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Course created successfully" },
                  data: { $ref: "#/components/schemas/Course" },
                },
              },
            },
          },
        },
      },
    },
  },

  "/courses/{id}": {
    get: {
      tags: ["Courses"],
      summary: "Get Course Details",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Course retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Course retrieved successfully" },
                  data: { $ref: "#/components/schemas/Course" },
                },
              },
            },
          },
        },
      },
    },
    put: {
      tags: ["Courses"],
      summary: "Update Course",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string", example: "Advanced Data Structures & Algorithms" },
                creditUnit: { type: "integer", example: 3 },
                isElective: { type: "boolean" },
                isActive: { type: "boolean" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Course updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Course updated successfully" },
                  data: { $ref: "#/components/schemas/Course" },
                },
              },
            },
          },
        },
      },
    },
  },
};
