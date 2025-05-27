import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { packageSelectionSchema } from "@shared/schema";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, X } from "lucide-react";
import FormNavigation from "@/components/FormNavigation";
import FormSaveContinue from "@/components/FormSaveContinue";
import FormValidationSummary from "@/components/FormValidationSummary";
import StepAudio from "@/components/StepAudio";
import { Application } from "@shared/schema";
import { businessPackages } from "@/lib/formSchema";
import { formatCurrency } from "@/lib/utils";

type PackageSelectionData = z.infer<typeof packageSelectionSchema>;

interface BusinessPackagesProps {
  application?: Application;
  onNext: (data: any) => void;
  onPrevious: () => void;
  onSave: (data: any) => void;
  applicationId: string;
  isLoading?: boolean;
}

const BusinessPackages = ({
  application,
  onNext,
  onPrevious,
  onSave,
  applicationId,
  isLoading = false,
}: BusinessPackagesProps) => {
  const [validationSuccess, setValidationSuccess] = useState(false);

  // Set default values from the application data if available
  const defaultValues: Partial<PackageSelectionData> = {
    packageType: application?.packageType || "",
    monthlyFee: application?.monthlyFee || "",
    setupFee: application?.setupFee || "",
  };

  const form = useForm<PackageSelectionData>({
    resolver: zodResolver(packageSelectionSchema),
    defaultValues,
    mode: "onChange",
  });

  const resumeUrl = `${window.location.origin}/resume/${application?.resumeToken}`;

  // Generate validation success/error state when values change
  const formState = form.formState;
  
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

  const onSubmit = (data: PackageSelectionData) => {
    onNext(data);
  };

  const handleSave = () => {
    const data = form.getValues();
    onSave(data);
  };

  const handlePackageSelect = (packageType: string) => {
    const selectedPackage = businessPackages.find(pkg => pkg.id === packageType);
    if (selectedPackage) {
      form.setValue("packageType", packageType, { shouldValidate: true });
      form.setValue("monthlyFee", selectedPackage.monthlyFee, { shouldValidate: true });
      form.setValue("setupFee", selectedPackage.setupFee, { shouldValidate: true });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Packages</h2>
      <StepAudio step="packageSelection" autoPlay={true} />
      <p className="text-sm text-gray-500 mb-6">
        Select the package that best suits your business needs.
      </p>

      <FormSaveContinue resumeUrl={resumeUrl} onSave={handleSave} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="packageType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Select a Package *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => handlePackageSelect(value)}
                    defaultValue={field.value}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {businessPackages.map((pkg) => (
                      <FormItem key={pkg.id} className="flex-1">
                        <FormControl>
                          <RadioGroupItem
                            value={pkg.id}
                            id={pkg.id}
                            className="sr-only"
                          />
                        </FormControl>
                        <FormLabel htmlFor={pkg.id} className="w-full cursor-pointer">
                          <Card
                            className={`h-full overflow-hidden transition-all ${
                              field.value === pkg.id
                                ? "border-2 border-primary ring-2 ring-primary"
                                : "border border-gray-200 hover:border-primary/50"
                            }`}
                          >
                            <CardHeader className="bg-gray-50 pb-2">
                              <CardTitle className="flex justify-between items-center">
                                <span>{pkg.name}</span>
                                {field.value === pkg.id && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white">
                                    Selected
                                  </span>
                                )}
                              </CardTitle>
                              <CardDescription>{pkg.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <div className="text-2xl font-bold text-primary mb-3">
                                {formatCurrency(parseInt(pkg.monthlyFee))}<span className="text-sm font-normal text-gray-500">/month</span>
                              </div>
                              <div className="text-sm text-gray-600 mb-4">
                                Setup fee: {formatCurrency(parseInt(pkg.setupFee))}
                              </div>
                              <ul className="space-y-2">
                                {pkg.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start text-sm">
                                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                            <CardFooter className="bg-gray-50 flex justify-center border-t pt-4">
                              <span
                                className={`text-sm font-medium ${
                                  field.value === pkg.id
                                    ? "text-primary"
                                    : "text-gray-700"
                                }`}
                              >
                                {field.value === pkg.id ? "Selected Package" : "Select Package"}
                              </span>
                            </CardFooter>
                          </Card>
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormValidationSummary
            errors={formState.errors}
            success={validationSuccess && formState.isValid}
            successMessage="Your package selection is complete. You can proceed to the next step."
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

export default BusinessPackages;
