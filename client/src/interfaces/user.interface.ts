import { IDepartment, IFaculty, IProgramme } from './academic.interface';

export type UserRole = 'SUPER_ADMIN' | 'DEPARTMENT_ADMIN' | 'LECTURER' | 'STUDENT';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface IStudentProfile {
  matricNumber: string;
  level: 100 | 200 | 300 | 400 | 500 | 600;
  programme?: IProgramme | string;
  entryYear?: number;
}

export interface IStaffProfile {
  staffId: string;
  title?: string;
  designation?: string;
  specialization?: string;
  isHOD?: boolean;
}

export interface ICloudinaryImage {
  url: string;
  publicId?: string;
}

export interface IUser {
  _id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  otherName?: string;
  phone?: string;
  avatar?: string | ICloudinaryImage;
  isActive?: boolean;
  status?: UserStatus;
  department?: IDepartment;
  faculty?: IFaculty;
  studentProfile?: IStudentProfile;
  staffProfile?: IStaffProfile;
  lecturerProfile?: IStaffProfile;
  createdAt?: string;
  updatedAt?: string;
}
