/* eslint-disable no-unused-vars */
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
import { toast } from "@/hooks/use-toast";
import { useUser } from "@clerk/clerk-react";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Progress } from "./ui/progress";

interface DialogProfileImageProps {
	children: React.ReactNode;
}

interface ImageDropZoneProps {
	isDragging: boolean;
	previewImage: string | null;
	onDragEnter: (e: React.DragEvent) => void;
	onDragLeave: (e: React.DragEvent) => void;
	onDragOver: (e: React.DragEvent) => void;
	onDrop: (e: React.DragEvent) => void;
	onClick: () => void;
	fileInputRef: React.RefObject<HTMLInputElement>;
	onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageDropZone = ({
	isDragging,
	previewImage,
	onDragEnter,
	onDragLeave,
	onDragOver,
	onDrop,
	onClick,
	fileInputRef,
	onFileInputChange,
}: ImageDropZoneProps) => (
	<div
		className={`w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
      ${isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"}`}
		onDragEnter={onDragEnter}
		onDragLeave={onDragLeave}
		onDragOver={onDragOver}
		onDrop={onDrop}
		onClick={onClick}
		onKeyDown={(e) => {
			if (e.key === "Enter" || e.key === " ") {
				onClick();
			}
		}}
	>
		<input
			type="file"
			ref={fileInputRef}
			className="hidden"
			accept="image/*"
			onChange={onFileInputChange}
		/>
		{previewImage ? (
			<div className="flex flex-col items-center gap-4">
				<img
					src={previewImage}
					alt="Preview"
					className="object-cover w-32 h-32 rounded-full"
				/>
				<p className="text-sm text-muted-foreground">
					Click or drag a new photo to replace
				</p>
			</div>
		) : (
			<div className="flex flex-col items-center gap-2">
				<Upload className="w-8 h-8 text-gray-400" />
				<p className="text-sm font-medium">
					{isDragging ? "Drop photo here" : "Click or drag photo here"}
				</p>
				<p className="text-xs text-muted-foreground">Maximum file size 5MB</p>
			</div>
		)}
	</div>
);

interface DialogFooterProps {
	isLoading: boolean;
	progress: number;
	hasExistingImage: boolean;
	hasSelectedFile: boolean;
	onDelete: () => void;
	onSave: () => void;
}

const DialogFooterContent = ({
	isLoading,
	progress,
	hasExistingImage,
	hasSelectedFile,
	onDelete,
	onSave,
}: DialogFooterProps) => {
	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center w-full gap-2">
				<Progress value={progress} className="w-full" />
				<p className="text-sm text-muted-foreground">Processing...</p>
			</div>
		);
	}

	return (
		<>
			<Button
				variant="destructive"
				onClick={onDelete}
				disabled={!hasExistingImage}
			>
				Delete Photo
			</Button>
			<Button onClick={onSave} disabled={!hasSelectedFile}>
				Save Changes
			</Button>
		</>
	);
};

export function DialogProfileImage({ children }: DialogProfileImageProps) {
	const { user } = useUser();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [progress, setProgress] = useState(0);

	const simulateProgress = () => {
		let currentProgress = 0;
		const interval = setInterval(() => {
			currentProgress += 5;
			setProgress(currentProgress);

			if (currentProgress >= 100) {
				clearInterval(interval);
			}
		}, 100);
	};

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const files = Array.from(e.dataTransfer.files);
		handleFiles(files);
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		handleFiles(files);
	};

	const handleFiles = (files: File[]) => {
		const file = files[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast({
				title: "Unsupported file format",
				description: "Please select an image file (JPG, PNG, GIF)",
				variant: "destructive",
			});
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			toast({
				title: "File size too large",
				description: "Maximum file size is 5MB",
				variant: "destructive",
			});
			return;
		}

		setSelectedFile(file);
		const preview = URL.createObjectURL(file);
		setPreviewImage(preview);
	};

	const handleSave = async () => {
		if (!selectedFile || !user) return;
		setIsLoading(true);
		simulateProgress();

		try {
			await user.setProfileImage({ file: selectedFile });
			setPreviewImage(null);
			setSelectedFile(null);
			setOpen(false);
			toast({
				title: "Profile photo updated successfully",
				description: "Changes have been saved",
			});
		} catch (err) {
			console.error("Error updating profile image:", err);
			toast({
				title: "Failed to update profile photo",
				description: "An error occurred while saving changes",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
			setProgress(0);
		}
	};

	const handleDelete = async () => {
		if (!user) return;
		setIsLoading(true);
		simulateProgress();

		try {
			await user.setProfileImage({ file: null });
			setPreviewImage(null);
			setSelectedFile(null);
			setOpen(false);
			toast({
				title: "Profile photo deleted successfully",
				description: "Changes have been saved",
			});
		} catch (err) {
			console.error("Error deleting profile image:", err);
			toast({
				title: "Failed to delete profile photo",
				description: "An error occurred while deleting the photo",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
			setProgress(0);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change Profile Photo</DialogTitle>
					<DialogDescription>
						Choose a new photo for your profile. Supported formats: JPG, PNG,
						GIF.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col items-center justify-center gap-4 py-4">
					<ImageDropZone
						isDragging={isDragging}
						previewImage={previewImage}
						onDragEnter={handleDragEnter}
						onDragLeave={handleDragLeave}
						onDragOver={handleDragOver}
						onDrop={handleDrop}
						onClick={() => fileInputRef.current?.click()}
						fileInputRef={fileInputRef}
						onFileInputChange={handleFileInputChange}
					/>
				</div>

				<DialogFooter className="flex justify-between">
					<DialogFooterContent
						isLoading={isLoading}
						progress={progress}
						hasExistingImage={!!user?.imageUrl}
						hasSelectedFile={!!selectedFile}
						onDelete={handleDelete}
						onSave={handleSave}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
