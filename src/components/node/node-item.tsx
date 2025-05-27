import { cn } from "@/lib/utils";
import type { Node } from "@/types/node-edge";
/* eslint-disable no-unused-vars */
import React from "react";
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

const NodeItem: React.FC<NodeItemProps> = ({
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
}) => {
  const renderNodeShape = (node: Node) => {
    switch (node.type) {
      case "reservoir":
        return (
          <ReservoirNode
            nodeId={node.id}
            isSelected={isSelected}
            onStartConnect={onStartConnect}
            onEndConnect={onEndConnect}
          />
        );
      case "tank":
        return (
          <TankNode
            nodeId={node.id}
            isSelected={isSelected}
            onStartConnect={onStartConnect}
            onEndConnect={onEndConnect}
          />
        );
      case "pump":
        return (
          <PumpNode
            nodeId={node.id}
            isSelected={isSelected}
            onStartConnect={onStartConnect}
            onEndConnect={onEndConnect}
          />
        );
      case "valve":
        return (
          <ValveNode
            nodeId={node.id}
            isSelected={isSelected}
            onStartConnect={onStartConnect}
            onEndConnect={onEndConnect}
          />
        );
      case "fitting":
        return (
          <FittingNode
            nodeId={node.id}
            nodeSubType={node.subtype}
            flowRate={node.flowRate}
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
      data-testid={`node-${node.id}`}
      className={cn(
        "relative w-16 h-16 group select-none",
        isDragged && "pointer-events-none",
      )}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(e);
      }}
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
      <div className="absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100">
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
    </div>
  );
};

export default React.memo(NodeItem);
