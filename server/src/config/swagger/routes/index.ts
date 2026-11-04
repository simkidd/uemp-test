import { healthSwagger } from "./health.swagger";
import { authSwagger } from "./auth.swagger";
import { adminSwagger } from "./admin.swagger";
import { registrationSwagger } from "./registration.swagger";
import { resultSwagger } from "./result.swagger";
import { courseSwagger } from "./course.swagger";
import { academicSwagger } from "./academic.swagger";
import { reportSwagger } from "./report.swagger";

export const swaggerRoutesPaths: Record<string, any> = {
  ...healthSwagger,
  ...authSwagger,
  ...adminSwagger,
  ...registrationSwagger,
  ...resultSwagger,
  ...courseSwagger,
  ...academicSwagger,
  ...reportSwagger,
};
