import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addressSchema, businessLocationSchema } from "@shared/schema";
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
import { Checkbox } from "@/components/ui/checkbox";
import FormNavigation from "@/components/FormNavigation";
import FormSaveContinue from "@/components/FormSaveContinue";
import FormValidationSummary from "@/components/FormValidationSummary";
import AddressFormField from "@/components/shared/AddressFormField";
import MapComponent from "@/components/shared/MapComponent";
import StepAudio from "@/components/StepAudio";
import { Application } from "@shared/schema";

// Schema for home address and simplified business location (lat/long only)
const consolidatedLocationSchema = z.object({
  address: addressSchema,
  businessLocation: businessLocationSchema.optional(),
  businessLocationSameAsAddress: z.boolean().default(false),
  landmark: z.string().optional(),
});

type ConsolidatedLocationData = z.infer<typeof consolidatedLocationSchema>;

interface ConsolidatedLocationFormProps {
  application?: Application;
  onNext: (data: any) => void;
  onPrevious: () => void;
  onSave: (data: any) => void;
  applicationId: string;
  isLoading?: boolean;
}

const ConsolidatedLocationForm = ({
  application,
  onNext,
  onPrevious,
  onSave,
  applicationId,
  isLoading = false,
}: ConsolidatedLocationFormProps) => {
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [useHomeAddress, setUseHomeAddress] = useState(
    application?.businessLocationSameAsAddress || false
  );

  // Set default values from the application data if available
  const defaultValues: Partial<ConsolidatedLocationData> = {
    address: application?.address || {},
    businessLocation: application?.businessLocation || {},
    businessLocationSameAsAddress: application?.businessLocationSameAsAddress || false,
    landmark: application?.landmark || "",
  };

  const form = useForm<ConsolidatedLocationData>({
    resolver: zodResolver(consolidatedLocationSchema),
    defaultValues,
    mode: "onChange",
  });

  const resumeUrl = `${window.location.origin}/resume/${application?.resumeToken}`;

  // Update business location when same as home is checked
  useEffect(() => {
    const subscription = form.watch(value => {
      if (value.businessLocationSameAsAddress) {
        form.setValue("businessLocation", value.address);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

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

  const onSubmit = (data: ConsolidatedLocationData) => {
    // If using home address for business, make sure business location is same as address
    if (data.businessLocationSameAsAddress) {
      data.businessLocation = data.address;
    }
    
    onNext({
      address: data.address,
      businessLocation: data.businessLocation,
      businessLocationSameAsAddress: data.businessLocationSameAsAddress,
      landmark: data.landmark,
    });
  };

  const handleSave = () => {
    const data = form.getValues();
    onSave(data);
  };

  const handleHomeAddressChange = (address: Partial<any>) => {
    form.setValue("address", address, { shouldValidate: true });
    
    // If using same address for business, update business location coordinates
    if (form.getValues("businessLocationSameAsAddress")) {
      const businessLocation = {
        latitude: address.latitude,
        longitude: address.longitude,
        landmark: address.landmark
      };
      form.setValue("businessLocation", businessLocation, { shouldValidate: true });
    }
  };

  const handleHomeMapLocationChange = async (lat: number, lng: number) => {
    try {
      const currentAddress = form.getValues("address") || {};
      const updatedAddress = {
        ...currentAddress,
        latitude: lat,
        longitude: lng,
      };
      
      // Update form value
      form.setValue("address", updatedAddress, { shouldValidate: true });
      
      // If using same address for business, update business location coordinates only
      if (form.getValues("businessLocationSameAsAddress")) {
        const businessLocation = {
          latitude: lat,
          longitude: lng,
          landmark: currentAddress.landmark
        };
        form.setValue("businessLocation", businessLocation, { shouldValidate: true });
      }
      
      // Save the updated coordinates to the backend
      if (applicationId) {
        await onSave({
          address: updatedAddress,
          businessLocation: form.getValues("businessLocationSameAsAddress") 
            ? {
                latitude: lat,
                longitude: lng,
                landmark: currentAddress.landmark
              }
            : form.getValues("businessLocation"),
          businessLocationSameAsAddress: form.getValues("businessLocationSameAsAddress"),
        });
      }
    } catch (error) {
      console.error("Error updating home location coordinates:", error);
    }
  };

  const handleBusinessMapLocationChange = async (lat: number, lng: number) => {
    try {
      // Create a business location with only coordinates
      const updatedBusinessLocation = {
        latitude: lat,
        longitude: lng,
        // Keep landmark if it exists
        landmark: form.getValues("businessLocation")?.landmark || form.getValues("landmark") || "",
      };
      
      // Update form value
      form.setValue("businessLocation", updatedBusinessLocation, { shouldValidate: true });
      
      // Save the updated coordinates to the backend
      if (applicationId) {
        await onSave({
          address: form.getValues("address"),
          businessLocation: updatedBusinessLocation,
          businessLocationSameAsAddress: form.getValues("businessLocationSameAsAddress"),
        });
      }
    } catch (error) {
      console.error("Error updating business location coordinates:", error);
    }
  };

  const handleBusinessLocationChange = (address: Partial<any>) => {
    form.setValue("businessLocation", address, { shouldValidate: true });
  };

  const handleSameAddressChange = (checked: boolean) => {
    setUseHomeAddress(checked);
    form.setValue("businessLocationSameAsAddress", checked, { shouldValidate: true });
    
    if (checked) {
      // Just copy coordinates from home address to business location
      const homeAddress = form.getValues("address");
      const businessLocation = {
        latitude: homeAddress?.latitude || 0,
        longitude: homeAddress?.longitude || 0,
        landmark: homeAddress?.landmark || "",
      };
      form.setValue("businessLocation", businessLocation, { shouldValidate: true });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Details</h2>
      <StepAudio step="addressDetails" autoPlay={true} />
      <p className="text-sm text-gray-500 mb-6">
        Please provide your home address and business location details.
      </p>

      <FormSaveContinue resumeUrl={resumeUrl} onSave={handleSave} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Home Address</h3>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <AddressFormField 
                    address={field.value}
                    onChange={handleHomeAddressChange}
                    required={true}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="mt-6">
              <FormField
                control={form.control}
                name="landmark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nearest Landmark</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a notable landmark near your location to make it easier to find
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mt-6">
              <FormItem>
                <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                  Location on Map *
                </FormLabel>
                <FormControl>
                  <MapComponent
                    latitude={form.getValues("address")?.latitude}
                    longitude={form.getValues("address")?.longitude}
                    onChange={handleHomeMapLocationChange}
                  />
                </FormControl>
                <FormDescription>
                  You can click on the map to set your exact location or use the "Detect my location" button
                </FormDescription>
                <FormMessage />
              </FormItem>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Business Location</h3>
            
            <div className="mb-6">
              <FormField
                control={form.control}
                name="businessLocationSameAsAddress"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          handleSameAddressChange(checked === true);
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Same as home address
                      </FormLabel>
                      <FormDescription>
                        Check this if your business will operate from your home address
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            {!useHomeAddress && (
              <>
                <div className="mt-6">
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                      Business Location on Map *
                    </FormLabel>
                    <FormControl>
                      <MapComponent
                        latitude={form.getValues("businessLocation")?.latitude}
                        longitude={form.getValues("businessLocation")?.longitude}
                        onChange={handleBusinessMapLocationChange}
                      />
                    </FormControl>
                    <FormDescription>
                      You can click on the map to set your exact business location or use the "Detect my location" button
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                </div>
              </>
            )}
          </div>
          
          <FormValidationSummary
            errors={formState.errors}
            success={validationSuccess && formState.isValid}
            successMessage="Your location information is complete and valid."
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

export default ConsolidatedLocationForm;
