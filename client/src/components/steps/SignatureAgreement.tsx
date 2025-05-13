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
import StepAudio from "@/components/StepAudio";
import { MessageSquare } from "lucide-react";

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
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Agreement & Signature</h2>
      <StepAudio step="signature" autoPlay={true} />
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <h3 className="text-base font-medium text-blue-800 mb-2">Important Information About This Agreement</h3>
        <p className="text-sm text-blue-700 mb-2">
          By accepting this agreement, you are:
        </p>
        <ul className="list-disc text-sm text-blue-700 ml-5 space-y-1 mb-2">
          <li>Confirming that all information provided in your application is accurate and truthful</li>
          <li>Consenting to background checks and verification of your personal and business information</li>
          <li>Agreeing to comply with PlataPay's agent policies, procedures, and code of conduct</li>
          <li>Authorizing PlataPay to contact you regarding your application status and other relevant matters</li>
          <li>Accepting the financial obligations outlined in your selected package</li>
        </ul>
        <p className="text-sm font-medium text-blue-800">
          Please review the complete terms below, check the consent box, provide your signature, and click "Next" if you agree to these terms.
        </p>
        
        <div className="mt-4 pt-3 border-t border-blue-200 flex items-center gap-2">
          <div className="bg-primary/10 rounded-full p-1.5">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-blue-700">
            <strong>Need help?</strong> If you have any questions or need clarification, click the help tab located on the right edge of the screen. 
            The PlataPay CSR AI assistant (powered by advanced AI) is knowledgeable about PlataPay services and can answer your questions in multiple Philippine dialects.
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Please review our terms and conditions carefully and sign to complete your application.
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
                  <FormLabel className="font-medium">
                    I confirm that I have read, understood, and agree to the <a href="https://platapay.ph/terms" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">Terms and Conditions</a> and <a href="https://platapay.ph/privacy" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">Privacy Policy</a> for the PlataPay Agent Program. I understand my rights and responsibilities as outlined above. *
                  </FormLabel>
                  <p className="text-sm text-gray-500 mt-1">
                    By checking this box and clicking "Next", you are electronically signing and agreeing to be bound by the terms of this agreement.
                  </p>
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

          <div className="mt-8">
            {!validationSuccess && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                <p className="text-sm text-amber-700">
                  <strong>Important:</strong> To proceed, please check the consent box above and provide your signature.
                </p>
              </div>
            )}
            {validationSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                <p className="text-sm text-green-700">
                  <strong>Thank you!</strong> Please click "Next" to continue with your application.
                </p>
              </div>
            )}
            <FormNavigation
              onPrevious={onPrevious}
              isSubmitting={isLoading}
              disableNext={!validationSuccess}
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SignatureAgreement;
