import { CheckCircle2, Download, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Application } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import StepAudio from "@/components/StepAudio";

interface ConfirmationProps {
  application?: Application;
  applicationId: string;
}

const Confirmation = ({ application, applicationId }: ConfirmationProps) => {
  const navigate = useNavigate();
  
  const handleGoHome = () => {
    navigate('/');
  };
  
  return (
    <div className="p-6">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="rounded-full bg-green-100 p-3 mb-4">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted Successfully!</h2>
        <StepAudio step="confirmation" autoPlay={true} />
        <p className="text-gray-600 max-w-xl">
          Thank you for completing your PlataPay agent application. We've received your information and will begin the review process.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-lg">Application Details</CardTitle>
          <CardDescription>Reference information for your records</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Application ID</dt>
              <dd className="mt-1 text-sm text-gray-900">{application?.applicationId}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Submission Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(application?.submitDate?.toString())}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Under Review
                </span>
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{application?.email}</dd>
            </div>
          </dl>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t flex justify-between">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
        </CardFooter>
      </Card>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-8">
        <h3 className="text-base font-medium text-blue-800 mb-2">What happens next?</h3>
        <ol className="space-y-3 text-sm text-blue-700">
          <li className="flex items-start">
            <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center text-xs font-bold mr-2">1</span>
            <span>Our team will review your application within 3-5 business days.</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center text-xs font-bold mr-2">2</span>
            <span>You'll receive an email notification about your application status.</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center text-xs font-bold mr-2">3</span>
            <span>If approved, we'll send further instructions for onboarding and training.</span>
          </li>
        </ol>
      </div>

      <div className="flex flex-col items-center mt-8">
        <div className="text-center mb-6">
          <h3 className="text-base font-medium text-gray-900 mb-2">Have questions?</h3>
          <p className="text-sm text-gray-500">
            If you have any questions about your application, please contact our support team at <a href="mailto:support@platapay.com" className="text-primary hover:underline">support@platapay.com</a>
          </p>
        </div>
        
        <Button onClick={handleGoHome}>
          <Home className="h-4 w-4 mr-2" />
          Return to Homepage
        </Button>
      </div>
    </div>
  );
};

export default Confirmation;
