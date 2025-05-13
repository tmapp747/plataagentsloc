import { useState, useRef } from "react";
import { Upload, Trash2, File, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface FileUploadProps {
  applicationId: string;
  documentType: string;
  label: string;
  accept?: string;
  required?: boolean;
  maxSize?: number; // in MB
  onUploadComplete?: (documentId: number) => void;
}

const FileUpload = ({
  applicationId,
  documentType,
  label,
  accept = ".pdf,.jpg,.jpeg,.png",
  required = false,
  maxSize = 5, // 5MB default
  onUploadComplete,
}: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedDocument, setUploadedDocument] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size
      if (selectedFile.size > maxSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `Maximum file size is ${maxSize}MB`,
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      
      // Create preview for image files
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreview(event.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        // For non-image files, clear the preview
        setPreview(null);
      }
    }
  };

  const uploadFile = async () => {
    if (!file || !applicationId) return;
    
    setIsUploading(true);
    setProgress(0);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("applicationId", applicationId);
      formData.append("documentType", documentType);
      
      // Upload using XMLHttpRequest to track progress
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      });
      
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          setUploadedDocument(response);
          if (onUploadComplete) {
            onUploadComplete(response.id);
          }
          
          // Invalidate documents query
          queryClient.invalidateQueries({ queryKey: [`/api/documents/${applicationId}`] });
          
          toast({
            title: "Upload successful",
            description: "Your document has been uploaded successfully.",
          });
        } else {
          throw new Error(`HTTP Error: ${xhr.status}`);
        }
        setIsUploading(false);
      };
      
      xhr.onerror = function () {
        toast({
          title: "Upload failed",
          description: "An error occurred while uploading your document.",
          variant: "destructive",
        });
        setIsUploading(false);
      };
      
      xhr.open("POST", "/api/documents");
      xhr.send(formData);
      
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading your document.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setUploadedDocument(null);
    // Reset the input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {uploadedDocument && (
          <span className="text-xs text-green-600 flex items-center">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Uploaded successfully
          </span>
        )}
      </div>
      
      {/* Hidden file input */}
      <input
        type="file"
        id={`file-${documentType}`}
        accept={accept}
        onChange={handleFileChange}
        className="sr-only"
        ref={fileInputRef}
        required={required && !uploadedDocument}
      />
      
      {/* Preview area */}
      {(preview || file || uploadedDocument) ? (
        <div className="mt-2 p-4 border rounded-md bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {preview ? (
                <img src={preview} alt="Preview" className="w-12 h-12 object-cover rounded-md" />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                  <FileText className="h-6 w-6 text-gray-500" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{file?.name || uploadedDocument?.filename}</p>
                <p className="text-xs text-gray-500">
                  {file?.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : uploadedDocument?.fileSize ? `${(uploadedDocument.fileSize / 1024 / 1024).toFixed(2)} MB` : ""}
                </p>
              </div>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFile}
              disabled={isUploading}
            >
              <Trash2 className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
          
          {/* Progress bar during upload */}
          {isUploading && (
            <div className="mt-3">
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">{progress}%</p>
            </div>
          )}
          
          {/* Upload button */}
          {file && !uploadedDocument && (
            <div className="mt-3">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={uploadFile}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-1 text-center">
            <div className="flex text-gray-400 justify-center">
              <Upload className="h-10 w-10" />
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-xs">
                {accept.split(",").join(", ")} up to {maxSize}MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
