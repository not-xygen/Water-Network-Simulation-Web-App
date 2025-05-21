/* eslint-disable no-unused-vars */
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import { ConnectionHandles } from "./connection-handles";

interface PumpNodeProps {
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

export const PumpNode = ({
  isSelected,
  onStartConnect,
  onEndConnect,
}: PumpNodeProps) => {
  return (
    <div className="relative w-16 h-16">
      <div
        className={cn(
          "flex items-center justify-center w-16 h-16 font-bold text-black bg-yellow-400 rounded-full",
          isSelected && "ring-2 ring-blue-500",
        )}>
        <Zap />
      </div>
      <ConnectionHandles
        onStartConnect={onStartConnect}
        onEndConnect={onEndConnect}
      />
    </div>
  );
};
