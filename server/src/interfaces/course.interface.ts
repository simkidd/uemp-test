import { Document, Types } from "mongoose";
import { AcademicLevel, SemesterType } from "../constants/enums";

export interface ICourse extends Document {
  _id: Types.ObjectId;
  code: string;
  title: string;
  creditUnit: number;
  department: Types.ObjectId;
  programmes: Types.ObjectId[];
  level: AcademicLevel;
  semester: SemesterType;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseAllocation extends Document {
  _id: Types.ObjectId;
  course: Types.ObjectId;
  lecturer: Types.ObjectId;
  session: Types.ObjectId;
  semester: Types.ObjectId;
  assignedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
