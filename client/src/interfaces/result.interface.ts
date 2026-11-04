import { IUser } from './user.interface';
import { ISession, ISemester } from './academic.interface';
import { ICourse } from './course.interface';

export type ResultStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface IResult {
  _id: string;
  course: ICourse;
  student: IUser;
  session: ISession | string;
  semester: ISemester | string;
  lecturer: IUser | string;
  caScore: number;
  examScore: number;
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  gradePoint: number;
  status: ResultStatus;
  rejectionRemarks?: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: IUser | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IResultAudit {
  _id: string;
  result: string;
  action: 'DRAFT_SAVED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REOPENED';
  performedBy: IUser;
  previousScores?: {
    caScore?: number;
    examScore?: number;
    totalScore?: number;
    grade?: string;
  };
  newScores?: {
    caScore?: number;
    examScore?: number;
    totalScore?: number;
    grade?: string;
  };
  remarks?: string;
  createdAt: string;
}
