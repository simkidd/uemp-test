import { Router } from "express";
import { authRoutes } from "./auth.route";
import { academicRoutes } from "./academic.route";
import { courseRoutes } from "./course.route";
import { registrationRoutes } from "./registration.route";
import { resultRoutes } from "./result.route";
import { reportRoutes } from "./report.route";
import { adminRoutes } from "./admin.route";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/academics", academicRoutes);
apiRouter.use("/courses", courseRoutes);
apiRouter.use("/registrations", registrationRoutes);
apiRouter.use("/results", resultRoutes);
apiRouter.use("/reports", reportRoutes);

export { apiRouter };
