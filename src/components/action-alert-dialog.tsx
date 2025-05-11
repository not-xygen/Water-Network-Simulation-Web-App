import type * as React from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

interface ActionAlertDialogProps {
	trigger: React.ReactNode;
	title: string;
	description: string;
	cancelText?: string;
	actionText: string;
	onAction: () => void;
	variant?: "default" | "destructive";
	className?: string;
}

export const ActionAlertDialog = ({
	trigger,
	title,
	description,
	cancelText = "Batal",
	actionText,
	onAction,
	variant = "default",
	className,
}: ActionAlertDialogProps) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				{typeof trigger === "string" ? (
					<Button variant={variant} className={className}>
						{trigger}
					</Button>
				) : (
					trigger
				)}
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{cancelText}</AlertDialogCancel>
					<AlertDialogAction onClick={onAction}>{actionText}</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
