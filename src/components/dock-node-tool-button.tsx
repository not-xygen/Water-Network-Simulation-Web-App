import React from "react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type DockNodeToolButtonProps = {
  color: string;
  icon: React.ReactNode;
  name: string;
  onClick: () => void;
};

export const DockNodeToolButton = React.memo(function DockNodeToolButton({
  color,
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
          className={`w-10 h-10 ${color}`}
          onClick={onClick}>
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent align="center">{name}</TooltipContent>
    </Tooltip>
  );
});
