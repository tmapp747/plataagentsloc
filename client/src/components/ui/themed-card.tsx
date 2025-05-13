import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface ThemedCardProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'outline' | 'gradient';
}

/**
 * PlataPay branded themed card component
 */
export function ThemedCard({ 
  children, 
  header, 
  footer, 
  className,
  variant = 'default'
}: ThemedCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden border border-primary/20",
        variant === 'gradient' && "bg-gradient-to-b from-primary/5 to-transparent",
        variant === 'subtle' && "bg-muted/50",
        className
      )}
    >
      {header && (
        <CardHeader className={cn(
          "pb-3",
          variant === 'default' && "bg-primary/10 border-b border-primary/20",
          variant === 'gradient' && "bg-gradient-to-r from-primary/20 to-primary/5 border-b border-primary/20",
        )}>
          {header}
        </CardHeader>
      )}
      <CardContent className={cn("p-6", !header && "pt-6")}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className={cn(
          "border-t border-border px-6 py-4",
          variant === 'default' && "bg-muted/50",
          variant === 'gradient' && "bg-gradient-to-r from-muted/70 to-muted/30",
        )}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}