/* eslint-disable no-unused-vars */
import React from "react";

import { EdgeConnectionPoint } from "./edge-connection-point";

import type { NodeBase } from "@/types/node-edge";
import { Filter, Zap } from "lucide-react";

type NodeItemProps = {
  node: NodeBase;
  x: number;
  y: number;
  zoom: number;
  isDragged: boolean;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onMouseUp: (e: React.MouseEvent, id: string) => void;
  onStartConnect: (
    e: React.MouseEvent,
    id: string,
    position: "left" | "right" | "top" | "bottom",
  ) => void;
  onEndConnect: (
    e: React.MouseEvent,
    id: string,
    position: "left" | "right" | "top" | "bottom",
  ) => void;
};

export const NodeItem = React.memo(function NodeItem({
  node,
  x,
  y,
  zoom,
  isDragged,
  isSelected,
  onMouseDown,
  onMouseUp,
  onStartConnect,
  onEndConnect,
}: NodeItemProps) {
  const renderNodeShape = () => {
    switch (node.type as string) {
      case "reservoir":
        return <div className="w-16 h-16 bg-blue-500 rounded-full" />;

      case "tank":
        return <div className="w-16 h-16 bg-orange-500 rounded-md" />;

      case "pump":
        return (
          <div className="flex items-center justify-center w-16 h-16 font-bold text-black bg-yellow-400 rounded-full">
            <Zap />
          </div>
        );

      case "valve":
        return (
          <div className="flex items-center justify-center w-16 h-16 font-bold text-black bg-green-600 rounded-md">
            <Filter />
          </div>
        );

      case "fitting": {
        const fittingType = node.subtype as string;
        switch (fittingType) {
          case "tee":
            return (
              <div className="relative flex items-center justify-center w-16 h-16">
                <div className="w-full h-4 bg-gray-300" />
                <div className="absolute top-0 w-4 -translate-x-1/2 bg-gray-300 h-1/2 left-1/2" />
              </div>
            );
          case "cross":
            return (
              <div className="relative flex items-center justify-center w-16 h-16">
                <div className="absolute left-0 w-full h-4 -translate-y-1/2 bg-gray-300 top-1/2" />
                <div className="absolute top-0 w-4 h-full -translate-x-1/2 bg-gray-300 left-1/2" />
              </div>
            );
          case "coupling":
            return <div className="w-16 h-4 bg-gray-300" />;
          default:
            return (
              <div className="flex items-center justify-center w-16 h-16 bg-gray-300 rounded-md">
                Node
              </div>
            );
        }
      }

      default:
        return (
          <div className="flex items-center justify-center w-16 h-16 bg-gray-300 rounded-md">
            {node.label}
          </div>
        );
    }
  };

  const renderHandles = () => {
    const positions: ("left" | "right" | "top" | "bottom")[] =
      node.type === "fitting" && node.subtype === "cross"
        ? ["left", "right", "top", "bottom"]
        : node.subtype === "tee"
        ? ["left", "right", "top"]
        : ["left", "right"];

    return positions.map((pos) => (
      <EdgeConnectionPoint
        key={pos}
        nodeId={node.id}
        position={pos}
        data-position={pos}
        onMouseDown={(e) => onStartConnect(e, node.id, pos)}
        onMouseUp={(e) => onEndConnect(e, node.id, pos)}
        data-handle
      />
    ));
  };

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move"
      data-node-id={node.id}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -50%) scale(${zoom / 100}) rotate(${
          node.rotation ?? 0
        }deg)`,
        transformOrigin: "center",
        boxShadow: isDragged
          ? "0 0 0 2px white, 0 0 0 4px #3b82f6"
          : isSelected
          ? "0 0 0 2px white, 0 0 0 4px #60a5fa"
          : undefined,

        zIndex: isDragged ? 100 : 0,
      }}
      onMouseDown={(e) => onMouseDown(e, node.id)}
      onMouseUp={(e) => onMouseUp(e, node.id)}>
      <div className="relative">
        {renderNodeShape()}
        {renderHandles()}
      </div>
    </div>
  );
});
