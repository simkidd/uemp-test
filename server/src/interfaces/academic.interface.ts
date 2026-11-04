import { Document, Types } from "mongoose";
import { SemesterType } from "../constants/enums";

export interface IFaculty extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDepartment extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  faculty: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgramme extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  department: Types.ObjectId;
  degreeAwarded: string; // e.g. "B.Sc.", "B.Eng."
  durationYears: number; // e.g. 4, 5
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAcademicSession extends Document {
  _id: Types.ObjectId;
  name: string; // e.g. "2025/2026"
  isCurrent: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISemester extends Document {
  _id: Types.ObjectId;
  name: SemesterType; // FIRST, SECOND
  session: Types.ObjectId;
  isCurrent: boolean;
  isRegistrationOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}
