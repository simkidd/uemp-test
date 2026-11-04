import { IUser } from './user.interface';
import { ISession, ISemester } from './academic.interface';
import { ICourse } from './course.interface';

export type ResultStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface IStudentScore {
  _id?: string;
  student: IUser;
  caScore: number;
  examScore: number;
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | string;
  gradePoint: number;
  creditUnit?: number;
  matricNumber?: string;
  studentName?: string;
}

export interface IResult {
  _id: string;
  course: ICourse;
  session: ISession | string;
  semester: ISemester | string;
  lecturer: IUser | string;
  status: ResultStatus;
  scores?: IStudentScore[];
  student?: IUser;
  caScore?: number;
  examScore?: number;
  totalScore?: number;
  grade?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | string;
  gradePoint?: number;
  creditUnit?: number;
  department?: any;
  rejectionReason?: string;
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
