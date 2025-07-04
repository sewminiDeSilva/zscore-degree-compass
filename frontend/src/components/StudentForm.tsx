
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { StudentData } from "../types/university";
import { User, BookOpen, MapPin, Trophy } from "lucide-react";
import { useStudentForm } from "../hooks/useStudentForm";
import { InputField } from "./forms/InputField";
import { SelectField } from "./forms/SelectField";
import { SUBJECT_STREAMS, SRI_LANKAN_DISTRICTS } from "../constants/university";

interface StudentFormProps {
  onSubmit: (data: StudentData) => void;
  isLoading: boolean;
}

export const StudentForm = ({ onSubmit, isLoading }: StudentFormProps) => {
  const { formData, errors, updateField, validateForm } = useStudentForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleZScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateField('zscore', value === '' ? 0 : parseFloat(value));
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <User className="h-6 w-6 text-blue-600" />
          Student Information
        </CardTitle>
        <CardDescription>
          Enter your A/L details to get personalized degree recommendations
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Full Name (Optional)"
            icon={<User className="h-4 w-4" />}
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            error={errors.name}
          />

          <SelectField
            label="Subject Stream"
            placeholder="Select your subject stream"
            options={SUBJECT_STREAMS}
            value={formData.subjectStream}
            onValueChange={(value) => updateField('subjectStream', value)}
            icon={<BookOpen className="h-4 w-4" />}
            required
            error={errors.subjectStream}
          />

          <InputField
            label="Z-Score"
            icon={<Trophy className="h-4 w-4" />}
            id="zscore"
            type="number"
            step="0.0001"
            min="0"
            max="3"
            placeholder="Enter your Z-score (e.g., 1.5)"
            value={formData.zscore || ''}
            onChange={handleZScoreChange}
            required
            error={errors.zscore}
            description="Enter your A/L Z-score (typically between 0.0 and 3.0)"
          />

          <SelectField
            label="Preferred District"
            placeholder="Select your preferred district"
            options={SRI_LANKAN_DISTRICTS}
            value={formData.district}
            onValueChange={(value) => updateField('district', value)}
            icon={<MapPin className="h-4 w-4" />}
            required
            error={errors.district}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Get Recommendations'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
