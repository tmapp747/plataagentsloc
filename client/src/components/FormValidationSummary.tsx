import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldErrors } from "react-hook-form";

interface FormValidationSummaryProps {
  errors?: FieldErrors<any> | Record<string, string[]>;
  success?: boolean;
  successMessage?: string;
}

const FormValidationSummary = ({ 
  errors, 
  success = false,
  successMessage = "All fields valid"
}: FormValidationSummaryProps) => {
  const hasErrors = errors && Object.keys(errors).length > 0;
  
  if (!hasErrors && !success) return null;
  
  return (
    <div className={cn(
      "rounded-md p-4 mt-6",
      success ? "bg-green-50" : "bg-red-50"
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          {success ? (
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400" />
          )}
        </div>
        <div className="ml-3">
          <h3 className={cn(
            "text-sm font-medium",
            success ? "text-green-800" : "text-red-800"
          )}>
            {success ? successMessage : "Please correct the following errors:"}
          </h3>
          
          {hasErrors && (
            <div className="mt-2 text-sm text-red-700">
              <ul className="list-disc pl-5 space-y-1">
                {Object.entries(errors).flatMap(([field, error]) => {
                  // Handle different error formats (FieldError or string[])
                  if (typeof error === 'object' && error !== null) {
                    if (Array.isArray(error)) {
                      // It's already a string array
                      return error.map((message, index) => (
                        <li key={`${field}-${index}`}>{message}</li>
                      ));
                    } else if (error.message) {
                      // It's a FieldError with a message property
                      return [<li key={`${field}-0`}>{`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${error.message}`}</li>];
                    }
                  }
                  
                  // Fallback for any other format
                  return [<li key={`${field}-0`}>{`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is invalid`}</li>];
                })}
              </ul>
            </div>
          )}
          
          {success && (
            <div className="mt-2 text-sm text-green-700">
              <p>Your information is complete and ready for submission.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormValidationSummary;
