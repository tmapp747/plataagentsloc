import { useParams, useNavigate } from "react-router-dom";
import { useResumeApplication } from "@/hooks/useApplication";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const ResumeApplication = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isLoading, error } = useResumeApplication(token || '');

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-48" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-full" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error Resuming Application
            </CardTitle>
            <CardDescription>
              We couldn't resume your application with the provided token.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {error instanceof Error ? error.message : "The application may not exist or the resume link may have expired."}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Resuming Application</CardTitle>
          <CardDescription>
            Please wait while we load your application...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeApplication;
