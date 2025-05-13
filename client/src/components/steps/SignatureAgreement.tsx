import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { agreementSchema } from "@shared/schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import FormNavigation from "@/components/FormNavigation";
import FormSaveContinue from "@/components/FormSaveContinue";
import FormValidationSummary from "@/components/FormValidationSummary";
import SignaturePad from "@/components/shared/SignaturePad";
import { Application } from "@shared/schema";
import { termsAndConditionsText } from "@/lib/formSchema";

type AgreementData = z.infer<typeof agreementSchema>;

interface SignatureAgreementProps {
  application?: Application;
  onNext: (data: any) => void;
  onPrevious: () => void;
  onSave: (data: any) => void;
  applicationId: string;
  isLoading?: boolean;
}

const SignatureAgreement = ({
  application,
  onNext,
  onPrevious,
  onSave,
  applicationId,
  isLoading = false,
}: SignatureAgreementProps) => {
  const [validationSuccess, setValidationSuccess] = useState(false);

  // Set default values from the application data if available
  const defaultValues: Partial<AgreementData> = {
    termsAccepted: application?.termsAccepted || false,
    signatureUrl: application?.signatureUrl || "",
  };

  const form = useForm<AgreementData>({
    resolver: zodResolver(agreementSchema),
    defaultValues,
    mode: "onChange",
  });

  const resumeUrl = `${window.location.origin}/resume/${application?.resumeToken}`;

  // Generate validation success/error state when values change
  const formState = form.formState;
  
  useState(() => {
    // Check if the form is valid whenever the form state changes
    const subscription = form.watch(() => {
      if (Object.keys(formState.errors).length === 0 && 
          form.getValues().termsAccepted && 
          form.getValues().signatureUrl) {
        setValidationSuccess(true);
      } else {
        setValidationSuccess(false);
      }
    });
    
    return () => subscription.unsubscribe();
  });

  const onSubmit = (data: AgreementData) => {
    onNext(data);
  };

  const handleSave = () => {
    const data = form.getValues();
    onSave(data);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Agreement & Signature</h2>
      <p className="text-sm text-gray-500 mb-6">
        Please review our terms and conditions and sign to complete your application.
      </p>

      <FormSaveContinue resumeUrl={resumeUrl} onSave={handleSave} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="border rounded-md p-4">
            <h3 className="text-base font-medium mb-2">Terms and Conditions</h3>
            <ScrollArea className="h-60 w-full rounded-md border p-4 bg-gray-50 text-sm">
              <div className="space-y-4">
                {termsAndConditionsText.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </ScrollArea>
          </div>

          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I have read and agree to the Terms and Conditions *
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="signatureUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Digital Signature *</FormLabel>
                <FormControl>
                  <SignaturePad 
                    onChange={field.onChange} 
                    value={field.value} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormValidationSummary
            errors={formState.errors}
            success={validationSuccess}
            successMessage="Agreement accepted and signature provided. You can proceed to review your application."
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

export default SignatureAgreement;
