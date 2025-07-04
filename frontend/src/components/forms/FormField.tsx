
import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  icon?: ReactNode;
  required?: boolean;
  error?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const FormField = ({
  label,
  htmlFor,
  icon,
  required = false,
  error,
  description,
  children,
  className
}: FormFieldProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="flex items-center gap-2">
        {icon}
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
};
