import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessInfoSchema } from "@shared/schema";
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
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import FormNavigation from "@/components/FormNavigation";
import FormSaveContinue from "@/components/FormSaveContinue";
import FormValidationSummary from "@/components/FormValidationSummary";
import { Application } from "@shared/schema";
import { useBusinessTypes, useBusinessNatures, useYearsOperating, useDailyTransactions } from "@/hooks/useValidationData";

type BusinessInfoData = z.infer<typeof businessInfoSchema>;

interface BusinessExperienceProps {
  application?: Application;
  onNext: (data: any) => void;
  onPrevious: () => void;
  onSave: (data: any) => void;
  applicationId: string;
  isLoading?: boolean;
}

const BusinessExperience = ({
  application,
  onNext,
  onPrevious,
  onSave,
  applicationId,
  isLoading = false,
}: BusinessExperienceProps) => {
  const [validationSuccess, setValidationSuccess] = useState(false);
  
  // Fetch validation data from the API
  const { data: businessTypes, isLoading: isLoadingBusinessTypes } = useBusinessTypes();
  const { data: businessNatures, isLoading: isLoadingBusinessNatures } = useBusinessNatures();
  const { data: yearsOperating, isLoading: isLoadingYearsOperating } = useYearsOperating();
  const { data: dailyTransactions, isLoading: isLoadingDailyTransactions } = useDailyTransactions();

  // Set default values from the application data if available
  const defaultValues: Partial<BusinessInfoData> = {
    businessName: application?.businessName || "",
    businessType: application?.businessType || "",
    businessNature: application?.businessNature || "",
    yearsOperating: application?.yearsOperating || "",
    dailyTransactions: application?.dailyTransactions || "",
    hasExistingBusiness: application?.hasExistingBusiness || false,
    isFirstTimeBusiness: application?.isFirstTimeBusiness || false,
  };

  const form = useForm<BusinessInfoData>({
    resolver: zodResolver(businessInfoSchema),
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
    
    return () => subscription.unsubscribe();
  });

  const onSubmit = (data: BusinessInfoData) => {
    onNext(data);
  };

  const handleSave = () => {
    const data = form.getValues();
    onSave(data);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Information</h2>
      <p className="text-sm text-gray-500 mb-6">
        Tell us about your business experience and plans.
      </p>

      <FormSaveContinue resumeUrl={resumeUrl} onSave={handleSave} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name (if applicable)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingBusinessTypes ? (
                        <SelectItem value="loading">Loading...</SelectItem>
                      ) : (
                        businessTypes?.map((type: string) => (
                          <SelectItem key={type} value={type}>
                            {type.split('_').map((word: string) => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="businessNature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nature of Business *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingBusinessNatures ? (
                      <SelectItem value="loading">Loading...</SelectItem>
                    ) : (
                      businessNatures?.map((nature: string) => (
                        <SelectItem key={nature} value={nature}>
                          {nature.split('_').map((word: string) => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="yearsOperating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years in Operation *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingYearsOperating ? (
                        <SelectItem value="loading">Loading...</SelectItem>
                      ) : (
                        yearsOperating?.map((years: string) => (
                          <SelectItem key={years} value={years}>
                            {years === "0-1" ? "Less than 1 year" : 
                             years === "10+" ? "More than 10 years" :
                             `${years} years`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dailyTransactions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Daily Transactions *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingDailyTransactions ? (
                        <SelectItem value="loading">Loading...</SelectItem>
                      ) : (
                        dailyTransactions?.map((transaction: string) => (
                          <SelectItem key={transaction} value={transaction}>
                            {transaction === "less_than_10" ? "Less than 10" : 
                             transaction === "500+" ? "More than 500" :
                             transaction.replace('_', '-')}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="hasExistingBusiness"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Do you currently have an existing business? *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === "yes")}
                    defaultValue={field.value ? "yes" : "no"}
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
            name="isFirstTimeBusiness"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Is this your first time starting a business? *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === "yes")}
                    defaultValue={field.value ? "yes" : "no"}
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

          <FormValidationSummary
            errors={formState.errors}
            success={validationSuccess && formState.isValid}
            successMessage="Your business information is complete and valid."
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

export default BusinessExperience;
