
import { StudentData, StudentFormErrors } from "../types/university";

export const validateStudentForm = (data: StudentData): StudentFormErrors => {
  const errors: StudentFormErrors = {};

  if (!data.subjectStream) {
    errors.subjectStream = 'Please select your subject stream';
  }

  if (!data.zscore || data.zscore <= 0) {
    errors.zscore = 'Please enter a valid Z-score';
  }

  if (data.zscore && data.zscore > 3) {
    errors.zscore = 'Z-score cannot exceed 3.0';
  }

  if (!data.district) {
    errors.district = 'Please select your district';
  }

  return errors;
};

export const hasFormErrors = (errors: StudentFormErrors): boolean => {
  return Object.keys(errors).length > 0;
};
