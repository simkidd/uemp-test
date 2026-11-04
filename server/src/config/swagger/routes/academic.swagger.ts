export const academicSwagger = {
  "/academics/current": {
    get: {
      tags: ["Academic Structure"],
      summary: "Get Current Active Session & Semester",
      description: "Returns the university's currently active academic session, semester, and registration window state.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Current session and semester retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Current academic session and semester retrieved successfully" },
                  data: {
                    type: "object",
                    properties: {
                      session: { type: "object" },
                      semester: { type: "object" },
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

  "/academics/faculties": {
    get: {
      tags: ["Academic Structure"],
      summary: "List Faculties",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Faculties retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { type: "array", items: { type: "object" } },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Academic Structure"],
      summary: "Create Faculty (Super Admin)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "code"],
              properties: {
                name: { type: "string", example: "Faculty of Engineering" },
                code: { type: "string", example: "FENG" },
                description: { type: "string" },
              },
            },
          },
        },
      },
      responses: { 201: { description: "Faculty created successfully" } },
    },
  },

  "/academics/faculties/{id}": {
    put: {
      tags: ["Academic Structure"],
      summary: "Update Faculty (Super Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                isActive: { type: "boolean" },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Faculty updated successfully" } },
    },
  },

  "/academics/departments": {
    get: {
      tags: ["Academic Structure"],
      summary: "List Departments",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "facultyId", in: "query", schema: { type: "string" } }],
      responses: {
        200: {
          description: "Departments retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { type: "array", items: { type: "object" } },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Academic Structure"],
      summary: "Create Department (Super Admin)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "code", "facultyId"],
              properties: {
                name: { type: "string", example: "Software Engineering" },
                code: { type: "string", example: "SEN" },
                facultyId: { type: "string", example: "672750e39c5b967f01234500" },
              },
            },
          },
        },
      },
      responses: { 201: { description: "Department created successfully" } },
    },
  },

  "/academics/departments/{id}": {
    put: {
      tags: ["Academic Structure"],
      summary: "Update Department (Super Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                isActive: { type: "boolean" },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Department updated successfully" } },
    },
  },

  "/academics/programmes": {
    get: {
      tags: ["Academic Structure"],
      summary: "List Academic Programmes",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "departmentId", in: "query", schema: { type: "string" } }],
      responses: {
        200: {
          description: "Programmes retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { type: "array", items: { type: "object" } },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Academic Structure"],
      summary: "Create Programme (Super Admin & Dept Admin)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "code", "departmentId"],
              properties: {
                name: { type: "string", example: "B.Sc. Computer Science" },
                code: { type: "string", example: "BSC-CSC" },
                departmentId: { type: "string", example: "672750e39c5b967f01234511" },
                durationYears: { type: "integer", default: 4, example: 4 },
              },
            },
          },
        },
      },
      responses: { 201: { description: "Programme created successfully" } },
    },
  },

  "/academics/programmes/{id}": {
    put: {
      tags: ["Academic Structure"],
      summary: "Update Programme",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                durationYears: { type: "integer" },
                isActive: { type: "boolean" },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Programme updated successfully" } },
    },
  },

  "/academics/sessions": {
    get: {
      tags: ["Academic Structure"],
      summary: "List Academic Sessions",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Sessions retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { type: "array", items: { type: "object" } },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Academic Structure"],
      summary: "Create Academic Session (Super Admin)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "startDate", "endDate"],
              properties: {
                name: { type: "string", example: "2026/2027" },
                startDate: { type: "string", format: "date", example: "2026-09-01" },
                endDate: { type: "string", format: "date", example: "2027-07-31" },
                isCurrent: { type: "boolean", default: false },
              },
            },
          },
        },
      },
      responses: { 201: { description: "Session created successfully" } },
    },
  },

  "/academics/sessions/{id}/set-current": {
    patch: {
      tags: ["Academic Structure"],
      summary: "Set Session as University Current (Super Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Current session updated successfully" } },
    },
  },

  "/academics/semesters": {
    get: {
      tags: ["Academic Structure"],
      summary: "List Semesters",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "sessionId", in: "query", schema: { type: "string" } }],
      responses: {
        200: {
          description: "Semesters retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { type: "array", items: { type: "object" } },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Academic Structure"],
      summary: "Create Semester (Super Admin)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["sessionId", "semesterType", "startDate", "endDate"],
              properties: {
                sessionId: { type: "string" },
                semesterType: { type: "string", enum: ["FIRST", "SECOND"] },
                startDate: { type: "string", format: "date" },
                endDate: { type: "string", format: "date" },
                isRegistrationOpen: { type: "boolean", default: true },
              },
            },
          },
        },
      },
      responses: { 201: { description: "Semester created successfully" } },
    },
  },

  "/academics/semesters/{id}/set-current": {
    patch: {
      tags: ["Academic Structure"],
      summary: "Set Semester as University Current (Super Admin)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Current semester updated successfully" } },
    },
  },

  "/academics/semesters/{id}/toggle-registration": {
    patch: {
      tags: ["Academic Structure"],
      summary: "Open or Close Course Registration Window (Super Admin)",
      description: "Toggles course registration window for students. When closed, students cannot register courses.",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["isOpen"],
              properties: {
                isOpen: { type: "boolean", description: "True to open window; False to close", example: true },
              },
            },
          },
        },
      },
      responses: { 200: { description: "Course registration window toggled successfully" } },
    },
  },
};
