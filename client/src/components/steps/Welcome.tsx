import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import FormNavigation from "@/components/FormNavigation";
import WelcomeAudio from "@/components/WelcomeAudio";
import VoiceSettings, { VoiceSettings as VoiceSettingsType } from "@/components/VoiceSettings";
import LegalDocumentModal from "@/components/shared/LegalDocumentModal";
import { privacyPolicyContent, termsAndConditionsContent } from "@/lib/legalContent";
import { Application } from "@shared/schema";

const welcomeSchema = z.object({
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions to continue.",
  }),
});

type WelcomeData = z.infer<typeof welcomeSchema>;

interface WelcomeProps {
  application?: Application;
  onNext: (data?: any) => void;
  isLoading?: boolean;
}

const Welcome = ({ application, onNext, isLoading = false }: WelcomeProps) => {
  const [voiceSettings, setVoiceSettings] = useState({
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0,
    useSpeakerBoost: true
  });
  
  const form = useForm<WelcomeData>({
    resolver: zodResolver(welcomeSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const onSubmit = (data: WelcomeData) => {
    onNext();
  };
  
  const handleVoiceSettingsChange = (settings: VoiceSettingsType) => {
    setVoiceSettings(settings);
  };

  return (
    <div className="p-6 relative">
      <div className="absolute top-0 right-0 left-0 h-36 bg-gradient-to-b from-primary/20 to-transparent -mx-6 -mt-6 rounded-t-md z-0"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary/20 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-primary">Welcome to PlataPay Agent Onboarding</h2>
            <p className="text-sm text-muted-foreground">Begin your journey as a financial services provider</p>
          </div>
        </div>
        
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 mb-6">
          <WelcomeAudio 
            name={application?.firstName || ''} 
            voiceSettings={voiceSettings}
          />
          
          <div className="mt-4">
            <VoiceSettings onVoiceSettingsChange={handleVoiceSettingsChange} />
          </div>
        </div>
        
        <div className="prose prose-sm max-w-none mb-6">
          <p className="text-foreground">
            Thank you for your interest in becoming a PlataPay financial agent. This application will guide you 
            through the process of providing the necessary information for your agent application.
          </p>
          
          <p className="text-foreground">
            The application process consists of multiple steps covering:
          </p>
          
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 mb-4">
            <li className="flex items-center gap-2 bg-primary/5 p-2 rounded border border-primary/10">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">1</span>
              Personal information
            </li>
            <li className="flex items-center gap-2 bg-primary/5 p-2 rounded border border-primary/10">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">2</span>
              Background check
            </li>
            <li className="flex items-center gap-2 bg-primary/5 p-2 rounded border border-primary/10">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">3</span>
              Business information
            </li>
            <li className="flex items-center gap-2 bg-primary/5 p-2 rounded border border-primary/10">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">4</span>
              Location details
            </li>
            <li className="flex items-center gap-2 bg-primary/5 p-2 rounded border border-primary/10">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">5</span>
              Package selection
            </li>
            <li className="flex items-center gap-2 bg-primary/5 p-2 rounded border border-primary/10">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">6</span>
              Document uploads
            </li>
          </ul>
          
          <p className="bg-secondary/10 p-3 rounded border border-secondary/20 text-foreground">
            You can save your progress at any time and return to complete the application later. 
            Please ensure all information provided is accurate and complete.
          </p>
        </div>
        
        <div className="rounded-md border border-primary/20 bg-primary/5 p-4 mb-6">
          <h3 className="text-lg font-medium text-primary mb-2">Privacy Notice</h3>
          <p className="text-sm text-foreground">
            PlataPay values your privacy and will handle your information in accordance with our{" "}
            <LegalDocumentModal 
              triggerText="Privacy Policy"
              title="Privacy Policy"
              content={privacyPolicyContent}
            />
            . The information collected through this application will be used for 
            the purposes of evaluating your eligibility to become a PlataPay financial agent.
          </p>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I have read and accept the{" "}
                    <LegalDocumentModal 
                      triggerText="Terms & Conditions"
                      title="Terms and Conditions"
                      content={termsAndConditionsContent}
                    />
                    {" "}and{" "}
                    <LegalDocumentModal 
                      triggerText="Privacy Policy"
                      title="Privacy Policy"
                      content={privacyPolicyContent}
                    />
                  </FormLabel>
                  <FormDescription>
                    You must agree to continue with the application process
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          
          <FormNavigation 
            isFirstStep={true} 
            isSubmitting={isLoading}
            disableNext={!form.watch("acceptTerms")}
          />
        </form>
      </Form>
    </div>
  );
};

export default Welcome;
