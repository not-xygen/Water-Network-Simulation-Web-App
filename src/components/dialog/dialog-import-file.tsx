/* eslint-disable no-unused-vars */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { UploadCloudIcon } from "lucide-react";
import {
  type ChangeEvent,
  type DragEvent,
  type RefObject,
  useRef,
  useState,
} from "react";

interface FileImportDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  onImport?: (files: File[]) => void;
}

interface FileDropZoneProps {
  isDragging: boolean;
  onDragEnter: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
  maxFiles: number;
  maxFileSize: number;
  fileInputRef: RefObject<HTMLInputElement>;
  allowedFileTypes: string[];
  onFileInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const FileDropZone = ({
  isDragging,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onClick,
  maxFiles,
  maxFileSize,
  fileInputRef,
  allowedFileTypes,
  onFileInputChange,
}: FileDropZoneProps) => (
  <div
    className={`mt-4 flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
      isDragging ? "border-primary bg-primary/10" : "border-border"
    }`}
    onDragEnter={onDragEnter}
    onDragLeave={onDragLeave}
    onDragOver={onDragOver}
    onDrop={onDrop}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        onClick();
      }
    }}>
    <input
      type="file"
      ref={fileInputRef}
      className="hidden"
      multiple
      onChange={onFileInputChange}
      accept={allowedFileTypes.join(",")}
    />
    <UploadCloudIcon className="w-12 h-12 mb-4 text-muted-foreground" />
    <p className="mb-2 text-sm font-medium">
      <span className="font-semibold text-primary">Click to upload</span> or
      drag and drop
    </p>
    <p className="text-xs text-muted-foreground">
      Max {maxFiles} files, up to {maxFileSize}MB each
    </p>
  </div>
);

interface FileListProps {
  files: File[];
  onRemoveFile: (index: number) => void;
  formatFileSize: (bytes: number) => string;
}

const FileList = ({ files, onRemoveFile, formatFileSize }: FileListProps) => (
  <div className="mt-4 space-y-2">
    {files.map((file, index) => (
      <div
        key={`${file.name}-${index}`}
        className="flex items-center justify-between p-2 border rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{file.name}</span>
          <span className="text-xs text-muted-foreground">
            ({formatFileSize(file.size)})
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemoveFile(index)}
          className="w-8 h-8 p-0">
          <span className="sr-only">Remove file</span>
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: <intended> */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
            aria-label="Remove file">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </Button>
      </div>
    ))}
  </div>
);

export function DialogImportFile({
  open,
  onOpenChange,
  allowedFileTypes = [".csv", ".xlsx", ".xls", ".json"],
  maxFileSize = 10, // 10MB
  maxFiles = 5,
  onImport,
}: FileImportDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file: File) => {
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (
      !allowedFileTypes.includes(fileExtension) &&
      !allowedFileTypes.includes("*")
    ) {
      toast({
        title: "File type not supported",
        description: `File ${
          file.name
        } is not a supported file type. Allowed types: ${allowedFileTypes.join(
          ", ",
        )}`,
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File ${file.name} exceeds the maximum file size of ${maxFileSize}MB`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);

    if (files.length + droppedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload a maximum of ${maxFiles} files at once`,
        variant: "destructive",
      });
      return;
    }

    const validFiles = droppedFiles.filter(validateFile);
    setFiles((prevFiles) => [...prevFiles, ...validFiles]);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const selectedFiles = Array.from(e.target.files);

    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload a maximum of ${maxFiles} files at once`,
        variant: "destructive",
      });
      return;
    }

    const validFiles = selectedFiles.filter(validateFile);
    setFiles((prevFiles) => [...prevFiles, ...validFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleImport = () => {
    if (!files.length) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to import",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setUploadProgress(0);

        if (onImport) {
          onImport(files);
        }

        toast({
          title: "Files imported successfully",
          description: `${files.length} file${
            files.length > 1 ? "s" : ""
          } imported successfully`,
        });

        setFiles([]);
        onOpenChange?.(false);
      }
    }, 100);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Files</DialogTitle>
          <DialogDescription>
            Drag and drop files here or click to browse. Supported file types:{" "}
            {allowedFileTypes.join(", ")}
          </DialogDescription>
        </DialogHeader>
        {files.length === 0 && (
          <FileDropZone
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            maxFiles={maxFiles}
            maxFileSize={maxFileSize}
            fileInputRef={fileInputRef}
            allowedFileTypes={allowedFileTypes}
            onFileInputChange={handleFileInputChange}
          />
        )}
        {files.length > 0 && (
          <>
            <FileList
              files={files}
              onRemoveFile={removeFile}
              formatFileSize={formatFileSize}
            />
            <div className="flex justify-end mt-4 space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFiles([]);
                  onOpenChange?.(false);
                }}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={isUploading}>
                {isUploading ? (
                  <>
                    {/* biome-ignore lint/a11y/noSvgWithoutTitle: <intended> */}
                    <svg
                      className="w-4 h-4 mr-2 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-label="Loading spinner">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Importing... {uploadProgress}%
                  </>
                ) : (
                  "Import"
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
