import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Application } from "@shared/schema";
import platapayLogo from '@/assets/platapay-logo.png';
import FormProgress from "./FormProgress";
import Welcome from "./steps/Welcome";
import PersonalInfo from "./steps/PersonalInfo";
import BackgroundCheck from "./steps/BackgroundCheck";
import BusinessExperience from "./steps/BusinessExperience";
import ConsolidatedLocationForm from "./steps/ConsolidatedLocationForm";
import BusinessPackages from "./steps/BusinessPackages";
import DocumentRequirements from "./steps/DocumentRequirements";
import SignatureAgreement from "./steps/SignatureAgreement";
import FormSummary from "./steps/FormSummary";
import Confirmation from "./steps/Confirmation";
import { Skeleton } from "@/components/ui/skeleton";

const steps = [
  { id: 0, name: "Welcome", component: Welcome },
  { id: 1, name: "Personal Info", component: PersonalInfo },
  { id: 2, name: "Background", component: BackgroundCheck },
  { id: 3, name: "Business", component: BusinessExperience },
  { id: 4, name: "Location", component: ConsolidatedLocationForm },
  { id: 5, name: "Packages", component: BusinessPackages },
  { id: 6, name: "Documents", component: DocumentRequirements },
  { id: 7, name: "Signature", component: SignatureAgreement },
  { id: 8, name: "Review", component: FormSummary },
  { id: 9, name: "Confirmation", component: Confirmation },
];

const ApplicationForm = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [currentStep, setCurrentStep] = useState(0);

  const { data: application, isLoading, error } = useQuery<Application>({
    queryKey: [`/api/applications/${applicationId}`],
    refetchOnWindowFocus: false,
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ step, data }: { step: number; data: any }) => {
      return apiRequest("PATCH", `/api/applications/${applicationId}`, {
        ...data,
        lastStep: step,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${applicationId}`] });
    },
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/applications/${applicationId}/submit`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${applicationId}`] });
      setCurrentStep(9); // Move to confirmation step
    },
  });

  const handleNext = async (data?: any) => {
    if (data) {
      await updateApplicationMutation.mutateAsync({ 
        step: currentStep + 1, 
        data 
      });
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    await submitApplicationMutation.mutateAsync();
  };

  const handleSaveAndContinue = async (data?: any) => {
    if (data) {
      await updateApplicationMutation.mutateAsync({
        step: currentStep,
        data,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-12 w-full mb-8" />
        <div className="bg-gradient-to-b from-primary/10 to-white shadow-lg rounded-lg overflow-hidden border border-primary/20">
          <div className="p-6">
            <Skeleton className="h-8 w-64 mb-6" />
            <Skeleton className="h-4 w-full mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-red-800">Error loading application</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>Unable to load the application. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-center mb-6">
        <img 
          src={platapayLogo} 
          alt="PlataPay Logo" 
          className="h-16 w-16"
        />
      </div>
    
      <FormProgress 
        steps={steps} 
        currentStep={currentStep} 
        applicationStatus={application?.status}
      />
      
      <div className="bg-gradient-to-b from-primary/20 to-primary/5 shadow-lg rounded-lg overflow-hidden border border-primary/20">
        <div className="p-2 bg-white/80 m-2 rounded-md">
          <CurrentStepComponent
            application={application}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSubmit={handleSubmit}
            onSave={handleSaveAndContinue}
            applicationId={applicationId || ''}
            isLoading={updateApplicationMutation.isPending || submitApplicationMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
