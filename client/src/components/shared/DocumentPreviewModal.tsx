/**
 * Document Preview Modal Component
 * DO NOT EDIT OR MODIFY WITHOUT EXPLICIT PERMISSION
 * 
 * This component provides a modal preview for uploaded documents
 * with support for common file types (.pdf, .jpg, .png, etc)
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Download, X, AlertCircle, FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentPreviewModalProps {
  documentId: string;
  documentName: string;
  documentType: string;
  documentUrl: string;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const SUPPORTED_PDF_TYPE = 'application/pdf';

const DocumentPreviewModal = ({
  documentId,
  documentName,
  documentType,
  documentUrl,
  trigger,
  onClose
}: DocumentPreviewModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isImage = SUPPORTED_IMAGE_TYPES.includes(documentType);
  const isPdf = documentType === SUPPORTED_PDF_TYPE;
  const isPreviewable = isImage || isPdf;
  
  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };
  
  const handleDownload = () => {
    window.open(documentUrl, '_blank');
  };
  
  const handleImageLoad = () => {
    setLoading(false);
  };
  
  const handleImageError = () => {
    setLoading(false);
    setError('Failed to load the document preview. Please try downloading the document instead.');
  };
  
  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
    }
  }, [open]);
  
  // Determine file extension from either the documentType or documentName
  const getFileExtension = () => {
    if (documentName?.includes('.')) {
      return documentName.split('.').pop()?.toUpperCase();
    }
    
    const typeToExt: Record<string, string> = {
      'image/jpeg': 'JPG',
      'image/png': 'PNG',
      'image/gif': 'GIF',
      'image/webp': 'WEBP',
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'text/plain': 'TXT'
    };
    
    return typeToExt[documentType] || 'FILE';
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg flex items-center gap-2">
              <FileIcon className="h-5 w-5 text-primary" />
              <span className="truncate max-w-[500px]">{documentName}</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {getFileExtension()}
              </span>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <DialogDescription>
            Document ID: {documentId}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto my-4 bg-slate-50 rounded-md p-1 min-h-[300px] border">
          {loading && (
            <div className="flex justify-center items-center h-full">
              <Skeleton className="w-full h-[300px]" />
            </div>
          )}
          
          {error && (
            <div className="flex flex-col justify-center items-center h-full text-center p-4">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-600 mb-2">{error}</p>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Instead
              </Button>
            </div>
          )}
          
          {isPreviewable ? (
            <>
              {isImage && (
                <div className={cn("flex justify-center items-center h-full", loading ? 'hidden' : '')}>
                  <img 
                    src={documentUrl} 
                    alt={documentName}
                    className="max-w-full max-h-[60vh] object-contain"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </div>
              )}
              
              {isPdf && (
                <div className={cn("w-full h-full min-h-[400px]", loading ? 'hidden' : '')}>
                  <iframe 
                    src={`${documentUrl}#toolbar=0&view=FitH`}
                    title={documentName}
                    className="w-full h-full min-h-[400px] border-0"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-center p-4">
              <FileIcon className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Preview is not available for this file type.</p>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <div className="flex justify-between w-full">
            <div className="text-sm text-muted-foreground">
              File type: {documentType || 'Unknown'}
            </div>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewModal;