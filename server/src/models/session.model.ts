import { model, Schema } from "mongoose";
import { IAcademicSession } from "../interfaces/academic.interface";

const academicSessionSchema = new Schema<IAcademicSession>(
  {
    name: {
      type: String,
      required: [true, "Academic session name is required (e.g. 2025/2026)"],
      unique: true,
      trim: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
      index: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const AcademicSession = model<IAcademicSession>("AcademicSession", academicSessionSchema);
export default AcademicSession;
