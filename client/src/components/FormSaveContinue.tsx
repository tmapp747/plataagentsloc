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
    // Get the SVG element
    const svgElement = document.getElementById('qr-canvas');
    if (!svgElement) return;
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 240; // Doubled size for better quality
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Create a new Image element
    const img = new Image();
    
    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    // When the image loads, draw it on the canvas and download
    img.onload = () => {
      // Draw the image on the canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      const pngUrl = canvas.toDataURL('image/png');
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'platapay-application-qr.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up
      URL.revokeObjectURL(url);
    };
    
    // Set the image source to the SVG blob URL
    img.src = url;
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
