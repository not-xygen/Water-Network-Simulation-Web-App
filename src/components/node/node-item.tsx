/* eslint-disable no-unused-vars */
import { cn } from "@/lib/utils";
import type { Node } from "@/types/node-edge";
import { FittingNode } from "./fitting";
import { PumpNode } from "./pump";
import { ReservoirNode } from "./reservoir";
import { RotateHandle } from "./rotate-handle";
import { TankNode } from "./tank";
import { ValveNode } from "./valve";
interface NodeItemProps {
  node: Node;
  isSelected: boolean;
  zoom: number;
  isDragged: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onStartConnect: (
    e: React.MouseEvent,
    position: "left" | "right" | "top" | "bottom",
  ) => void;
  onEndConnect: (
    e: React.MouseEvent,
    position: "left" | "right" | "top" | "bottom",
  ) => void;
  onRotateStart: (e: React.MouseEvent) => void;
  onRotateEnd: (e: React.MouseEvent) => void;
}

export const NodeItem = ({
  node,
  isSelected,
  zoom,
  isDragged,
  onMouseDown,
  onMouseUp,
  onStartConnect,
  onEndConnect,
  onRotateStart,
  onRotateEnd,
}: NodeItemProps) => {
  const renderNodeShape = (node: Node) => {
    switch (node.type) {
      case "reservoir":
        return (
          <ReservoirNode
            isSelected={isSelected}
            onStartConnect={onStartConnect}
            onEndConnect={onEndConnect}
          />
        );
      case "tank":
        return (
          <TankNode
            isSelected={isSelected}
            onStartConnect={onStartConnect}
            onEndConnect={onEndConnect}
          />
        );
      case "pump":
        return (
          <PumpNode
            isSelected={isSelected}
            onStartConnect={onStartConnect}
            onEndConnect={onEndConnect}
          />
        );
      case "valve":
        return (
          <ValveNode
            isSelected={isSelected}
            onStartConnect={onStartConnect}
            onEndConnect={onEndConnect}
          />
        );
      case "fitting":
        return (
          <FittingNode
            isSelected={isSelected}
            onStartConnect={onStartConnect}
            onEndConnect={onEndConnect}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn("relative w-16 h-16", isDragged && "pointer-events-none")}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      style={{
        transform: `scale(${zoom / 100}) rotate(${node.rotation ?? 0}deg)`,
      }}>
      <div
        className={cn(
          "flex items-center justify-center w-16 h-16 font-bold text-black rounded-md",
          isSelected && "ring-2 ring-blue-500",
        )}>
        {renderNodeShape(node)}
      </div>
      {["topLeft", "topRight", "bottomLeft", "bottomRight"].map((pos) => {
        const styleMap: Record<string, React.CSSProperties> = {
          topLeft: {
            top: -8,
            left: -8,
            transform: `scale(${100 / zoom})`,
          },
          topRight: {
            top: -8,
            right: -8,
            transform: `scale(${100 / zoom})`,
          },
          bottomLeft: {
            bottom: -8,
            left: -8,
            transform: `scale(${100 / zoom})`,
          },
          bottomRight: {
            bottom: -8,
            right: -8,
            transform: `scale(${100 / zoom})`,
          },
        };
        return (
          <RotateHandle
            key={pos}
            onRotateStart={onRotateStart}
            onRotateEnd={onRotateEnd}
            style={styleMap[pos]}
          />
        );
      })}
    </div>
  );
};
