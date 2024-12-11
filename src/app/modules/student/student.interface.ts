/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';

export type TUserName = {
  firstName: string;
  middleName?: string;
  lastName: string;
};

export type TGuardian = {
  fatherName: string;
  fatherOccupation: string;
  fatherContactNo: string;
  motherName: string;
  motherOccupation: string;
  motherContactNo: string;
};

export type TLocalGuardian = {
  name: string;
  occupation: string;
  contactNo: string;
  address: string;
};

export type TStudent = {
  id: string;
  user: Types.ObjectId;
  name: TUserName;
  gender: 'male' | 'female';
  dateOfBirth?: Date;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  presentAddress: string;
  permanentAddress: string;
  guardian: TGuardian;
  localGuardian: TLocalGuardian;
  profileImg?: string;
  AcademicDepartment: Types.ObjectId;
  admissionSemester: Types.ObjectId;
  isDeleted: boolean;
};

//custom static method

export interface studentMethods extends Model<TStudent> {
  isUserExists(id: string): Promise<TStudent | null>;
}

// custome instance method

// export type studentMethods = {
//   isUserExists(id: string): Promise<TStudent | null>;
// };

export type studentModel = Model<
  TStudent,
  Record<string, never>,
  studentMethods
>;
