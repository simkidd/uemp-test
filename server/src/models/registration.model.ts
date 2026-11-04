import { model, Schema } from "mongoose";
import { ICourseRegistration } from "../interfaces/registration.interface";
import { VALID_ACADEMIC_LEVELS } from "../constants/enums";

const registeredCourseItemSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    creditUnit: {
      type: Number,
      required: true,
      min: 1,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const courseRegistrationSchema = new Schema<ICourseRegistration>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
      index: true,
    },
    session: {
      type: Schema.Types.ObjectId,
      ref: "AcademicSession",
      required: [true, "Academic session is required"],
      index: true,
    },
    semester: {
      type: Schema.Types.ObjectId,
      ref: "Semester",
      required: [true, "Semester is required"],
      index: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
      index: true,
    },
    programme: {
      type: Schema.Types.ObjectId,
      ref: "Programme",
      required: [true, "Programme is required"],
    },
    level: {
      type: Number,
      enum: VALID_ACADEMIC_LEVELS,
      required: [true, "Academic level is required"],
    },
    courses: [registeredCourseItemSchema],
    totalCreditUnits: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["REGISTERED", "APPROVED"],
      default: "REGISTERED",
    },
  },
  {
    timestamps: true,
  },
);

// Enforce rule: A student has exactly one registration sheet per session + semester
courseRegistrationSchema.index(
  { student: 1, session: 1, semester: 1 },
  { unique: true },
);

export const CourseRegistration = model<ICourseRegistration>(
  "CourseRegistration",
  courseRegistrationSchema,
);
export default CourseRegistration;
