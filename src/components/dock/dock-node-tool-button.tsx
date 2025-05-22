import React from "react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type DockNodeToolButtonProps = {
	icon: React.ReactNode;
	name: string;
	onClick: () => void;
};

export const DockNodeToolButton = React.memo(function DockNodeToolButton({
	icon,
	name,
	onClick,
}: DockNodeToolButtonProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={"w-10 h-10"}
					onClick={onClick}
				>
					{icon}
				</Button>
			</TooltipTrigger>
			<TooltipContent align="center">{name}</TooltipContent>
		</Tooltip>
	);
});
