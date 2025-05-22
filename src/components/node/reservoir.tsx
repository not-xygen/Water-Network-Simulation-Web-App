/* eslint-disable no-unused-vars */
import { cn } from "@/lib/utils";
import { Droplet } from "lucide-react";
import { ConnectionHandles } from "./connection-handles";

interface ReservoirNodeProps {
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

export const ReservoirNode = ({
  isSelected,
  nodeId,
  onStartConnect,
  onEndConnect,
}: ReservoirNodeProps) => {
  return (
    <div className="relative w-16 h-16">
      <div
        className={cn(
          "flex items-center justify-center w-16 h-16 font-bold text-black bg-blue-500 rounded-full",
          isSelected && "ring-2 ring-blue-500",
        )}>
        <Droplet />
      </div>
      <ConnectionHandles
        nodeId={nodeId}
        onStartConnect={onStartConnect}
        onEndConnect={onEndConnect}
      />
    </div>
  );
};
