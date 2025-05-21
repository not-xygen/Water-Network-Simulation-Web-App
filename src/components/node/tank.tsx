/* eslint-disable no-unused-vars */
import { cn } from "@/lib/utils";
import { Box } from "lucide-react";
import { ConnectionHandles } from "./connection-handles";

interface TankNodeProps {
  isSelected: boolean;
  onStartConnect: (
    e: React.MouseEvent,
    position: "left" | "right" | "top" | "bottom",
  ) => void;
  onEndConnect: (
    e: React.MouseEvent,
    position: "left" | "right" | "top" | "bottom",
  ) => void;
}

export const TankNode = ({
  isSelected,
  onStartConnect,
  onEndConnect,
}: TankNodeProps) => {
  return (
    <div className="relative w-16 h-16">
      <div
        className={cn(
          "flex items-center justify-center w-16 h-16 font-bold text-black bg-orange-500 rounded-md",
          isSelected && "ring-2 ring-blue-500",
        )}>
        <Box />
      </div>
      <ConnectionHandles
        onStartConnect={onStartConnect}
        onEndConnect={onEndConnect}
      />
    </div>
  );
};
