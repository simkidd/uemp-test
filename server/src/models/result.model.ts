import { model, Schema } from "mongoose";
import { IResult, IStudentScore } from "../interfaces/result.interface";
import { ResultStatus } from "../constants/enums";

const studentScoreSchema = new Schema<IStudentScore>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caScore: {
      type: Number,
      required: true,
      min: [0, "CA score cannot be negative"],
      max: [40, "CA score cannot exceed 40"],
      default: 0,
    },
    examScore: {
      type: Number,
      required: true,
      min: [0, "Exam score cannot be negative"],
      max: [70, "Exam score cannot exceed 70"],
      default: 0,
    },
    totalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    grade: {
      type: String,
      enum: ["A", "B", "C", "D", "E", "F"],
      required: true,
      default: "F",
    },
    gradePoint: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
    creditUnit: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

const resultSchema = new Schema<IResult>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
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
    lecturer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Lecturer is required"],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ResultStatus),
      default: ResultStatus.DRAFT,
      index: true,
    },
    scores: [studentScoreSchema],
    submittedAt: {
      type: Date,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    isReopened: {
      type: Boolean,
      default: false,
    },
    reopenedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reopenedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

resultSchema.index({ course: 1, session: 1, semester: 1 }, { unique: true });
resultSchema.index({ department: 1, status: 1 });
resultSchema.index({ "scores.student": 1, status: 1 });

export const Result = model<IResult>("Result", resultSchema);
export default Result;
