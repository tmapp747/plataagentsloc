import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ApplicationForm from "@/components/ApplicationForm";
import { Application } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const ApplicationPage = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  
  const { data: application, isLoading, error, isError } = useQuery<Application>({
    queryKey: [`/api/applications/${applicationId}`],
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // If the application is submitted and the user tries to access it directly,
  // redirect to the confirmation step
  useEffect(() => {
    if (application?.status === 'submitted') {
      // Update the form step to the confirmation step
      const element = document.querySelector('[data-step="9"]');
      if (element) {
        element.scrollIntoView();
      }
    }
  }, [application]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-12 w-full mb-8" />
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load application. The application may not exist or you may not have permission to access it."}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/')}>Return to Home</Button>
      </div>
    );
  }

  return <ApplicationForm />;
};

export default ApplicationPage;
