import { model, Schema } from "mongoose";
import { IProgramme } from "../interfaces/academic.interface";

const programmeSchema = new Schema<IProgramme>(
  {
    name: {
      type: String,
      required: [true, "Programme name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Programme code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
      index: true,
    },
    degreeAwarded: {
      type: String,
      required: [true, "Degree awarded is required (e.g. B.Sc., B.Eng.)"],
      default: "B.Sc.",
      trim: true,
    },
    durationYears: {
      type: Number,
      required: [true, "Duration in years is required"],
      default: 4,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Programme = model<IProgramme>("Programme", programmeSchema);
export default Programme;
