/* eslint-disable no-unused-vars */
import { cn } from "@/lib/utils";
import { ConnectionHandles } from "./connection-handles";

interface PumpNodeProps {
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

export const PumpNode = ({
  isSelected,
  nodeId,
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
        <img
          src="/assets/pump.svg"
          alt="Pump"
          className="w-8 h-8 pointer-events-none select-none"
          draggable={false}
        />
      </div>
      <ConnectionHandles
        nodeId={nodeId}
        onStartConnect={onStartConnect}
        onEndConnect={onEndConnect}
        positions={["left", "right"]}
      />
    </div>
  );
};
