import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LegalDocumentModalProps {
  triggerText: string;
  title: string;
  content: string;
  className?: string;
}

const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({
  triggerText,
  title,
  content,
  className,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button 
          type="button" 
          className={`text-primary font-medium hover:underline inline p-0 m-0 bg-transparent ${className}`}
          onClick={(e) => e.preventDefault()}
        >
          {triggerText}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Please review the following document carefully
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-6 max-h-[60vh] rounded-md border p-4">
          <div className="space-y-4">
            {content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-sm">{paragraph}</p>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LegalDocumentModal;