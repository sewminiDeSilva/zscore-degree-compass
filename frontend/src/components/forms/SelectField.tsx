
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "./FormField";
import { ReactNode } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  placeholder: string;
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;

  icon?: ReactNode;
  required?: boolean;
  error?: string;
  description?: string;
  className?: string;
}

export const SelectField = ({
  label,
  placeholder,
  options,
  value,
  onValueChange,
  icon,
  required = false,
  error,
  description,
  className
}: SelectFieldProps) => {
  return (
    <FormField
      label={label}
      icon={icon}
      required={required}
      error={error}
      description={description}
      className={className}
    >
      <Select value={value} onValueChange={onValueChange}>

        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white border shadow-md z-50">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
};
