import { IUser } from './user.interface';
import { ISession, ISemester } from './academic.interface';
import { ICourse } from './course.interface';

export type RegistrationStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED';

export interface ICourseRegistrationItem {
  course: ICourse;
  registeredAt: string;
}

export interface ICourseRegistration {
  _id: string;
  student: IUser;
  session: ISession;
  semester: ISemester;
  level: number;
  courses: ICourseRegistrationItem[];
  totalUnits?: number;
  totalCreditUnits?: number;
  status: RegistrationStatus;
  createdAt?: string;
  updatedAt?: string;
}
