/* eslint-disable no-unused-vars */
import React from "react";

import { EdgeConnectionPoint } from "./edge-connection-point";

import type { Node } from "@/store/node-edge";

type NodeItemProps = {
  node: Node;
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
  const renderJunctionShape = (subtype: string | undefined) => {
    switch (subtype) {
      case "T":
        return (
          <div className="relative flex items-center justify-center w-16 h-16">
            <div className="w-full h-4 bg-blue-600" />
            <div className="absolute top-0 w-4 -translate-x-1/2 bg-blue-600 h-1/2 left-1/2" />
          </div>
        );
      case "4Way":
        return (
          <div className="relative flex items-center justify-center w-16 h-16">
            <div className="absolute left-0 w-full h-4 -translate-y-1/2 bg-green-600 top-1/2" />
            <div className="absolute top-0 w-4 h-full -translate-x-1/2 bg-green-600 left-1/2" />
          </div>
        );
      case "Inline":
        return <div className="w-16 h-4 bg-gray-600" />;
      default:
        return <span className="text-sm font-semibold">Node</span>;
    }
  };

  const renderHandles = () => {
    const positions: ("left" | "right" | "top" | "bottom")[] =
      node.type === "junction" && node.data.label === "4Way"
        ? ["left", "right", "top", "bottom"]
        : node.type === "junction" && node.data.label === "T"
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
          ? "0 0 0 2px white, 0 0 0 4px #60a5fa" // ring biru jika selected
          : undefined,

        zIndex: isDragged ? 100 : 0,
      }}
      onMouseDown={(e) => onMouseDown(e, node.id)}
      onMouseUp={(e) => onMouseUp(e, node.id)}>
      <div className="relative">
        {node.type === "junction"
          ? renderJunctionShape(node.data.label as string)
          : node.data.label}
        {renderHandles()}
      </div>
    </div>
  );
});
