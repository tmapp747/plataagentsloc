import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import FormNavigation from "@/components/FormNavigation";
import FormSaveContinue from "@/components/FormSaveContinue";
import FormValidationSummary from "@/components/FormValidationSummary";
import FileUpload from "@/components/shared/FileUpload";
import { Application } from "@shared/schema";
import { requiredDocuments } from "@/lib/formSchema";

// Schema for document validation
const documentSchema = z.object({
  documentIds: z.array(z.string()).optional(),
});

type DocumentData = z.infer<typeof documentSchema>;

interface DocumentRequirementsProps {
  application?: Application;
  onNext: (data: any) => void;
  onPrevious: () => void;
  onSave: (data: any) => void;
  applicationId: string;
  isLoading?: boolean;
}

const DocumentRequirements = ({
  application,
  onNext,
  onPrevious,
  onSave,
  applicationId,
  isLoading = false,
}: DocumentRequirementsProps) => {
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, boolean>>({});

  // Fetch already uploaded documents
  const { data: documents, isLoading: loadingDocuments } = useQuery({
    queryKey: [`/api/documents/${application?.id}`],
    enabled: !!application?.id,
  });

  useEffect(() => {
    if (documents) {
      const uploaded: Record<string, boolean> = {};
      documents.forEach((doc: any) => {
        uploaded[doc.documentType] = true;
      });
      setUploadedDocuments(uploaded);
    }
  }, [documents]);

  // Set default values
  const defaultValues: Partial<DocumentData> = {
    documentIds: application?.documentIds || [],
  };

  const form = useForm<DocumentData>({
    resolver: zodResolver(documentSchema),
    defaultValues,
    mode: "onChange",
  });

  const resumeUrl = `${window.location.origin}/resume/${application?.resumeToken}`;

  // Check if required documents are uploaded
  const requiredDocsUploaded = requiredDocuments
    .filter(doc => doc.required)
    .every(doc => uploadedDocuments[doc.id]);

  // Generate validation success/error state when values change
  useEffect(() => {
    if (requiredDocsUploaded) {
      setValidationSuccess(true);
    } else {
      setValidationSuccess(false);
    }
  }, [uploadedDocuments, requiredDocsUploaded]);

  const onSubmit = (data: DocumentData) => {
    // Set the documentIds array from uploaded documents
    const documentIdsArray = Object.keys(uploadedDocuments)
      .filter(key => uploadedDocuments[key]);
    
    onNext({ documentIds: documentIdsArray });
  };

  const handleSave = () => {
    // Set the documentIds array from uploaded documents
    const documentIdsArray = Object.keys(uploadedDocuments)
      .filter(key => uploadedDocuments[key]);
    
    onSave({ documentIds: documentIdsArray });
  };

  const handleUploadComplete = (documentType: string) => {
    setUploadedDocuments(prev => ({
      ...prev,
      [documentType]: true,
    }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Document Requirements</h2>
      <p className="text-sm text-gray-500 mb-6">
        Please upload the following documents to complete your application.
      </p>

      <Alert className="mb-6 bg-blue-50 text-blue-800 border-blue-200">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Required documents</AlertTitle>
        <AlertDescription>
          All documents must be clear, legible, and show all information completely. Accepted formats include PDF, JPG, and PNG files.
        </AlertDescription>
      </Alert>

      <FormSaveContinue resumeUrl={resumeUrl} onSave={handleSave} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-8">
            {requiredDocuments.map((document) => (
              <div key={document.id} className="space-y-2">
                <FileUpload
                  applicationId={applicationId}
                  documentType={document.id}
                  label={`${document.name} ${document.required ? "*" : "(Optional)"}`}
                  required={document.required}
                  onUploadComplete={() => handleUploadComplete(document.id)}
                  showThumbnails={true}
                />
                <FormDescription>{document.description}</FormDescription>
              </div>
            ))}
          </div>

          <FormValidationSummary
            errors={
              !requiredDocsUploaded ? {
                documents: ["Please upload all required documents"]
              } : undefined
            }
            success={validationSuccess}
            successMessage="All required documents have been uploaded successfully."
          />

          <FormNavigation
            onPrevious={onPrevious}
            isSubmitting={isLoading}
            disableNext={!validationSuccess}
          />
        </form>
      </Form>
    </div>
  );
};

export default DocumentRequirements;
