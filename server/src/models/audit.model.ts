import { model, Schema } from "mongoose";
import { IResultAuditLog } from "../interfaces/result.interface";
import { AuditAction, ResultStatus } from "../constants/enums";

const resultAuditLogSchema = new Schema<IResultAuditLog>(
  {
    result: {
      type: Schema.Types.ObjectId,
      ref: "Result",
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
      index: true,
    },
    previousStatus: {
      type: String,
      enum: Object.values(ResultStatus),
    },
    newStatus: {
      type: String,
      enum: Object.values(ResultStatus),
    },
    comments: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

resultAuditLogSchema.index({ createdAt: -1 });

export const ResultAuditLog = model<IResultAuditLog>("ResultAuditLog", resultAuditLogSchema);
export default ResultAuditLog;
