export const authSwagger = {
  "/auth/login": {
    post: {
      tags: ["Authentication"],
      summary: "Universal User Login",
      description:
        "Authenticate using any of your universal identifiers (Email address, Student Matriculation Number, or Lecturer Staff ID) along with your password.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["identifier", "password"],
              properties: {
                identifier: {
                  type: "string",
                  description:
                    "Your email (e.g. superadmin@uemp.edu.ng), matriculation number (e.g. UEMP/2023/CSC/001), or staff ID (e.g. STF/CSC/001)",
                  example: "superadmin@uemp.edu.ng",
                },
                password: {
                  type: "string",
                  format: "password",
                  description: "Account password",
                  example: "Password123!",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Login successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Login successful" },
                  data: {
                    type: "object",
                    properties: {
                      user: {
                        $ref: "#/components/schemas/User",
                      },
                      tokens: {
                        type: "object",
                        properties: {
                          accessToken: {
                            type: "string",
                            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                          },
                          refreshToken: {
                            type: "string",
                            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                          },
                          expiresIn: { type: "string", example: "15m" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid credentials or missing required fields",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        403: {
          description: "Account is deactivated or suspended",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },

  "/auth/refresh": {
    post: {
      tags: ["Authentication"],
      summary: "Refresh Access Token",
      description: "Generate a new JWT access token using a valid refresh token.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["refreshToken"],
              properties: {
                refreshToken: {
                  type: "string",
                  description: "Valid JWT refresh token",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Token refreshed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Token refreshed successfully" },
                  data: {
                    type: "object",
                    properties: {
                      accessToken: { type: "string" },
                      refreshToken: { type: "string" },
                      expiresIn: { type: "string", example: "15m" },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Invalid, expired, or revoked refresh token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },

  "/auth/me": {
    get: {
      tags: ["Authentication"],
      summary: "Get Current Authenticated User",
      description:
        "Retrieve profile information, permissions, and populated academic metadata for the currently logged-in user.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "User profile fetched successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "User fetched successfully" },
                  data: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized: Missing or invalid token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },

  "/auth/profile": {
    patch: {
      tags: ["Authentication"],
      summary: "Update Current User Profile (Partial)",
      description:
        "Update personal profile information and upload passport photograph. Note: Per university policy, students cannot change their official passport photo or registered names.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                phone: {
                  type: "string",
                  description: "Contact phone number (permitted for all roles)",
                  example: "+2348012345678",
                },
                firstName: {
                  type: "string",
                  description: "First name (Lecturers & Admins only)",
                  example: "John",
                },
                lastName: {
                  type: "string",
                  description: "Last name (Lecturers & Admins only)",
                  example: "Doe",
                },
                otherName: {
                  type: "string",
                  description: "Middle name (Lecturers & Admins only)",
                  example: "Chukwudi",
                },
                avatar: {
                  type: "string",
                  format: "binary",
                  description:
                    "Passport photograph file (JPG/PNG, max 5MB). Lecturers and Admins only; Students must request changes through Department Admin.",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Profile updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Profile updated successfully" },
                  data: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },
        400: {
          description: "Validation error or invalid input",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        403: {
          description:
            "Forbidden: Students cannot alter their official passport or registered names",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },

  "/auth/change-password": {
    post: {
      tags: ["Authentication"],
      summary: "Change Password",
      description:
        "Update password for the logged-in user by providing their current password and a new secure password.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["currentPassword", "newPassword"],
              properties: {
                currentPassword: {
                  type: "string",
                  format: "password",
                  description: "Existing current password",
                  example: "Password123!",
                },
                newPassword: {
                  type: "string",
                  format: "password",
                  description: "New password (minimum 6 characters)",
                  example: "NewSecurePassword456!",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Password changed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Password changed successfully" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        400: {
          description: "Incorrect current password or weak new password",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },

  "/auth/logout": {
    post: {
      tags: ["Authentication"],
      summary: "Logout User",
      description:
        "Invalidate active refresh token in the database and terminate the user session.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Logged out successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Logged out successfully" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
};
