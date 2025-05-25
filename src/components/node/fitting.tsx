/* eslint-disable no-unused-vars */
import { cn } from "@/lib/utils";
import { ConnectionHandles } from "./connection-handles";

interface FittingNodeProps {
  isSelected: boolean;
  nodeId: string;
  nodeSubType: string;
  flowRate?: number;
  onStartConnect: (
    e: React.MouseEvent,
    position: "left" | "right" | "top" | "bottom",
  ) => void;
  onEndConnect: (
    e: React.MouseEvent,
    position: "left" | "right" | "top" | "bottom",
  ) => void;
}

const getConnectionPositions = (type: string) => {
  switch (type) {
    case "tee":
      return ["left", "right", "top"] as const;
    case "elbow":
      return ["left", "top"] as const;
    case "cross":
      return ["left", "right", "top", "bottom"] as const;
    case "coupling":
      return ["left", "right"] as const;
    default:
      return ["left", "right", "top", "bottom"] as const;
  }
};

const renderFittingShape = (type: string, flowRate?: number) => {
  const hasFlow = flowRate && flowRate !== 0;
  const bgColor = hasFlow ? "bg-blue-500" : "bg-gray-300";
  const transitionClass = "transition-all duration-300";

  switch (type) {
    case "tee":
      return (
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className={cn(`w-full h-4 ${bgColor}`, transitionClass)} />
          <div
            className={cn(
              `absolute top-0 w-4 -translate-x-1/2 ${bgColor} h-1/2 left-1/2`,
              transitionClass,
            )}
          />
        </div>
      );
    case "elbow":
      return (
        <div className="relative flex items-center justify-center w-16 h-16">
          <div
            className={cn(
              `absolute left-0 w-[62%] h-4 -translate-y-1/2 ${bgColor} top-1/2`,
              transitionClass,
            )}
          />
          <div
            className={cn(
              `absolute top-0 w-4 h-[62%] -translate-x-1/2 ${bgColor} left-1/2`,
              transitionClass,
            )}
          />
        </div>
      );
    case "cross":
      return (
        <div className="relative flex items-center justify-center w-16 h-16">
          <div
            className={cn(
              `absolute left-0 w-full h-4 -translate-y-1/2 ${bgColor} top-1/2`,
              transitionClass,
            )}
          />
          <div
            className={cn(
              `absolute top-0 w-4 h-full -translate-x-1/2 ${bgColor} left-1/2`,
              transitionClass,
            )}
          />
        </div>
      );
    case "coupling":
      return <div className={cn(`w-16 h-4 ${bgColor}`, transitionClass)} />;
    default:
      return (
        <div
          className={cn(
            `flex items-center justify-center w-16 h-16 ${bgColor} rounded-md`,
            transitionClass,
          )}>
          Node
        </div>
      );
  }
};

export const FittingNode = ({
  isSelected,
  nodeId,
  nodeSubType,
  flowRate,
  onStartConnect,
  onEndConnect,
}: FittingNodeProps) => {
  const connectionPositions = getConnectionPositions(nodeSubType);

  return (
    <div className="relative w-16 h-16">
      <div
        className={cn(
          "flex items-center justify-center w-16 h-16 font-bold text-black rounded-md",
          isSelected && "ring-2 ring-blue-500",
        )}>
        {renderFittingShape(nodeSubType, flowRate)}
      </div>
      <ConnectionHandles
        nodeId={nodeId}
        onStartConnect={onStartConnect}
        onEndConnect={onEndConnect}
        positions={connectionPositions}
      />
    </div>
  );
};
