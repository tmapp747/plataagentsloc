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
  DollarSign,
  Mail,
  Phone,
  Clock3
} from "lucide-react";

const Home = () => {
  const { createApplication, isCreating } = useCreateApplication();
  
  return (
    <div className="min-h-screen relative">
      {/* Hero Section with Background */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative z-10">
            <h1 className="text-5xl font-bold text-primary mb-6 tracking-tight">
              PlataPay Agent Onboarding
            </h1>
            <p className="text-xl text-gray-800 max-w-2xl mx-auto mb-10">
              Join our growing network of financial service providers and empower your community
            </p>
            <Button 
              size="lg"
              onClick={createApplication}
              disabled={isCreating}
              className="bg-primary hover:bg-primary/90 text-white font-medium py-6 px-8 rounded-md shadow-lg"
            >
              {isCreating ? (
                <>
                  <Clock className="mr-2 h-5 w-5 animate-spin" />
                  Creating Application...
                </>
              ) : (
                <>
                  Start Your Application
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Key Benefits Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-primary/10 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Premium Franchise</CardTitle>
              <CardDescription>
                Exclusive PlataPay Packages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Access our range of competitive packages designed to maximize your business potential.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-primary/10 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Simplified Process</CardTitle>
              <CardDescription>
                Quick & Efficient Application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Complete your application in under 30 minutes with our streamlined onboarding platform.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-primary/10 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Map className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Strategic Locations</CardTitle>
              <CardDescription>
                Nationwide Network Support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Join our strategically positioned network of agents across the Philippines.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl p-12 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Ready to Become a PlataPay Agent?
            </h2>
            <p className="text-gray-700">
              Start your journey to financial success today and join PlataPay's growing family of financial agents.
            </p>
          </div>
          <Button 
            size="lg"
            onClick={createApplication}
            disabled={isCreating}
            className="bg-primary hover:bg-primary/90 text-white shadow-md"
          >
            {isCreating ? "Processing..." : "Apply Now"}
          </Button>
        </div>
      </div>

      {/* Contact & Footer */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                  <Phone className="h-4 w-4 text-primary" />
                </span>
                Contact Us
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 w-20">Email:</span>
                  <a href="mailto:support@platapay.ph" className="text-sm text-primary hover:underline">
                    support@platapay.ph
                  </a>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 w-20">Phone:</span>
                  <a href="tel:+63285395973" className="text-sm text-primary hover:underline">
                    +63 (2) 8539-5973
                  </a>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 w-20">Website:</span>
                  <a href="https://platapay.ph" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    platapay.ph
                  </a>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 w-20">Hours:</span>
                  <span className="text-sm text-gray-600">
                    Monday to Friday, 9AM - 6PM
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                  <FileText className="h-4 w-4 text-primary" />
                </span>
                Legal Information
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  PlataPay is a leading financial services provider in the Philippines, committed to bringing innovative financial solutions to communities nationwide.
                </p>
                <div className="pt-2">
                  <a href="https://platapay.ph/privacy" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mr-4">
                    Privacy Policy
                  </a>
                  <a href="https://platapay.ph/terms" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} PlataPay Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
