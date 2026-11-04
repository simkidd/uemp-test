import { model, Schema } from "mongoose";
import { ICourseAllocation } from "../interfaces/course.interface";

const courseAllocationSchema = new Schema<ICourseAllocation>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
      index: true,
    },
    lecturer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Lecturer is required"],
      index: true,
    },
    session: {
      type: Schema.Types.ObjectId,
      ref: "AcademicSession",
      required: [true, "Session is required"],
      index: true,
    },
    semester: {
      type: Schema.Types.ObjectId,
      ref: "Semester",
      required: [true, "Semester is required"],
      index: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned by is required"],
    },
  },
  {
    timestamps: true,
  },
);

courseAllocationSchema.index({ course: 1, session: 1, semester: 1 }, { unique: true });
courseAllocationSchema.index({ lecturer: 1, session: 1, semester: 1 });

export const CourseAllocation = model<ICourseAllocation>("CourseAllocation", courseAllocationSchema);
export default CourseAllocation;
