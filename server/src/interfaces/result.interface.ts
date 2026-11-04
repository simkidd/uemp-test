import { Document, Types } from "mongoose";
import { AuditAction, ResultStatus } from "../constants/enums";

export interface IStudentScore {
  student: Types.ObjectId;
  caScore: number;
  examScore: number;
  totalScore: number;
  grade: "A" | "B" | "C" | "D" | "E" | "F";
  gradePoint: number;
  creditUnit: number;
}

export interface IResult extends Document {
  _id: Types.ObjectId;
  course: Types.ObjectId;
  session: Types.ObjectId;
  semester: Types.ObjectId;
  department: Types.ObjectId;
  lecturer: Types.ObjectId;
  status: ResultStatus;
  scores: IStudentScore[];
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
  rejectionReason?: string;
  isReopened?: boolean;
  reopenedBy?: Types.ObjectId;
  reopenedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResultAuditLog extends Document {
  _id: Types.ObjectId;
  result: Types.ObjectId;
  course: Types.ObjectId;
  actor: Types.ObjectId;
  action: AuditAction;
  previousStatus?: ResultStatus;
  newStatus?: ResultStatus;
  comments?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}
