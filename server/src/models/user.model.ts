import { model, Schema } from "mongoose";
import { IUser } from "../interfaces/user.interface";
import { UserRole } from "../constants/roles";
import { VALID_ACADEMIC_LEVELS } from "../constants/enums";

const avatarSchema = new Schema(
  {
    url: {
      type: String,
      default: "",
    },
    publicId: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const studentProfileSchema = new Schema(
  {
    matricNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    programme: {
      type: Schema.Types.ObjectId,
      ref: "Programme",
      required: false,
    },
    level: {
      type: Number,
      enum: VALID_ACADEMIC_LEVELS,
      default: 100,
    },
    entrySession: {
      type: Schema.Types.ObjectId,
      ref: "AcademicSession",
    },
  },
  { _id: false },
);

const lecturerProfileSchema = new Schema(
  {
    staffId: {
      type: String,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      trim: true,
      default: "Lecturer",
    },
    designation: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const userSchema = new Schema<IUser>(
  {
    auth: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, "Role is required"],
      index: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    otherName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: avatarSchema,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      index: true,
    },
    faculty: {
      type: Schema.Types.ObjectId,
      ref: "Faculty",
      index: true,
    },
    studentProfile: studentProfileSchema,
    lecturerProfile: lecturerProfileSchema,
  },
  {
    timestamps: true,
  },
);

userSchema.index({ "studentProfile.matricNumber": 1 }, { unique: true, sparse: true });
userSchema.index({ "lecturerProfile.staffId": 1 }, { unique: true, sparse: true });

export const User = model<IUser>("User", userSchema);
export default User;
