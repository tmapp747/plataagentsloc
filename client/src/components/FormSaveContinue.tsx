import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormSaveContinueProps {
  resumeUrl: string;
  onSave: () => void;
}

const FormSaveContinue = ({ resumeUrl, onSave }: FormSaveContinueProps) => {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => {
        setIsSaved(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

  const handleSave = () => {
    onSave();
    setIsSaved(true);
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "platapay-application-qr.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="bg-primary-lighter bg-opacity-10 rounded-lg p-4 mb-8 flex items-start">
      <div className="flex-shrink-0 text-primary">
        <InfoIcon className="h-6 w-6" />
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-primary">Save your progress</h3>
        <p className="mt-1 text-sm text-gray-600">
          Your progress is automatically saved. Use this QR code to continue your application on another device.
          {isSaved && (
            <span className="ml-2 text-green-600 font-medium">
              Progress saved successfully!
            </span>
          )}
        </p>
        <div className="mt-4 flex justify-between items-center">
          <div className="bg-white p-2 rounded-md shadow-sm">
            <QRCodeSVG
              id="qr-canvas"
              value={resumeUrl}
              size={120}
              level="M"
              includeMargin={true}
              bgColor={"#ffffff"}
              fgColor={"#4A2A82"}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={downloadQRCode}>
              <Download className="h-4 w-4 mr-2 text-gray-400" />
              Download QR
            </Button>
            <Button variant="default" size="sm" onClick={handleSave}>
              Save Progress
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormSaveContinue;
