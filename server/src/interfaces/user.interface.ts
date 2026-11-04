import { Document, Types } from "mongoose";
import { UserRole } from "../constants/roles";
import { AcademicLevel } from "../constants/enums";

export interface ICloudinaryImage {
  url: string;
  publicId?: string | undefined;
}

export interface IStudentProfile {
  matricNumber: string;
  programme: Types.ObjectId;
  level: AcademicLevel;
  entrySession?: Types.ObjectId | undefined;
}

export interface ILecturerProfile {
  staffId: string;
  title: string;
  designation?: string | undefined;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  auth: Types.ObjectId;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  otherName?: string | undefined;
  phone?: string | undefined;
  avatar?: ICloudinaryImage | undefined;
  isActive: boolean;
  department?: Types.ObjectId | undefined;
  faculty?: Types.ObjectId | undefined;
  studentProfile?: IStudentProfile | undefined;
  lecturerProfile?: ILecturerProfile | undefined;
  createdAt: Date;
  updatedAt: Date;
}
