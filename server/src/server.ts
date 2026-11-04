import app from "./app";
import { connectDB, disconnectDB } from "./config/db";
import { ENV } from "./config/env";
import { logger } from "./utils";

const startServer = async () => {
  try {
    // 1. Connect Database
    await connectDB();

    const server = app.listen(ENV.PORT, () => {
      console.log(`[Server] UEMP API Server is listening on port ${ENV.PORT}`);
      console.log(`[Server] Environment: ${ENV.NODE_ENV}`);
      console.log(`[Server] API Base: http://localhost:${ENV.PORT}${ENV.API_PREFIX}`);
      console.log(`[Server] Health Check: http://localhost:${ENV.PORT}${ENV.API_PREFIX}/health`);
    });

    const shutdown = () => {
      logger.info("Closing HTTP server...");

      server.close(() => {
        logger.info("HTTP server closed.");
        disconnectDB()
          .catch((err) => {
            logger.error("Error disconnecting from database:", err);
          })
          .finally(() => {
            logger.info("Exiting process.");
            process.exit(0);
          });
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        logger.error("Server did not shut down in time. Exiting forcefully.");
        process.exit(1);
      }, 10000).unref();
    };

    // Graceful shutdown
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled Rejection at: ", reason);
      shutdown();
    });
  } catch (error) {
    console.error("[Server Start Error] Fatal error starting server:", error);
    process.exit(1);
  }
};

startServer();
