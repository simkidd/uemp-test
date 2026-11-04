import { model, Schema } from "mongoose";
import { ISemester } from "../interfaces/academic.interface";
import { SemesterType } from "../constants/enums";

const semesterSchema = new Schema<ISemester>(
  {
    name: {
      type: String,
      enum: Object.values(SemesterType),
      required: [true, "Semester name is required"],
    },
    session: {
      type: Schema.Types.ObjectId,
      ref: "AcademicSession",
      required: [true, "Session is required"],
      index: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
      index: true,
    },
    isRegistrationOpen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

semesterSchema.index({ session: 1, name: 1 }, { unique: true });

export const Semester = model<ISemester>("Semester", semesterSchema);
export default Semester;
