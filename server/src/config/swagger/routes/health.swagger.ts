export const healthSwagger = {
  "/health": {
    get: {
      tags: ["System Health"],
      summary: "API Health Check",
      description:
        "Check operational status of the UEMP API server, active environment, connected database, and system timestamp.",
      responses: {
        200: {
          description: "API is healthy and operational",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "API is healthy and operational" },
                  data: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "OK" },
                      service: { type: "string", example: "University Portal API" },
                      env: { type: "string", example: "development" },
                      database: { type: "string", example: "uemp_dev_db" },
                      timestamp: { type: "string", format: "date-time", example: "2026-11-03T01:30:00.000Z" },
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
