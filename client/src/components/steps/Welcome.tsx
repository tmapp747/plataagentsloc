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
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to PlataPay Agent Onboarding</h2>
      
      <WelcomeAudio 
        name={application?.firstName || ''} 
        voiceSettings={voiceSettings}
      />
      
      <div className="mb-4">
        <VoiceSettings onVoiceSettingsChange={handleVoiceSettingsChange} />
      </div>
      
      <div className="prose prose-sm max-w-none mb-6">
        <p>
          Thank you for your interest in becoming a PlataPay financial agent. This application will guide you 
          through the process of providing the necessary information for your agent application.
        </p>
        
        <p>
          The application process consists of multiple steps covering:
        </p>
        
        <ul>
          <li>Personal information</li>
          <li>Background check</li>
          <li>Business information</li>
          <li>Location details</li>
          <li>Package selection</li>
          <li>Document uploads</li>
        </ul>
        
        <p>
          You can save your progress at any time and return to complete the application later. 
          Please ensure all information provided is accurate and complete.
        </p>
        
        <h3 className="text-lg font-medium mt-6 mb-2">Privacy Notice</h3>
        <p className="text-sm">
          PlataPay values your privacy and will handle your information in accordance with our 
          Privacy Policy. The information collected through this application will be used for 
          the purposes of evaluating your eligibility to become a PlataPay financial agent.
        </p>
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
                    I have read and accept the Terms & Conditions and Privacy Policy
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
