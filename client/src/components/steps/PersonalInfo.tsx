import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalInfoSchema } from "@shared/schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { QRCodeSVG } from "qrcode.react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import FormNavigation from "@/components/FormNavigation";
import FormSaveContinue from "@/components/FormSaveContinue";
import FormValidationSummary from "@/components/FormValidationSummary";
import { Application } from "@shared/schema";

type PersonalInfoData = z.infer<typeof personalInfoSchema>;

interface PersonalInfoProps {
  application?: Application;
  onNext: (data: any) => void;
  onPrevious: () => void;
  onSave: (data: any) => void;
  applicationId: string;
  isLoading?: boolean;
}

const PersonalInfo = ({
  application,
  onNext,
  onPrevious,
  onSave,
  applicationId,
  isLoading = false,
}: PersonalInfoProps) => {
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [showPersonalizedEmailSent, setShowPersonalizedEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSendError, setEmailSendError] = useState<string | null>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Set default values from the application data if available
  const defaultValues: Partial<PersonalInfoData> = {
    firstName: application?.firstName || "",
    middleName: application?.middleName || "",
    lastName: application?.lastName || "",
    dateOfBirth: application?.dateOfBirth || "",
    gender: application?.gender || "",
    nationality: application?.nationality || "",
    email: application?.email || "",
    phoneNumber: application?.phoneNumber || "",
    mobileNumber: application?.mobileNumber || "",
    civilStatus: application?.civilStatus || "",
    idType: application?.idType || "",
    idNumber: application?.idNumber || "",
  };

  const form = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues,
    mode: "onChange",
  });

  const resumeUrl = `${window.location.origin}/resume/${application?.resumeToken}`;

  // Generate validation success/error state when values change
  const formState = form.formState;
  
  // Check if the form is valid whenever the form state changes
  useEffect(() => {
    const subscription = form.watch(() => {
      if (Object.keys(formState.errors).length === 0 && formState.isDirty) {
        setValidationSuccess(true);
      } else {
        setValidationSuccess(false);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, formState.errors, formState.isDirty]);

  // Send personalized welcome email with QR code
  const sendPersonalizedEmail = async (data: PersonalInfoData) => {
    if (!data.email) {
      toast({
        title: "Email required",
        description: "Please provide your email address to receive the QR code.",
        variant: "destructive",
      });
      return false;
    }

    setSendingEmail(true);
    setEmailSendError(null);
    
    try {
      // Get the QR code from the ref
      const svgElement = qrCodeRef.current?.querySelector('svg');
      if (!svgElement) {
        throw new Error("QR code not found");
      }
      
      // Convert SVG to data URL for email
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(svgBlob);
      
      // Create a canvas to convert SVG to PNG
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not create canvas context");
      
      // Draw the SVG on the canvas
      const img = new Image();
      img.src = blobUrl;
      
      // Wait for the image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Draw the image on the canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      // Send the personalized welcome email with QR code
      const response = await fetch('/api/send-qr-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          qrCodeImage: dataUrl,
          resumeUrl
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send personalized welcome email");
      }
      
      setShowPersonalizedEmailSent(true);
      toast({
        title: "Welcome email sent!",
        description: "We've sent a personalized welcome email with your QR code to continue the application.",
      });
      
      return true;
    } catch (error) {
      console.error("Error sending personalized email:", error);
      setEmailSendError((error as Error).message || "Failed to send email");
      toast({
        title: "Email not sent",
        description: "An error occurred while sending the email. You can continue with your application.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSendingEmail(false);
    }
  };

  const onSubmit = async (data: PersonalInfoData) => {
    // Save the form data first
    onSave(data);
    
    // If email opt-in is checked, send personalized email
    if (emailOptIn && data.email) {
      await sendPersonalizedEmail(data);
    }
    
    // Proceed to next step regardless of email status
    onNext(data);
  };

  const handleSave = () => {
    const data = form.getValues();
    onSave(data);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
      <p className="text-sm text-gray-500 mb-6">
        Please provide your personal details so we can verify your identity.
      </p>

      {/* Only show FormSaveContinue if we're in edit mode (when application already has some data) */}
      {application?.firstName && (
        <FormSaveContinue resumeUrl={resumeUrl} onSave={handleSave} />
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="middleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="philippines">Philippines</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <div className="flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        +63
                      </span>
                      <Input 
                        className="rounded-l-none" 
                        {...field} 
                        value={field.value?.replace(/^\+63/, '')}
                        onChange={(e) => {
                          // Allow only numbers
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          field.onChange(value);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Enter without the country code</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="mobileNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number (Optional)</FormLabel>
                <FormControl>
                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      +63
                    </span>
                    <Input 
                      className="rounded-l-none" 
                      {...field} 
                      value={field.value?.replace(/^\+63/, '')}
                      onChange={(e) => {
                        // Allow only numbers
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        field.onChange(value);
                      }}
                    />
                  </div>
                </FormControl>
                <FormDescription>Enter without the country code</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="civilStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Civil Status *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="idType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="drivers_license">Driver's License</SelectItem>
                      <SelectItem value="sss">SSS ID</SelectItem>
                      <SelectItem value="philhealth">PhilHealth ID</SelectItem>
                      <SelectItem value="voters_id">Voter's ID</SelectItem>
                      <SelectItem value="national_id">National ID</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="idNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Number *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* QR Code section (only appears after the form is valid) */}
          {validationSuccess && formState.isValid && (
            <div className="mb-8 bg-primary-lighter bg-opacity-10 rounded-lg p-4">
              <h3 className="text-lg font-medium text-primary mb-2">Your Application QR Code</h3>
              <p className="text-sm text-gray-600 mb-4">
                This QR code allows you to continue your application from any device. We recommend saving it or having it emailed to you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* QR Code Display */}
                <div ref={qrCodeRef} className="bg-white p-3 rounded-md shadow-sm">
                  <QRCodeSVG
                    id="personal-info-qr"
                    value={resumeUrl}
                    size={150}
                    level="M"
                    includeMargin={true}
                    bgColor={"#ffffff"}
                    fgColor={"#4A2A82"}
                  />
                </div>
                
                {/* Email Opt-in */}
                <div className="flex-1">
                  <div className="flex items-start space-x-2 mb-4">
                    <Checkbox 
                      id="email-optin" 
                      checked={emailOptIn}
                      onCheckedChange={(checked) => setEmailOptIn(checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="email-optin"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Send me a personalized welcome email with this QR code
                      </label>
                      <p className="text-sm text-muted-foreground">
                        You'll receive a welcome email with this QR code when you proceed to the next step
                      </p>
                    </div>
                  </div>
                  
                  {/* Show success message if email was sent */}
                  {showPersonalizedEmailSent && (
                    <div className="text-sm text-green-600 mb-2">
                      Welcome email sent successfully to {form.getValues("email")}!
                    </div>
                  )}
                  
                  {/* Show error message if email failed */}
                  {emailSendError && (
                    <Alert variant="destructive" className="mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Email Error</AlertTitle>
                      <AlertDescription>
                        {emailSendError}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          )}

          <FormValidationSummary
            errors={formState.errors}
            success={validationSuccess && formState.isValid}
            successMessage="Your personal information is complete and ready for submission."
          />

          <FormNavigation
            onPrevious={onPrevious}
            isSubmitting={isLoading || sendingEmail}
            disableNext={!formState.isValid}
          />
        </form>
      </Form>
    </div>
  );
};

export default PersonalInfo;
