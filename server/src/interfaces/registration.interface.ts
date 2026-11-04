import { Document, Types } from "mongoose";
import { AcademicLevel } from "../constants/enums";

export interface IRegisteredCourseItem {
  course: Types.ObjectId;
  creditUnit: number;
  registeredAt: Date;
}

export interface ICourseRegistration extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  session: Types.ObjectId;
  semester: Types.ObjectId;
  department: Types.ObjectId;
  programme: Types.ObjectId;
  level: AcademicLevel;
  courses: IRegisteredCourseItem[];
  totalCreditUnits: number;
  status: "REGISTERED" | "APPROVED";
  createdAt: Date;
  updatedAt: Date;
}
