/* eslint-disable no-unused-vars */
import { cn } from "@/lib/utils";
import { ConnectionHandles } from "./connection-handles";

interface FittingNodeProps {
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

export const FittingNode = ({
  isSelected,
  nodeId,
  onStartConnect,
  onEndConnect,
}: FittingNodeProps) => {
  return (
    <div className="relative w-16 h-16">
      <div
        className={cn(
          "flex items-center justify-center w-16 h-16 font-bold text-black bg-blue-600 rounded-md",
          isSelected && "ring-2 ring-blue-500",
        )}>
        <div className="w-8 h-8 border-4 border-white rounded-full" />
      </div>
      <ConnectionHandles
        nodeId={nodeId}
        onStartConnect={onStartConnect}
        onEndConnect={onEndConnect}
      />
    </div>
  );
};
