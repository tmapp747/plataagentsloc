/**
 * Document Thumbnail Component
 * DO NOT EDIT OR MODIFY WITHOUT EXPLICIT PERMISSION
 * 
 * This component displays a document thumbnail with preview functionality
 */

import { useState } from 'react';
import { X, FileIcon, FileImage, FileText, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DocumentPreviewModal from './DocumentPreviewModal';
import { Document } from '@shared/schema';

interface DocumentThumbnailProps {
  document: Document;
  onDelete?: (id: number) => void;
  className?: string;
}

const DocumentThumbnail = ({ document, onDelete, className }: DocumentThumbnailProps) => {
  const [isHovering, setIsHovering] = useState(false);
  
  const { id, filename, documentType, fileUrl, mimeType } = document;
  
  // Determine which icon to show based on document type
  const getDocumentIcon = () => {
    if (mimeType?.startsWith('image/') || documentType?.startsWith('image/')) {
      return <FileImage className="h-8 w-8 text-blue-500" />;
    } else if (mimeType === 'application/pdf' || documentType === 'application/pdf') {
      return <File className="h-8 w-8 text-red-500" />;
    } else if (mimeType?.startsWith('text/') || documentType?.startsWith('text/')) {
      return <FileText className="h-8 w-8 text-green-500" />;
    }
    return <FileIcon className="h-8 w-8 text-gray-500" />;
  };
  
  // Format filename to prevent overflow
  const formatFileName = (name: string) => {
    if (!name) return 'Unknown file';
    
    // If filename is already short enough, return as is
    if (name.length <= 18) return name;
    
    // Extract the file extension
    const lastDotIndex = name.lastIndexOf('.');
    let extension = '';
    let baseName = name;
    
    if (lastDotIndex !== -1) {
      extension = name.substring(lastDotIndex);
      baseName = name.substring(0, lastDotIndex);
    }
    
    // Truncate the base name and add the extension back
    return `${baseName.substring(0, 10)}...${extension}`;
  };
  
  const handleDelete = () => {
    if (onDelete && id) {
      onDelete(id);
    }
  };
  
  // Generate thumbnail background based on document type
  const getThumbnailBackground = () => {
    if (documentType?.startsWith('image/') && documentUrl) {
      return {
        backgroundImage: `url(${documentUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    
    return {
      backgroundColor: '#f5f7fa'
    };
  };
  
  return (
    <div 
      className={cn(
        "relative rounded-md overflow-hidden border border-gray-200 group",
        "w-24 h-28 flex flex-col",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Thumbnail area */}
      <div 
        className="flex-1 flex items-center justify-center"
        style={getThumbnailBackground()}
      >
        {(!documentType?.startsWith('image/') || !documentUrl) && getDocumentIcon()}
        
        {/* Preview overlay on hover */}
        <div className={cn(
          "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity",
          isHovering ? "opacity-100" : "opacity-0"
        )}>
          <DocumentPreviewModal
            documentId={document.documentId || String(id)}
            documentName={originalName || 'Document'}
            documentType={documentType || ''}
            documentUrl={documentUrl || ''}
            trigger={
              <Button variant="secondary" size="sm" className="text-xs px-2 py-1 h-7">
                Preview
              </Button>
            }
          />
        </div>
      </div>
      
      {/* Delete button */}
      {onDelete && (
        <button
          onClick={handleDelete}
          className={cn(
            "absolute top-1 right-1 bg-white/80 rounded-full p-0.5",
            "transition-opacity focus:outline-none focus:ring-2 focus:ring-primary",
            isHovering ? "opacity-100" : "opacity-0"
          )}
          aria-label="Delete document"
        >
          <X className="h-3.5 w-3.5 text-gray-500" />
        </button>
      )}
      
      {/* File name footer */}
      <div className="p-1 bg-white text-xs text-center truncate border-t">
        {formatFileName(originalName || 'Unknown file')}
      </div>
    </div>
  );
};

export default DocumentThumbnail;