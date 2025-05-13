import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormNavigationProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isSubmitting?: boolean;
  disableNext?: boolean;
}

const FormNavigation = ({ 
  onPrevious, 
  onNext, 
  onSubmit, 
  isFirstStep = false, 
  isLastStep = false,
  isSubmitting = false,
  disableNext = false
}: FormNavigationProps) => {
  return (
    <div className="flex justify-between mt-8">
      {!isFirstStep ? (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
          disabled={isSubmitting}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
      ) : (
        <div></div> // Empty div to maintain spacing
      )}

      {!isLastStep ? (
        <Button 
          type="submit" 
          disabled={isSubmitting || disableNext}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <Button 
          type="button" 
          onClick={onSubmit}
          disabled={isSubmitting || disableNext}
          className="bg-green-600 hover:bg-green-700"
        >
          Submit Application
        </Button>
      )}
    </div>
  );
};

export default FormNavigation;
