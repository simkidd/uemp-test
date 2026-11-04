import { model, Schema } from "mongoose";
import { ICourse } from "../interfaces/course.interface";
import { SemesterType, VALID_ACADEMIC_LEVELS } from "../constants/enums";

const courseSchema = new Schema<ICourse>(
  {
    code: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    creditUnit: {
      type: Number,
      required: [true, "Credit unit is required"],
      min: [1, "Credit unit must be at least 1"],
      max: [6, "Credit unit cannot exceed 6"],
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
      index: true,
    },
    programmes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Programme",
      },
    ],
    level: {
      type: Number,
      enum: VALID_ACADEMIC_LEVELS,
      required: [true, "Academic level is required"],
      index: true,
    },
    semester: {
      type: String,
      enum: Object.values(SemesterType),
      required: [true, "Semester is required"],
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

courseSchema.index({ department: 1, level: 1, semester: 1 });

export const Course = model<ICourse>("Course", courseSchema);
export default Course;
