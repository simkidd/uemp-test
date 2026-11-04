export interface IFaculty {
  _id: string;
  name: string;
  code: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IDepartment {
  _id: string;
  name: string;
  code: string;
  faculty: IFaculty | string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProgramme {
  _id: string;
  name: string;
  code: string;
  department: IDepartment | string;
  durationYears: number;
  degreeType: 'B.Sc' | 'B.Eng' | 'B.A' | 'M.Sc' | 'Ph.D' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISession {
  _id: string;
  name: string; // e.g. "2025/2026"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISemester {
  _id: string;
  session: ISession | string;
  name: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  registrationOpen: boolean;
  isRegistrationOpen?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
