import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = {
  id: number;
  name: string;
  component: React.ComponentType<any>;
};

interface FormProgressProps {
  steps: Step[];
  currentStep: number;
  applicationStatus?: string;
}

const FormProgress = ({ steps, currentStep, applicationStatus }: FormProgressProps) => {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="space-y-4 md:flex md:space-y-0 md:space-x-4 application-form-progress">
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep || applicationStatus === 'submitted';
          const isPending = step.id > currentStep && applicationStatus !== 'submitted';
          
          return (
            <li key={step.id} className={cn(
              "md:flex-1",
              isActive && "active",
              isCompleted && "completed",
              isPending && "pending"
            )}>
              <div className={cn(
                "group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                isActive || isCompleted ? "border-primary" : "border-gray-300"
              )}>
                <span className={cn(
                  "text-sm font-medium",
                  isActive || isCompleted ? "text-primary" : "text-gray-500"
                )}>
                  Step {step.id + 1}
                </span>
                <span className={cn(
                  "text-sm font-medium",
                  isActive || isCompleted ? "text-primary" : "text-gray-500"
                )}>
                  {step.name}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default FormProgress;
