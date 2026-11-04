import { model, Schema } from "mongoose";
import { IFaculty } from "../interfaces/academic.interface";

const facultySchema = new Schema<IFaculty>(
  {
    name: {
      type: String,
      required: [true, "Faculty name is required"],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Faculty code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
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

export const Faculty = model<IFaculty>("Faculty", facultySchema);
export default Faculty;
