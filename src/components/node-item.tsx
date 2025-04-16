/* eslint-disable no-unused-vars */
import type React from "react";

import { ConnectionHandle } from "./connection-handle";

import type { Node } from "@/store/node-edge";

type NodeItemProps = {
  node: Node;
  x: number;
  y: number;
  isDragged: boolean;
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

export const NodeItem: React.FC<NodeItemProps> = ({
  node,
  x,
  y,
  isDragged,
  onMouseDown,
  onMouseUp,
  onStartConnect,
  onEndConnect,
}) => {
  return (
    <div
      className={
        "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move bg-white border rounded shadow"
      }
      data-node-id={node.id}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: 100,
        height: 40,
        boxShadow: isDragged
          ? "0 0 0 2px white, 0 0 0 4px #3b82f6"
          : "0 1px 2px rgba(0,0,0,0.1)",
        zIndex: isDragged ? 100 : 50,
      }}
      onMouseDown={(e) => onMouseDown(e, node.id)}
      onMouseUp={(e) => onMouseUp(e, node.id)}>
      <div className="relative flex items-center justify-center w-full h-full text-xs text-black select-none">
        {node.data.label}
        <ConnectionHandle
          position="left"
          onMouseDown={(e) => onStartConnect(e, node.id, "left")}
          onMouseUp={(e) => onEndConnect(e, node.id, "left")}
          data-handle
        />
        <ConnectionHandle
          position="right"
          onMouseDown={(e) => onStartConnect(e, node.id, "right")}
          onMouseUp={(e) => onEndConnect(e, node.id, "right")}
          data-handle
        />
      </div>
    </div>
  );
};
