import { IDepartment, ISession, ISemester } from './academic.interface';
import { IUser } from './user.interface';

export interface ICourse {
  _id: string;
  code: string; // e.g. "CSC101"
  title: string;
  creditUnits?: number;
  creditUnit?: number;
  level: 100 | 200 | 300 | 400 | 500 | 600;
  semester: 'First Semester' | 'Second Semester';
  department: IDepartment | string;
  isElective?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICourseAllocation {
  _id: string;
  course: ICourse;
  lecturer: IUser;
  session: ISession | string;
  semester: ISemester | string;
  createdAt?: string;
  updatedAt?: string;
}
