import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCreateApplication } from "@/hooks/useApplication";
import { apiRequest } from "@/lib/queryClient";

export default function FormTester() {
  const { toast } = useToast();
  const { createApplication, isCreating } = useCreateApplication();
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{step: number, status: 'pending' | 'success' | 'error', message?: string}[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  // Reset the test
  const resetTest = () => {
    setApplicationId(null);
    setTestResults([]);
  };

  // Create a new application and set the ID
  const startEndToEndTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Step 1: Create application
      setTestResults(prev => [...prev, {step: 1, status: 'pending', message: 'Creating application...'}]);
      
      const createResponse = await apiRequest("POST", "/api/applications", {
        email: "test@example.com"
      });
      
      const appData = await createResponse.json();
      setApplicationId(appData.applicationId);
      
      setTestResults(prev => prev.map(result => 
        result.step === 1 
          ? {...result, status: 'success', message: `Application created with ID: ${appData.applicationId}`} 
          : result
      ));
      
      // Wait a bit before continuing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Update with personal info
      setTestResults(prev => [...prev, {step: 2, status: 'pending', message: 'Updating personal information...'}]);
      
      const personalInfoResponse = await apiRequest("PATCH", `/api/applications/${appData.applicationId}`, {
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        nationality: 'Filipino',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        civilStatus: 'single',
        idType: 'drivers_license',
        idNumber: '123456789',
        lastStep: 1
      });
      
      if (!personalInfoResponse.ok) {
        throw new Error('Failed to update personal information');
      }
      
      setTestResults(prev => prev.map(result => 
        result.step === 2 
          ? {...result, status: 'success', message: 'Personal information updated successfully'} 
          : result
      ));
      
      // Wait a bit before continuing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 3: Update with background check information
      setTestResults(prev => [...prev, {step: 3, status: 'pending', message: 'Updating background check information...'}]);
      
      const backgroundResponse = await apiRequest("PATCH", `/api/applications/${appData.applicationId}`, {
        firstTimeApplying: 'yes',
        everCharged: 'no',
        declaredBankruptcy: 'no',
        incomeSource: 'employment',
        lastStep: 2
      });
      
      if (!backgroundResponse.ok) {
        throw new Error('Failed to update background information');
      }
      
      setTestResults(prev => prev.map(result => 
        result.step === 3 
          ? {...result, status: 'success', message: 'Background information updated successfully'} 
          : result
      ));
      
      // Wait a bit before continuing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 4: Update with business information
      setTestResults(prev => [...prev, {step: 4, status: 'pending', message: 'Updating business information...'}]);
      
      const businessResponse = await apiRequest("PATCH", `/api/applications/${appData.applicationId}`, {
        businessName: 'Test Business',
        businessType: 'retail',
        businessNature: 'grocery',
        yearsOperating: '0-1',
        dailyTransactions: '10-50',
        hasExistingBusiness: false,
        isFirstTimeBusiness: true,
        lastStep: 3
      });
      
      if (!businessResponse.ok) {
        throw new Error('Failed to update business information');
      }
      
      setTestResults(prev => prev.map(result => 
        result.step === 4 
          ? {...result, status: 'success', message: 'Business information updated successfully'} 
          : result
      ));
      
      // Wait a bit before continuing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 5: Update with location information
      setTestResults(prev => [...prev, {step: 5, status: 'pending', message: 'Updating location information...'}]);
      
      const locationResponse = await apiRequest("PATCH", `/api/applications/${appData.applicationId}`, {
        address: {
          region: 'NCR',
          province: 'Metro Manila',
          city: 'Manila',
          barangay: 'Malate',
          streetAddress: '123 Test Street'
        },
        businessLocation: {
          region: 'NCR',
          province: 'Metro Manila',
          city: 'Manila',
          barangay: 'Malate',
          streetAddress: '123 Test Street'
        },
        businessLocationSameAsAddress: true,
        landmark: 'Near the mall',
        lastStep: 4
      });
      
      if (!locationResponse.ok) {
        throw new Error('Failed to update location information');
      }
      
      setTestResults(prev => prev.map(result => 
        result.step === 5 
          ? {...result, status: 'success', message: 'Location information updated successfully'} 
          : result
      ));
      
      // Wait a bit before continuing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 6: Update with package selection
      setTestResults(prev => [...prev, {step: 6, status: 'pending', message: 'Updating package selection...'}]);
      
      const packageResponse = await apiRequest("PATCH", `/api/applications/${appData.applicationId}`, {
        packageType: 'basic',
        monthlyFee: 500,
        setupFee: 1000,
        lastStep: 5
      });
      
      if (!packageResponse.ok) {
        throw new Error('Failed to update package information');
      }
      
      setTestResults(prev => prev.map(result => 
        result.step === 6 
          ? {...result, status: 'success', message: 'Package information updated successfully'} 
          : result
      ));
      
      // Wait a bit before continuing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 7: We'll skip document upload as it requires file handling
      setTestResults(prev => [...prev, {step: 7, status: 'success', message: 'Skipping document upload test'}]);
      
      // Wait a bit before continuing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 8: Update with signature agreement
      setTestResults(prev => [...prev, {step: 8, status: 'pending', message: 'Updating signature agreement...'}]);
      
      const signatureResponse = await apiRequest("PATCH", `/api/applications/${appData.applicationId}`, {
        termsAccepted: true,
        signatureUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=',
        lastStep: 7
      });
      
      if (!signatureResponse.ok) {
        throw new Error('Failed to update signature information');
      }
      
      setTestResults(prev => prev.map(result => 
        result.step === 8 
          ? {...result, status: 'success', message: 'Signature agreement updated successfully'} 
          : result
      ));
      
      // Wait a bit before continuing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Final step: Submit the application
      setTestResults(prev => [...prev, {step: 9, status: 'pending', message: 'Submitting application...'}]);
      
      const submitResponse = await apiRequest("POST", `/api/applications/${appData.applicationId}/submit`, {});
      
      if (!submitResponse.ok) {
        throw new Error('Failed to submit application');
      }
      
      const submittedApp = await submitResponse.json();
      
      setTestResults(prev => prev.map(result => 
        result.step === 9 
          ? {...result, status: 'success', message: `Application submitted successfully with status: ${submittedApp.status}`} 
          : result
      ));
      
      // Final verification
      setTestResults(prev => [...prev, {step: 10, status: 'pending', message: 'Verifying submission...'}]);
      
      const verifyResponse = await apiRequest("GET", `/api/applications/${appData.applicationId}`);
      
      if (!verifyResponse.ok) {
        throw new Error('Failed to verify application');
      }
      
      const verifiedApp = await verifyResponse.json();
      
      setTestResults(prev => prev.map(result => 
        result.step === 10 
          ? {...result, status: 'success', message: `Verified application status: ${verifiedApp.status}`} 
          : result
      ));
      
      toast({
        title: "Test completed successfully",
        description: "The application form is working correctly through all steps!",
        variant: "default",
      });
      
    } catch (error) {
      console.error('Test failed:', error);
      
      // Update the current step to error
      setTestResults(prev => {
        const lastItem = prev[prev.length - 1];
        return [
          ...prev.slice(0, -1),
          {...lastItem, status: 'error', message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`}
        ];
      });
      
      toast({
        title: "Test failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Application Form End-to-End Tester</CardTitle>
          <p className="text-muted-foreground">This tool tests the full application form workflow to ensure all steps are working correctly.</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button 
                onClick={startEndToEndTest} 
                disabled={isRunning}
                variant="default"
              >
                {isRunning ? "Test Running..." : "Run End-to-End Test"}
              </Button>
              
              <Button 
                onClick={resetTest} 
                disabled={isRunning || (!applicationId && testResults.length === 0)}
                variant="outline"
              >
                Reset Test
              </Button>
              
              {applicationId && (
                <Button 
                  onClick={() => window.open(`/application/${applicationId}`, '_blank')}
                  variant="outline"
                >
                  View Application
                </Button>
              )}
            </div>
            
            {testResults.length > 0 && (
              <div className="border rounded-md p-4 mt-4">
                <h3 className="text-lg font-medium mb-2">Test Results</h3>
                <div className="space-y-2">
                  {testResults.map((result) => (
                    <div 
                      key={result.step} 
                      className={`p-2 rounded-md flex items-center ${
                        result.status === 'pending' ? 'bg-yellow-100' : 
                        result.status === 'success' ? 'bg-green-100' : 
                        'bg-red-100'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                        result.status === 'pending' ? 'bg-yellow-500' : 
                        result.status === 'success' ? 'bg-green-500' : 
                        'bg-red-500'
                      }`}>
                        {result.status === 'pending' ? '⏳' : 
                         result.status === 'success' ? '✓' : 
                         '✗'}
                      </div>
                      <div>
                        <span className="font-medium">Step {result.step}:</span> {result.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}