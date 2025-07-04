
import { Input } from "@/components/ui/input";
import { FormField } from "./FormField";
import { ReactNode, InputHTMLAttributes } from "react";

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: ReactNode;
  required?: boolean;
  error?: string;
  description?: string;
  className?: string;
}

export const InputField = ({
  label,
  value,
  onChange,
  icon,
  required = false,
  error,
  description,
  className,
  ...inputProps
}: InputFieldProps) => {
  return (
    <FormField
      label={label}
      htmlFor={inputProps.id}
      icon={icon}
      required={required}
      error={error}
      description={description}
      className={className}
    >
      <Input
        value={value}
        onChange={onChange}
        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
        {...inputProps}
      />
    </FormField>
  );
};
