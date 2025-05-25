/* eslint-disable no-unused-vars */
import { cn } from "@/lib/utils";
import { ConnectionHandles } from "./connection-handles";

interface TankNodeProps {
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

export const TankNode = ({
  isSelected,
  nodeId,
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
        <img
          src="/src/assets/tank.svg"
          alt="Tank"
          className="w-8 h-8 select-none"
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
