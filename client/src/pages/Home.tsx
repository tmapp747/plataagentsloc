import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCreateApplication } from "@/hooks/useApplication";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRight,
  CheckCircle2, 
  Clock, 
  Briefcase, 
  Map, 
  FileText, 
  DollarSign 
} from "lucide-react";

const Home = () => {
  const { createApplication, isCreating } = useCreateApplication();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Become a PlataPay Financial Agent
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Join our network of financial agents and help provide essential financial services to your community
        </p>
        <div className="mt-8">
          <Button 
            size="lg"
            onClick={createApplication}
            disabled={isCreating}
            className="bg-primary hover:bg-primary/90"
          >
            {isCreating ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Creating Application...
              </>
            ) : (
              <>
                Start Your Application
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Quick Application
            </CardTitle>
            <CardDescription>
              Complete your application in less than 30 minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Our streamlined process makes it easy to apply. You can save your progress and resume later if needed.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-primary" />
              Business Opportunity
            </CardTitle>
            <CardDescription>
              Grow your income with our competitive packages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Choose from flexible business packages designed to fit your needs and maximize your earning potential.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
              Full Support
            </CardTitle>
            <CardDescription>
              Comprehensive training and ongoing assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Our team provides complete support to ensure your success as a PlataPay financial agent.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Application Process
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium mb-2">Personal Info</h3>
            <p className="text-sm text-gray-600">
              Fill in your basic details and background information
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium mb-2">Business Info</h3>
            <p className="text-sm text-gray-600">
              Tell us about your business experience and plans
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
              <Map className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium mb-2">Location</h3>
            <p className="text-sm text-gray-600">
              Provide your home and business locations
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
              <DollarSign className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium mb-2">Package Selection</h3>
            <p className="text-sm text-gray-600">
              Choose the package that fits your business needs
            </p>
          </div>
        </div>
      </div>

      <div className="bg-primary/5 rounded-lg p-8 text-center mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to get started?
        </h2>
        <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
          Start your application today and join thousands of successful PlataPay agents across the country.
        </p>
        <Button 
          size="lg"
          onClick={createApplication}
          disabled={isCreating}
          className="bg-primary hover:bg-primary/90"
        >
          {isCreating ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Creating Application...
            </>
          ) : (
            <>
              Apply Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium text-gray-900">
                Who can become a PlataPay agent?
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Any individual or business owner with a good reputation and suitable location can apply to become a PlataPay agent.
              </p>
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900">
                How long does the approval process take?
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Most applications are processed within 3-5 business days after submission.
              </p>
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900">
                What documents do I need to submit?
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Required documents include government-issued ID, proof of address, and business permits if applicable.
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Contact Support
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Need help with your application or have questions about becoming a PlataPay agent?
          </p>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600 w-20">Email:</span>
              <a href="mailto:agents@platapay.com" className="text-sm text-primary hover:underline">
                agents@platapay.com
              </a>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600 w-20">Phone:</span>
              <a href="tel:+6391234567890" className="text-sm text-primary hover:underline">
                (02) 8123-4567
              </a>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600 w-20">Hours:</span>
              <span className="text-sm text-gray-600">
                Monday to Friday, 9AM - 5PM
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
