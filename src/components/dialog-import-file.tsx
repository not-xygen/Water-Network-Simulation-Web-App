/* eslint-disable no-unused-vars */
import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/handlers/use-toast-handler";

interface FileImportDialogProps {
	allowedFileTypes?: string[];
	maxFileSize?: number; // in MB
	maxFiles?: number;
	onImport?: (files: File[]) => void;
	children?: React.ReactNode;
}

export function DialogImportFile({
	allowedFileTypes = [".csv", ".xlsx", ".xls", ".json"],
	maxFileSize = 10, // 10MB
	maxFiles = 5,
	onImport,
	children,
}: FileImportDialogProps) {
	const [open, setOpen] = React.useState(false);
	const [files, setFiles] = React.useState<File[]>([]);
	const [isDragging, setIsDragging] = React.useState(false);
	const [isUploading, setIsUploading] = React.useState(false);
	const [uploadProgress, setUploadProgress] = React.useState(0);
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const validateFile = (file: File) => {
		// Check file type
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

		// Check file size
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

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
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

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

		// Reset the input value so the same file can be selected again
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

		// Simulate upload progress
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
				setOpen(false);
			}
		}, 100);
	};

	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || <Button>Import Files</Button>}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Import Files</DialogTitle>
					<DialogDescription>
						Drag and drop files here or click to browse. Supported file types:{" "}
						{allowedFileTypes.join(", ")}
					</DialogDescription>
				</DialogHeader>
				{files.length === 0 && (
					<div
						className={`mt-4 flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
							isDragging ? "border-primary bg-primary/10" : "border-border"
						}`}
						onDragEnter={handleDragEnter}
						onDragLeave={handleDragLeave}
						onDragOver={handleDragOver}
						onDrop={handleDrop}
						onClick={() => fileInputRef.current?.click()}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								fileInputRef.current?.click();
							}
						}}
					>
						<input
							type="file"
							ref={fileInputRef}
							className="hidden"
							multiple
							onChange={handleFileInputChange}
							accept={allowedFileTypes.join(",")}
						/>
						<UploadCloudIcon className="w-12 h-12 mb-4 text-muted-foreground" />
						<p className="mb-2 text-sm font-medium">
							<span className="font-semibold text-primary">
								Click to upload
							</span>{" "}
							or drag and drop
						</p>
						<p className="text-xs text-muted-foreground">
							Max {maxFiles} files, up to {maxFileSize}MB each
						</p>
					</div>
				)}

				{files.length > 0 && (
					<div className="mt-4 space-y-2">
						<p className="text-sm font-medium">
							Selected Files ({files.length}/{maxFiles})
						</p>
						<div className="max-h-[200px] overflow-y-auto rounded-lg border">
							{files.map((file, index) => (
								<div
									key={`${file.name}-${index}`}
									className="flex items-center justify-between p-3 border-b last:border-b-0"
								>
									<div className="flex items-center space-x-3">
										<FileIcon className="w-5 h-5 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium">{file.name}</p>
											<p className="text-xs text-muted-foreground">
												{formatFileSize(file.size)}
											</p>
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation();
											removeFile(index);
										}}
										aria-label={`Remove ${file.name}`}
									>
										<XIcon className="w-4 h-4" />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}

				{isUploading && (
					<div className="mt-4 space-y-2">
						<div className="flex items-center justify-between">
							<p className="text-sm font-medium">Uploading...</p>
							<p className="text-sm font-medium">{uploadProgress}%</p>
						</div>
						<Progress value={uploadProgress} className="h-2" />
					</div>
				)}

				<DialogFooter className="mt-4">
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isUploading}
					>
						Cancel
					</Button>
					<Button
						onClick={handleImport}
						disabled={files.length === 0 || isUploading}
					>
						{isUploading ? "Importing..." : "Import"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
