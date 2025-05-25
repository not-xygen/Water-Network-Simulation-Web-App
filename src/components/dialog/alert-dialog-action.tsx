import type * as React from "react";
import {
	AlertDialog,
	AlertDialogAction as AlertDialogActionButton,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

interface AlertDialogActionProps {
	trigger: React.ReactNode;
	title: string;
	description: string;
	cancelText?: string;
	actionText: string;
	onAction: () => void;
	variant?: "default" | "destructive";
	className?: string;
}

export const AlertDialogAction = ({
	trigger,
	title,
	description,
	cancelText = "Cancel",
	actionText,
	onAction,
	variant = "default",
	className,
}: AlertDialogActionProps) => {
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
					<AlertDialogActionButton onClick={onAction}>
						{actionText}
					</AlertDialogActionButton>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
