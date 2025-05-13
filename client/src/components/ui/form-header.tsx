import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

/**
 * Themed form header component with PlataPay's brand styling
 */
export function FormHeader({ title, subtitle, icon, className }: FormHeaderProps) {
  return (
    <div className={cn(
      "mb-6 border-b pb-4 bg-gradient-to-r from-primary/10 to-transparent rounded-t-md -mx-6 -mt-6 px-6 pt-6",
      className
    )}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold text-primary">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}