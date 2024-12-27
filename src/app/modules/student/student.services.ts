/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { startSession } from 'mongoose';
import { student } from './student.model';
import { AppError } from '../../Error/AppError';
import user from '../user/user.model';
import { TStudent, TLocalGuardian } from './student.interface';

//get all student
const getAllStudentFromDB = async (query: Record<string, unknown>) => {
  const queryObject = { ...query };
  let searchTerm = '';
  if (query.searchTerm) {
    searchTerm = query.searchTerm as string;
  }
  const excludeQuery = ['searchTerm', 'sort'];
  excludeQuery.forEach((el) => delete queryObject[el]);
  console.log('Query', query);
  console.log('queryObject', queryObject);

  const searchQuery = student.find({
    $or: ['email', 'name.firstName', 'name.lastName', 'name.middleName'].map(
      (field) => ({ [field]: { $regex: searchTerm, $options: 'i' } }),
    ),
  });
  const filterQuery = searchQuery
    .find(queryObject)
    .populate('admissionSemester')
    .populate({
      path: 'AcademicDepartment',
      populate: { path: 'academicFaculty' },
    });

  let sort = '-createdAt';
  if (query.sort) {
    sort = query.sort as string;
  }
  const sortQuery = filterQuery.sort(sort);
  let limit = 1;
  if (query.limit) {
    limit = query.limit as number;
  }
  const limitQuery = await sortQuery.limit(limit);

  return limitQuery;
};

//get a student by studentId

const getAStudentByStudentId = async (studentId: string) => {
  const result = await student
    .findOne({ id: studentId })
    .populate('admissionSemester')
    .populate({
      path: 'AcademicDepartment',
      populate: { path: 'academicFaculty' },
    });
  return result;
};
const UpdateStudentIntoDB = async (
  studentId: string,
  payload: Partial<TStudent>,
) => {
  const { name, guardian, localGuardian, ...remainingStudentData } = payload;
  const modifiedStudentData: Record<string, unknown> = {
    ...remainingStudentData,
  };

  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedStudentData[`name.${key}`] = value;
    }
  }
  if (guardian && Object.keys(guardian).length) {
    for (const [key, value] of Object.entries(guardian)) {
      modifiedStudentData[`guardian.${key}`] = value;
    }
  }
  if (localGuardian && Object.keys(localGuardian).length) {
    for (const [key, value] of Object.entries(localGuardian)) {
      modifiedStudentData[`localGuardian.${key}`] = value;
    }
  }

  const result = await student.findOneAndUpdate(
    { id: studentId },
    modifiedStudentData,
    {
      new: true,
      runValidators: true,
    },
  );
  return result;
};

const deleteStudentFromDB = async (id: string) => {
  const session = await startSession();
  try {
    session.startTransaction();
    const isDeletedStudent = await student.findOneAndUpdate(
      { id },
      { isDeleted: true },
      { new: true, session },
    );
    if (!isDeletedStudent) {
      throw new AppError(400, 'student is filed to  deleted ');
    }
    const isDeletedUser = await user.findOneAndUpdate(
      { id },
      { isDeleted: true },
      { new: true, session },
    );
    if (!isDeletedUser) {
      throw new AppError(400, 'user is failed to delete ');
    }
    await session.commitTransaction();
    await session.endSession();
    return isDeletedUser;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

export const studentService = {
  getAllStudentFromDB,
  getAStudentByStudentId,
  deleteStudentFromDB,
  UpdateStudentIntoDB,
};
