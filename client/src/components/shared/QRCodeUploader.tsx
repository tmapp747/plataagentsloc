import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { queryClient } from '@/lib/queryClient';

const QRCodeUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    // Create a temporary scanner ID
    const tempScannerId = `temp-scanner-${Date.now()}`;
    
    // Create a temporary div for the scanner
    const tempScannerDiv = document.createElement('div');
    tempScannerDiv.id = tempScannerId;
    tempScannerDiv.style.display = 'none';
    document.body.appendChild(tempScannerDiv);

    try {
      // Create scanner instance
      const tempScanner = new Html5Qrcode(tempScannerId);
      
      // Scan the file
      const decodedText = await tempScanner.scanFile(file, true);
      
      // Process the QR code content
      await processQRCode(decodedText);
    } catch (err) {
      console.error('QR code scan error:', err);
      setError('Could not detect a valid QR code in the image. Please upload a different image.');
    } finally {
      setIsUploading(false);
      document.body.removeChild(tempScannerDiv);
    }
  };

  const processQRCode = async (qrContent: string) => {
    // Extract token from QR code
    const token = extractTokenFromUrl(qrContent);
    
    if (!token) {
      setError('Invalid QR code. Please upload a valid PlataPay application QR code.');
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

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-4">
          {error}
        </div>
      )}
      
      <div className="flex justify-center">
        <input
          type="file"
          id="qr-file-input"
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
        <Button 
          variant="outline" 
          onClick={() => document.getElementById('qr-file-input')?.click()}
          disabled={isUploading || isLoading}
          className="flex items-center"
        >
          {isUploading || isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {isUploading ? 'Processing...' : 'Upload QR Code Image'}
        </Button>
      </div>
      
      <p className="text-center text-sm text-gray-500">
        Upload the QR code image you downloaded to resume your application
      </p>
    </div>
  );
};

export default QRCodeUploader;