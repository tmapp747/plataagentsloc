import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  ChevronRight, 
  Edit2, 
  FileText, 
  MapPin, 
  User, 
  AlertTriangle, 
  ShieldCheck, 
  Briefcase, 
  Package 
} from "lucide-react";
import FormNavigation from "@/components/FormNavigation";
import FormSaveContinue from "@/components/FormSaveContinue";
import { Application } from "@shared/schema";
import { formatPhoneNumber, formatCurrency, formatDate, getIdTypeDisplay } from "@/lib/utils";
import { businessPackages } from "@/lib/formSchema";

interface FormSummaryProps {
  application?: Application;
  onNext: () => void;
  onPrevious: () => void;
  onSave: () => void;
  onSubmit: () => void;
  applicationId: string;
  isLoading?: boolean;
}

const FormSummary = ({
  application,
  onNext,
  onPrevious,
  onSave,
  onSubmit,
  applicationId,
  isLoading = false,
}: FormSummaryProps) => {
  const resumeUrl = `${window.location.origin}/resume/${application?.resumeToken}`;

  // Fetch documents
  const { data: documents } = useQuery({
    queryKey: [`/api/documents/${application?.id}`],
    enabled: !!application?.id,
  });

  const handleSave = () => {
    onSave();
  };

  const getSelectedPackage = () => {
    if (!application?.packageType) return null;
    return businessPackages.find(pkg => pkg.id === application.packageType);
  };
  
  const selectedPackage = getSelectedPackage();

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Application</h2>
      <p className="text-sm text-gray-500 mb-6">
        Please review your application information before submission. You can make changes by going back to the relevant sections.
      </p>

      <FormSaveContinue resumeUrl={resumeUrl} onSave={handleSave} />

      <div className="space-y-6">
        <Accordion type="single" collapsible defaultValue="personal" className="w-full">
          <AccordionItem value="personal">
            <AccordionTrigger className="bg-gray-50 px-4 rounded-t-md">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-primary" />
                <span>Personal Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-white border border-t-0 rounded-b-md p-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {application?.firstName} {application?.middleName} {application?.lastName}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(application?.dateOfBirth)}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{application?.gender}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Nationality</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{application?.nationality}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application?.email}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">+63 {formatPhoneNumber(application?.phoneNumber)}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Civil Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{application?.civilStatus}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">ID Information</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {getIdTypeDisplay(application?.idType)}: {application?.idNumber}
                  </dd>
                </div>
              </dl>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => onPrevious()}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="background">
            <AccordionTrigger className="bg-gray-50 px-4 mt-2 rounded-t-md">
              <div className="flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
                <span>Background Check</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-white border border-t-0 rounded-b-md p-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">First time applying?</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{application?.firstTimeApplying}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Ever charged with a crime?</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{application?.everCharged}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Declared bankruptcy?</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{application?.declaredBankruptcy}</dd>
                </div>
                {application?.declaredBankruptcy === "yes" && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Bankruptcy Details</dt>
                    <dd className="mt-1 text-sm text-gray-900">{application?.bankruptcyDetails}</dd>
                  </div>
                )}
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Primary Income Source</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{application?.incomeSource?.replace('_', ' ')}</dd>
                </div>
              </dl>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => onPrevious()}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="business">
            <AccordionTrigger className="bg-gray-50 px-4 mt-2 rounded-t-md">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-primary" />
                <span>Business Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-white border border-t-0 rounded-b-md p-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                {application?.businessName && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Business Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{application?.businessName}</dd>
                  </div>
                )}
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Business Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {application?.businessType?.replace(/_/g, ' ')}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Nature of Business</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{application?.businessNature}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Years in Operation</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {application?.yearsOperating?.replace(/_/g, ' ')}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Daily Transactions</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {application?.dailyTransactions?.replace(/_/g, ' ')}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Existing Business</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application?.hasExistingBusiness ? "Yes" : "No"}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">First Time Business</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application?.isFirstTimeBusiness ? "Yes" : "No"}</dd>
                </div>
              </dl>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => onPrevious()}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="location">
            <AccordionTrigger className="bg-gray-50 px-4 mt-2 rounded-t-md">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                <span>Location Details</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-white border border-t-0 rounded-b-md p-4">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Home Address</h4>
                  {application?.address && (
                    <div className="text-sm text-gray-900">
                      <div>{application.address.streetAddress}</div>
                      <div>
                        {application.address.barangay}, {application.address.city}, {application.address.province}
                      </div>
                      {application.address.landmark && (
                        <div className="text-gray-500 mt-1">
                          Landmark: {application.address.landmark}
                        </div>
                      )}
                      {application.address.latitude && application.address.longitude && (
                        <div className="text-xs text-gray-500 mt-1">
                          Coordinates: {application.address.latitude.toFixed(6)}, {application.address.longitude.toFixed(6)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Business Location</h4>
                  {application?.businessLocationSameAsAddress ? (
                    <p className="text-sm text-gray-500 italic">Same as home address</p>
                  ) : application?.businessLocation && (
                    <div className="text-sm text-gray-900">
                      <div>{application.businessLocation.streetAddress}</div>
                      <div>
                        {application.businessLocation.barangay}, {application.businessLocation.city}, {application.businessLocation.province}
                      </div>
                      {application.businessLocation.landmark && (
                        <div className="text-gray-500 mt-1">
                          Landmark: {application.businessLocation.landmark}
                        </div>
                      )}
                      {application.businessLocation.latitude && application.businessLocation.longitude && (
                        <div className="text-xs text-gray-500 mt-1">
                          Coordinates: {application.businessLocation.latitude.toFixed(6)}, {application.businessLocation.longitude.toFixed(6)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => onPrevious()}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="package">
            <AccordionTrigger className="bg-gray-50 px-4 mt-2 rounded-t-md">
              <div className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                <span>Selected Package</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-white border border-t-0 rounded-b-md p-4">
              {selectedPackage ? (
                <div className="bg-white p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{selectedPackage.name} Package</h3>
                    <Badge className="bg-primary">{formatCurrency(Number(application?.monthlyFee))}/month</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{selectedPackage.description}</p>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Setup fee: {formatCurrency(Number(application?.setupFee))}</p>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Features</h4>
                    <ul className="space-y-2">
                      {selectedPackage.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No package selected</p>
              )}
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => onPrevious()}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="documents">
            <AccordionTrigger className="bg-gray-50 px-4 mt-2 rounded-t-md">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                <span>Documents</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-white border border-t-0 rounded-b-md p-4">
              {documents && documents.length > 0 ? (
                <ul className="space-y-2">
                  {documents.map((doc: any) => (
                    <li key={doc.id} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="capitalize">{doc.documentType.replace(/_/g, ' ')}: </span>
                      <span className="ml-1 text-gray-500">{doc.filename}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No documents uploaded</p>
              )}
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => onPrevious()}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center text-amber-800">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Confirm & Submit
            </CardTitle>
            <CardDescription className="text-amber-700">
              Please ensure all information is accurate and complete before submitting.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-amber-800">
            <p>
              Once submitted, your application will be reviewed by our team. You'll receive an email notification
              regarding the status of your application.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-8">
          <Button 
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isLoading}
          >
            Go Back
          </Button>
          <Button 
            type="button"
            onClick={onSubmit}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            Submit Application
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormSummary;
