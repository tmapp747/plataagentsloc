import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { useState } from "react";
import QRCodeUploader from "./QRCodeUploader";

interface QRScannerModalProps {
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg";
  buttonClassName?: string;
}

const QRScannerModal = ({
  buttonText = "Continue with QR Code",
  buttonVariant = "default",
  buttonSize = "default",
  buttonClassName = "",
}: QRScannerModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={buttonVariant as any}
          size={buttonSize as any}
          className={buttonClassName}
        >
          <QrCode className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resume Your Application</DialogTitle>
          <DialogDescription>
            Upload the QR code from your saved application to continue where you left off.
          </DialogDescription>
        </DialogHeader>
        <QRCodeUploader />
      </DialogContent>
    </Dialog>
  );
};

export default QRScannerModal;