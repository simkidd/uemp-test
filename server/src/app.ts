import cors from "cors";
import express, { Application, Request, Response } from "express";
import { ENV } from "./config/env";
import morgan from "morgan";
import { logger, sendSuccess } from "./utils";
import { apiRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { setupSwagger } from "./config/swagger";

const app: Application = express();

// Swagger Documentation UI
setupSwagger(app);

// Middlewares
app.use(
  cors({
    origin: [ENV.CORS_ORIGIN, "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (!ENV.IS_PROD) {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    }),
  );
}

// Health check
app.get(ENV.API_PREFIX + "/health", (req: Request, res: Response) => {
  sendSuccess(
    res,
    {
      status: "OK",
      service: "University Portal API",
      env: ENV.NODE_ENV,
      database: ENV.DB_NAME,
      timestamp: new Date().toISOString(),
    },
    "API is healthy and operational",
  );
});

// Mount modular API routes
app.use(ENV.API_PREFIX, apiRouter);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
