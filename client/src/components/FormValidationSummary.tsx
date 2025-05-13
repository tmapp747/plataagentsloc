/**
 * Enhanced Form Validation Summary Component
 * DO NOT EDIT OR MODIFY WITHOUT EXPLICIT PERMISSION
 * 
 * This component provides user-friendly validation feedback with improved error messages
 * and guidance for form completion.
 */

import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldErrors } from "react-hook-form";

interface FormValidationSummaryProps {
  errors?: FieldErrors<any> | Record<string, string[]>;
  success?: boolean;
  successMessage?: string;
}

// Common field name replacements for better readability
const fieldNameMap: Record<string, string> = {
  "firstName": "First Name",
  "lastName": "Last Name",
  "middleName": "Middle Name",
  "email": "Email Address",
  "phone": "Phone Number",
  "idType": "ID Type",
  "idNumber": "ID Number",
  "birthdate": "Date of Birth",
  "address": "Address",
  "province": "Province",
  "city": "City",
  "barangay": "Barangay",
  "postalCode": "Postal Code",
  "businessName": "Business Name",
  "businessAddress": "Business Address",
  "yearsInBusiness": "Years in Business",
  "taxId": "Tax ID",
  "termsAccepted": "Terms and Conditions",
  "signatureUrl": "Digital Signature"
};

const FormValidationSummary = ({ 
  errors, 
  success = false,
  successMessage = "All fields valid"
}: FormValidationSummaryProps) => {
  const hasErrors = errors && Object.keys(errors).length > 0;
  
  if (!hasErrors && !success) return null;
  
  // Format a field name for better display
  const formatFieldName = (field: string): string => {
    // Check if we have a predefined mapping
    if (fieldNameMap[field]) return fieldNameMap[field];
    
    // Otherwise format camelCase to Title Case with spaces
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };
  
  return (
    <div className={cn(
      "rounded-md p-4 mt-6 border",
      success 
        ? "bg-green-50 border-green-200 text-green-800" 
        : "bg-red-50 border-red-200 text-red-800"
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          {success ? (
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          ) : (
            <AlertCircle className="h-6 w-6 text-red-500" />
          )}
        </div>
        <div className="ml-3 w-full">
          <h3 className={cn(
            "text-base font-medium",
            success ? "text-green-800" : "text-red-800"
          )}>
            {success ? successMessage : "Please review the following:"}
          </h3>
          
          {hasErrors && (
            <div className="mt-2 text-sm">
              <ul className="list-disc pl-5 space-y-2">
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
                      return [
                        <li key={`${field}-0`} className="text-red-700">
                          <span className="font-medium">{formatFieldName(field)}:</span> {error.message}
                        </li>
                      ];
                    }
                  }
                  
                  // Fallback for any other format
                  return [
                    <li key={`${field}-0`} className="text-red-700">
                      <span className="font-medium">{formatFieldName(field)}</span> is required or invalid
                    </li>
                  ];
                })}
              </ul>
              
              {/* Add helpful guidance message */}
              <div className="mt-4 flex items-start bg-red-100 p-3 rounded-md">
                <HelpCircle className="h-5 w-5 text-red-700 mr-2 mt-0.5" />
                <p className="text-red-800">
                  Complete all required fields marked with * to proceed with your application. Missing information will delay the application process.
                </p>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mt-2 text-sm text-green-700">
              <p className="font-medium mb-1">Your information is complete!</p>
              <p>You can now proceed to the next step of your application. Make sure to review your information before final submission.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormValidationSummary;
