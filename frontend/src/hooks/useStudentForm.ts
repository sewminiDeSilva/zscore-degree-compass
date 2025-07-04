
import { useState } from "react";
import { StudentData, StudentFormErrors } from "../types/university";
import { validateStudentForm, hasFormErrors } from "../utils/validation";

const initialFormData: StudentData = {
  subjectStream: '',
  zscore: 0,
  district: '',
  name: ''
};

export const useStudentForm = () => {
  const [formData, setFormData] = useState<StudentData>(initialFormData);
  const [errors, setErrors] = useState<StudentFormErrors>({});

  const updateField = (field: keyof StudentData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = validateStudentForm(formData);
    setErrors(newErrors);
    return !hasFormErrors(newErrors);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  return {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm,
    setFormData,
    setErrors
  };
};
