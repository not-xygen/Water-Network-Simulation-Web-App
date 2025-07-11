/* eslint-disable no-unused-vars */
import { cn } from "@/lib/utils";
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
  rotation: number;
}

export const ReservoirNode = ({
  isSelected,
  nodeId,
  onStartConnect,
  onEndConnect,
  rotation,
}: ReservoirNodeProps) => {
  return (
    <div className="relative w-16 h-16">
      <div
        className={cn(
          "flex items-center justify-center w-16 h-16 font-bold text-black bg-blue-500 rounded-full",
          isSelected && "ring-2 ring-blue-500",
        )}>
        <img
          src="/assets/reservoir.svg"
          alt="Reservoir"
          className="w-8 h-8 pointer-events-none select-none"
          draggable={false}
          style={{ transform: `rotate(-${rotation}deg)` }}
        />
      </div>
      <ConnectionHandles
        nodeId={nodeId}
        onStartConnect={onStartConnect}
        onEndConnect={onEndConnect}
        positions={["bottom"]}
      />
    </div>
  );
};
