/* eslint-disable no-unused-vars */
import { cn } from "@/lib/utils";
import { ToggleRight } from "lucide-react";
import { ConnectionHandles } from "./connection-handles";

interface ValveNodeProps {
  isSelected: boolean;
  nodeId: string;
  onStartConnect: (
    e: React.MouseEvent,
    position: "left" | "right" | "top" | "bottom",
  ) => void;
  onEndConnect: (
    e: React.MouseEvent,
    position: "left" | "right" | "top" | "bottom",
  ) => void;
}

export const ValveNode = ({
  isSelected,
  nodeId,
  onStartConnect,
  onEndConnect,
}: ValveNodeProps) => {
  return (
    <div className="relative w-16 h-16">
      <div
        className={cn(
          "flex items-center justify-center w-16 h-16 font-bold text-black bg-green-600 rounded-md",
          isSelected && "ring-2 ring-blue-500",
        )}>
        <ToggleRight />
      </div>
      <ConnectionHandles
        nodeId={nodeId}
        onStartConnect={onStartConnect}
        onEndConnect={onEndConnect}
      />
    </div>
  );
};
