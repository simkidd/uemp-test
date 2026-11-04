export const resultSwagger = {
  "/results/my-results": {
    get: {
      tags: ["Results & Grading"],
      summary: "Get Student Results (Approved Only)",
      description:
        "Fetches published semester results for the logged-in student. Draft, submitted, and rejected results are hidden until approved per university security policy.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Results retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Results retrieved successfully" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Result" },
                  },
                },
              },
            },
          },
        },
        403: { description: "Forbidden: Students only" },
      },
    },
  },

  "/results/statement": {
    get: {
      tags: ["Results & Grading"],
      summary: "Get Student Academic Statement & CGPA Summary",
      description:
        "Computes official cumulative academic history, Semester GPAs, Cumulative GPA (CGPA) on Nigerian 5.0 scale, Total Credit Units Registered/Passed, and Degree Classification.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "studentId", in: "query", schema: { type: "string" }, description: "Optional: Target Student ID (Admin access; defaults to logged-in student)" },
      ],
      responses: {
        200: {
          description: "Result statement retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Result statement retrieved successfully" },
                  data: {
                    type: "object",
                    properties: {
                      student: { $ref: "#/components/schemas/User" },
                      semesters: { type: "array", items: { type: "object" } },
                      cgpaSummary: {
                        type: "object",
                        properties: {
                          totalCreditsAttempted: { type: "integer", example: 40 },
                          totalCreditsEarned: { type: "integer", example: 40 },
                          cgpa: { type: "number", example: 4.25 },
                          degreeClass: { type: "string", example: "First Class Honours" },
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
    },
  },

  "/results/course/{courseId}/students": {
    get: {
      tags: ["Results & Grading"],
      summary: "Get Registered Students for Score Entry (Workflow 2)",
      description:
        "Fetches class list of students who registered for the course, pre-populated with existing CA and Exam score entries if previously saved.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "courseId", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Class list retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Registered students retrieved successfully" },
                  data: {
                    type: "object",
                    properties: {
                      course: { $ref: "#/components/schemas/Course" },
                      students: { type: "array", items: { type: "object" } },
                      existingResult: { $ref: "#/components/schemas/Result", nullable: true },
                    },
                  },
                },
              },
            },
          },
        },
        403: { description: "Forbidden: Not assigned lecturer or department mismatch" },
      },
    },
  },

  "/results/save-or-submit": {
    post: {
      tags: ["Results & Grading"],
      summary: "Save Draft or Submit Course Results (Workflow 2)",
      description:
        "Enters Continuous Assessment (CA) and Examination scores for all students. Set `isFinalSubmit: false` to save as draft, or `true` to submit to Department Admin for approval.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["courseId", "scores"],
              properties: {
                courseId: { type: "string", example: "672750e39c5b967f01234701" },
                isFinalSubmit: { type: "boolean", default: false, description: "True submits for approval; false saves draft" },
                scores: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["studentId", "caScore", "examScore"],
                    properties: {
                      studentId: { type: "string", example: "672750e39c5b967f01234567" },
                      caScore: { type: "number", minimum: 0, maximum: 40, example: 28 },
                      examScore: { type: "number", minimum: 0, maximum: 70, example: 54 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Result saved or submitted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Results submitted successfully for departmental review" },
                  data: { $ref: "#/components/schemas/Result" },
                },
              },
            },
          },
        },
        400: { description: "Scores out of allowable ranges or already approved" },
      },
    },
  },

  "/results/pending": {
    get: {
      tags: ["Results & Grading"],
      summary: "Get Pending Result Submissions (Workflow 3)",
      description:
        "List courses with submitted results waiting for departmental review and approval.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Pending results retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Pending submissions retrieved successfully" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Result" },
                  },
                },
              },
            },
          },
        },
        403: { description: "Department Admin & Super Admin only" },
      },
    },
  },

  "/results/{id}": {
    get: {
      tags: ["Results & Grading"],
      summary: "Get Result Details by ID",
      description: "Retrieve comprehensive result breakdown including student scores, grades, and audit trail.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Result details retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Result details retrieved successfully" },
                  data: { $ref: "#/components/schemas/Result" },
                },
              },
            },
          },
        },
      },
    },
  },

  "/results/{id}/approve": {
    post: {
      tags: ["Results & Grading"],
      summary: "Approve Submitted Results (Workflow 3)",
      description:
        "Department Admin or Super Admin approves submitted results. Automatically updates student GPAs and publishes grades to student dashboards.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Result approved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Result approved successfully" },
                  data: { $ref: "#/components/schemas/Result" },
                },
              },
            },
          },
        },
        400: { description: "Result is not in SUBMITTED state" },
        403: { description: "Lecturers cannot approve their own results; Department Admin only" },
      },
    },
  },

  "/results/{id}/reject": {
    post: {
      tags: ["Results & Grading"],
      summary: "Reject Submitted Results (Workflow 3)",
      description:
        "Department Admin returns results to lecturer for correction with mandatory rejection remarks.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["remarks"],
              properties: {
                remarks: {
                  type: "string",
                  description: "Reason for rejection and correction instructions",
                  example: "CA scores for Matric No UEMP/2023/CSC/004 exceed maximum allowed 30 marks.",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Result rejected and returned to lecturer",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Result rejected and returned to lecturer" },
                  data: { $ref: "#/components/schemas/Result" },
                },
              },
            },
          },
        },
      },
    },
  },

  "/results/{id}/reopen": {
    post: {
      tags: ["Results & Grading"],
      summary: "Reopen Result for Revision",
      description:
        "Authorizes a lecturer to re-edit a submitted or approved result. Creates an immutable audit log entry.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["reason"],
              properties: {
                reason: { type: "string", example: "Senate approved score adjustment for student petition." },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Result reopened for modification",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Result successfully reopened for modification" },
                  data: { $ref: "#/components/schemas/Result" },
                },
              },
            },
          },
        },
      },
    },
  },
};
