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
      
      try {
        // Scan the file
        const decodedText = await tempScanner.scanFile(file, /* verbose */ false);
        
        // Process the QR code content
        await processQRCode(decodedText);
      } catch (error) {
        console.error('QR code scan error:', error);
        setError('Could not detect a valid QR code in the image. Please upload a clearer image or ensure it contains a valid PlataPay QR code.');
      } finally {
        // Clean up scanner
        if (tempScanner) {
          try {
            await tempScanner.clear();
          } catch (clearError) {
            console.error('Error clearing scanner:', clearError);
          }
        }
      }
    } catch (err) {
      console.error('QR scanner setup error:', err);
      setError('Error setting up QR scanner. Please try again with a different image.');
    } finally {
      setIsUploading(false);
      document.body.removeChild(tempScannerDiv);
    }
  };

  const processQRCode = async (qrContent: string) => {
    // Log the QR content for debugging
    console.log('QR Content detected:', qrContent);
    
    // Extract token from QR code
    const token = extractTokenFromUrl(qrContent);
    
    if (!token) {
      setError('Invalid QR code content. Please upload a valid PlataPay application QR code.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Fetch the application data using the token
      console.log('Fetching application with token:', token);
      const response = await fetch(`/api/applications/qr/${token}`);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API error response:', errorData);
        throw new Error(`Could not find application with the provided QR code (${response.status}).`);
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
      console.log('Extracting token from:', url);
      
      // Handle full URLs
      if (url.includes('/resume/')) {
        const parts = url.split('/resume/');
        const token = parts[1]?.split(/[?#]/)[0] || null;
        console.log('Extracted token from URL:', token);
        return token;
      }
      
      // Handle direct tokens (if the QR just contains the token itself)
      if (/^[A-Za-z0-9_-]+$/.test(url)) {
        console.log('Using direct token:', url);
        return url;
      }
      
      // Handle URLs that might have the token in other formats
      const urlObj = new URL(url);
      const tokenParam = urlObj.searchParams.get('token');
      if (tokenParam) {
        console.log('Extracted token from query param:', tokenParam);
        return tokenParam;
      }
      
      console.log('Could not extract token from content');
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