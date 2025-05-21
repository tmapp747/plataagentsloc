import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, InfoIcon, Copy, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FormSaveContinueProps {
  resumeUrl: string;
  onSave: () => void;
}

const FormSaveContinue = ({ resumeUrl, onSave }: FormSaveContinueProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => {
        setIsSaved(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  useEffect(() => {
    if (emailSent) {
      const timer = setTimeout(() => {
        setEmailSent(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [emailSent]);

  const handleSave = () => {
    onSave();
    setIsSaved(true);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(resumeUrl)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "Link copied!",
          description: "The application resume link has been copied to your clipboard.",
        });
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
        toast({
          title: "Failed to copy",
          description: "Could not copy the link to your clipboard. Please try again.",
          variant: "destructive",
        });
      });
  };

  const sendEmailWithQRCode = async () => {
    if (!emailAddress) return;
    
    setIsSendingEmail(true);
    
    try {
      // Generate the QR code image
      const svgElement = document.getElementById('qr-canvas');
      if (!svgElement) {
        throw new Error("QR code not found");
      }
      
      // Convert SVG to data URL for email
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      // Create a canvas to convert SVG to PNG
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not create canvas context");
      
      // Draw the SVG on the canvas
      const img = new Image();
      img.src = url;
      
      // Wait for the image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Draw the image on the canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      // Send the email with QR code
      const response = await fetch('/api/send-qr-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailAddress,
          qrCodeImage: dataUrl,
          resumeUrl
        })
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailAddress,
          qrCodeImage: dataUrl,
          resumeUrl: resumeUrl
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send email");
      }
      
      setEmailSent(true);
      setShowEmailInput(false);
      toast({
        title: "Email sent!",
        description: "We've sent an email with the QR code to continue your application.",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Email not sent",
        description: "An error occurred while sending the email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
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
      
      // Convert canvas to data URL with high quality PNG
      const pngUrl = canvas.toDataURL('image/png', 1.0);
      
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
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2 text-gray-400" />
              {isCopied ? "Copied!" : "Copy Link"}
            </Button>
            {!showEmailInput ? (
              <Button variant="outline" size="sm" onClick={() => setShowEmailInput(true)}>
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                Email QR Code
              </Button>
            ) : (
              <div className="mt-2 space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full p-2 pr-20 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button 
                    size="sm" 
                    className="absolute right-0.5 top-0.5 h-[calc(100%-4px)]"
                    onClick={sendEmailWithQRCode}
                    disabled={isSendingEmail || !emailAddress}
                  >
                    {isSendingEmail ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    ) : (
                      "Send"
                    )}
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs" 
                  onClick={() => setShowEmailInput(false)}
                >
                  Cancel
                </Button>
                {emailSent && (
                  <p className="text-xs text-green-600">Email sent successfully!</p>
                )}
              </div>
            )}
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
