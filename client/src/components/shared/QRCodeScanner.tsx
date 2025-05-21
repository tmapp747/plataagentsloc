import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Camera, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { queryClient } from '@/lib/queryClient';

interface QRCodeScannerProps {
  onClose?: () => void;
}

const QRCodeScanner = ({ onClose }: QRCodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      // Clean up scanner instance on component unmount
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (scanResult) {
      processQRCode(scanResult);
    }
  }, [scanResult]);

  const startScanner = async () => {
    setIsScanning(true);
    setError(null);

    if (!scannerContainerRef.current) return;

    try {
      console.log('Trying to open camera...');
      // Create scanner instance
      scannerRef.current = new Html5Qrcode('scanner');
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      console.log('Initializing QR code scanner...');
      await scannerRef.current.start(
        { facingMode: 'environment' }, 
        config,
        onScanSuccess,
        undefined
      );
    } catch (err) {
      console.log('HTML5QrcodeScanner initialization failed, error = ', err);
      
      let errorMessage = 'Could not access camera. Please check camera permissions or try uploading a QR image instead.';
      
      // Check for specific error types
      if (err && typeof err === 'object') {
        const error = err as any; // Type assertion to avoid TypeScript errors
        if ('name' in error) {
          if (error.name === 'NotAllowedError' || (error.name === 'QrUnsupportedException' && error.message && error.message.includes('Permission denied'))) {
            errorMessage = 'Camera access was denied. Please allow camera access or use the image upload option.';
          } else if (error.name === 'NotFoundError' || (error.name === 'QrUnsupportedException' && error.message && error.message.includes('No camera found'))) {
            errorMessage = 'No camera was detected on your device. Please use the image upload option.';
          }
        }
      }
      
      setError(errorMessage);
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        setIsScanning(false);
      }).catch(err => {
        console.error('Error stopping scanner:', err);
      });
    } else {
      setIsScanning(false);
    }
  };

  const onScanSuccess = (decodedText: string) => {
    if (scannerRef.current) {
      scannerRef.current.stop();
    }
    setIsScanning(false);
    setScanResult(decodedText);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    // Create a temporary scanner ID that definitely doesn't exist yet
    const tempScannerId = `temp-scanner-${Date.now()}`;
    
    // Create a temporary hidden div for the scanner
    const tempScannerDiv = document.createElement('div');
    tempScannerDiv.id = tempScannerId;
    tempScannerDiv.style.display = 'none';
    document.body.appendChild(tempScannerDiv);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) {
        document.body.removeChild(tempScannerDiv);
        return;
      }
      
      try {
        // Create scanner instance for file processing
        const tempScanner = new Html5Qrcode(tempScannerId);
        tempScanner.scanFile(file, true)
          .then(decodedText => {
            setScanResult(decodedText);
            setIsUploading(false);
            document.body.removeChild(tempScannerDiv);
          })
          .catch(err => {
            console.error('QR code scan error:', err);
            setError('Could not detect QR code in the image. Please upload a clearer image.');
            setIsUploading(false);
            document.body.removeChild(tempScannerDiv);
          });
      } catch (err) {
        console.error('QR processing error:', err);
        setError('Error processing the image. Please try a different image.');
        setIsUploading(false);
        document.body.removeChild(tempScannerDiv);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading the file. Please try a different image.');
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const processQRCode = async (qrContent: string) => {
    // Validate that the QR content is a valid resume URL
    // It should contain a valid token
    const token = extractTokenFromUrl(qrContent);
    
    if (!token) {
      setError('Invalid QR code. Please scan a valid PlataPay application QR code.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Fetch the application data using the token
      const response = await fetch(`/api/applications/qr/${token}`);
      
      if (!response.ok) {
        throw new Error('Could not find application with the provided QR code.');
      }
      
      const application = await response.json();
      
      // Clear any existing cache for this application
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${application.applicationId}`] });
      
      toast({
        title: 'Application found!',
        description: 'Redirecting to your application...',
      });
      
      // Navigate to the application form
      navigate(`/application/${application.applicationId}`);
      
      // Close the modal if onClose is provided
      if (onClose) {
        onClose();
      }
      
    } catch (err) {
      console.error('Error processing QR code:', err);
      setError(err instanceof Error ? err.message : 'Error processing QR code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const extractTokenFromUrl = (url: string): string | null => {
    // Try to extract token from URL
    try {
      // Handle full URLs
      if (url.includes('/resume/')) {
        const parts = url.split('/resume/');
        return parts[1]?.split(/[?#]/)[0] || null;
      }
      
      // Handle direct tokens (if the QR just contains the token itself)
      if (/^[A-Za-z0-9_-]+$/.test(url)) {
        return url;
      }
      
      return null;
    } catch (err) {
      console.error('Error extracting token:', err);
      return null;
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Resume Application with QR Code</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-4">
          {error}
        </div>
      )}
      
      {!isScanning && !isLoading && (
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={startScanner} 
              className="flex items-center justify-center"
              disabled={isUploading}
            >
              <Camera className="h-4 w-4 mr-2" />
              Scan QR Code with Camera
            </Button>
            
            <div className="text-center text-gray-500 text-sm">- OR -</div>
            
            <Button 
              variant="outline" 
              onClick={triggerFileInput}
              disabled={isUploading}
              className="flex items-center justify-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload QR Code Image
            </Button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      )}
      
      {isScanning && (
        <div className="space-y-4">
          <div id="scanner" ref={scannerContainerRef} className="w-full h-64 bg-gray-100 rounded-md overflow-hidden"></div>
          <Button variant="outline" onClick={stopScanner} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Cancel Scanning
          </Button>
        </div>
      )}
      
      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Processing QR code...</span>
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner;