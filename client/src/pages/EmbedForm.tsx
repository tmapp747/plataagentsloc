import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateApplication } from "@/hooks/useApplication";
import MapComponent from "@/components/shared/MapComponent";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

/**
 * Embeddable form component that can be used as a standalone page
 * or embedded in third-party applications, social media, etc.
 */
const EmbedForm = () => {
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [source, setSource] = useState<string>('direct');
  
  const createApplication = useCreateApplication();
  
  // Extract source from URL query params if available
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const sourceParam = query.get('source');
    if (sourceParam) {
      setSource(sourceParam);
    }
  }, []);
  
  const handleMapChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };
  
  const handleStartApplication = async () => {
    try {
      const application = await createApplication.mutateAsync({
        source: source,
        metadata: {
          initialLatitude: latitude,
          initialLongitude: longitude
        }
      });
      
      if (application?.id) {
        toast({
          title: "Application started!",
          description: "You'll now be redirected to the application form.",
        });
        // Redirect to the application page
        navigate(`/application/${application.id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start the application. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-primary text-2xl">Become a PlataPay Agent</CardTitle>
          <CardDescription>
            Start your journey as a financial services provider with PlataPay's franchise program
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="prose max-w-none">
            <p>
              As a PlataPay agent, you'll have the opportunity to offer essential financial services 
              in your community while building a sustainable business.
            </p>
            
            <h3 className="text-primary">Our Franchise Packages Include:</h3>
            <ul>
              <li>Remittance services</li>
              <li>Bills payment</li>
              <li>E-loading</li>
              <li>Digital banking services</li>
              <li>Micro-lending solutions</li>
              <li>Insurance products</li>
            </ul>
            
            <h3 className="text-primary">Pin Your Location</h3>
            <p className="text-sm text-muted-foreground">
              Mark your potential business location on the map below or allow location access to automatically set your position.
            </p>
          </div>
          
          <div className="h-[300px] w-full border rounded-md overflow-hidden">
            {isMobile ? (
              <MapComponent 
                latitude={latitude} 
                longitude={longitude} 
                onChange={handleMapChange} 
              />
            ) : (
              <MapComponent 
                latitude={latitude} 
                longitude={longitude} 
                onChange={handleMapChange} 
                className="h-full w-full"
              />
            )}
          </div>
          
          <Alert className="bg-muted">
            <AlertTitle>Privacy Notice</AlertTitle>
            <AlertDescription>
              By continuing, you agree to our{" "}
              <a href="https://platapay.ph/terms" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="https://platapay.ph/privacy" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
                Privacy Policy
              </a>
            </AlertDescription>
          </Alert>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-6 bg-muted/20">
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button 
            onClick={handleStartApplication}
            disabled={!latitude || !longitude || createApplication.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {createApplication.isPending ? "Starting..." : "Start Application"}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Embed Instructions Section */}
      <Card className="mt-8 border-dashed border-2 border-secondary/30">
        <CardHeader>
          <CardTitle className="text-secondary text-lg">Embed This Form</CardTitle>
          <CardDescription>
            Use the following code to embed this form on your website
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
            {`<iframe 
  src="${window.location.origin}/embed?source=your_website" 
  width="100%" 
  height="700px" 
  frameborder="0"
  allow="geolocation"
></iframe>`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmbedForm;