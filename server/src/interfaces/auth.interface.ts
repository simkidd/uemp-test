import { Document, Types } from "mongoose";
import { UserRole } from "../constants/roles";

export interface IAuth extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: UserRole;
  user: Types.ObjectId;
  refreshToken?: string | undefined;
  isActive: boolean;
  lastLogin?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

