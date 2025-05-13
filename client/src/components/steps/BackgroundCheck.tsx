import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { backgroundCheckSchema } from "@shared/schema";
import { z } from "zod";
import { useState } from "react";
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
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import FormNavigation from "@/components/FormNavigation";
import FormSaveContinue from "@/components/FormSaveContinue";
import FormValidationSummary from "@/components/FormValidationSummary";
import { Application } from "@shared/schema";

type BackgroundCheckData = z.infer<typeof backgroundCheckSchema>;

interface BackgroundCheckProps {
  application?: Application;
  onNext: (data: any) => void;
  onPrevious: () => void;
  onSave: (data: any) => void;
  applicationId: string;
  isLoading?: boolean;
}

const BackgroundCheck = ({
  application,
  onNext,
  onPrevious,
  onSave,
  applicationId,
  isLoading = false,
}: BackgroundCheckProps) => {
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [showBankruptcyDetails, setShowBankruptcyDetails] = useState(
    application?.declaredBankruptcy === "yes"
  );

  // Set default values from the application data if available
  const defaultValues: Partial<BackgroundCheckData> = {
    firstTimeApplying: application?.firstTimeApplying || "",
    everCharged: application?.everCharged || "",
    declaredBankruptcy: application?.declaredBankruptcy || "",
    bankruptcyDetails: application?.bankruptcyDetails || "",
    incomeSource: application?.incomeSource || "",
  };

  const form = useForm<BackgroundCheckData>({
    resolver: zodResolver(backgroundCheckSchema),
    defaultValues,
    mode: "onChange",
  });

  const resumeUrl = `${window.location.origin}/resume/${application?.resumeToken}`;

  // Generate validation success/error state when values change
  const formState = form.formState;
  
  useState(() => {
    // Check if the form is valid whenever the form state changes
    const subscription = form.watch(() => {
      if (Object.keys(formState.errors).length === 0 && formState.isDirty) {
        setValidationSuccess(true);
      } else {
        setValidationSuccess(false);
      }
    });
    
    // Watch bankruptcy status to toggle details field
    const bankruptcySubscription = form.watch("declaredBankruptcy", (value) => {
      setShowBankruptcyDetails(value === "yes");
    });
    
    return () => {
      subscription.unsubscribe();
      bankruptcySubscription.unsubscribe();
    };
  });

  const onSubmit = (data: BackgroundCheckData) => {
    onNext(data);
  };

  const handleSave = () => {
    const data = form.getValues();
    onSave(data);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Background Check</h2>
      <p className="text-sm text-gray-500 mb-6">
        Please answer the following questions honestly. This information is used for verification purposes only.
      </p>

      <FormSaveContinue resumeUrl={resumeUrl} onSave={handleSave} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="firstTimeApplying"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Is this your first time applying to be a financial agent?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="yes" />
                      </FormControl>
                      <FormLabel className="font-normal">Yes</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="no" />
                      </FormControl>
                      <FormLabel className="font-normal">No</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="everCharged"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Have you ever been charged with or convicted of a crime?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="yes" />
                      </FormControl>
                      <FormLabel className="font-normal">Yes</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="no" />
                      </FormControl>
                      <FormLabel className="font-normal">No</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="declaredBankruptcy"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Have you ever declared bankruptcy?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      setShowBankruptcyDetails(value === "yes");
                    }}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="yes" />
                      </FormControl>
                      <FormLabel className="font-normal">Yes</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="no" />
                      </FormControl>
                      <FormLabel className="font-normal">No</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showBankruptcyDetails && (
            <FormField
              control={form.control}
              name="bankruptcyDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Please provide details about your bankruptcy</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Include the year filed and resolution status
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="incomeSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Source of Income</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="employment">Employment</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="investments">Investments</SelectItem>
                    <SelectItem value="pension">Pension</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormValidationSummary
            errors={formState.errors}
            success={validationSuccess && formState.isValid}
            successMessage="Your background information is complete and valid."
          />

          <FormNavigation
            onPrevious={onPrevious}
            isSubmitting={isLoading}
            disableNext={!formState.isValid}
          />
        </form>
      </Form>
    </div>
  );
};

export default BackgroundCheck;
