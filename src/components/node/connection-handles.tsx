/* eslint-disable no-unused-vars */
import React from "react";

interface ConnectionHandlesProps {
  onStartConnect: (
    e: React.MouseEvent,
    position: "left" | "right" | "top" | "bottom",
  ) => void;
  onEndConnect: (
    e: React.MouseEvent,
    position: "left" | "right" | "top" | "bottom",
  ) => void;
  nodeId: string;
}

export const ConnectionHandles = React.memo(function ConnectionHandles({
  onStartConnect,
  onEndConnect,
  nodeId,
}: ConnectionHandlesProps) {
  return (
    <>
      {/* Left */}
      <div
        className="absolute left-0 w-3 h-3 bg-blue-200 border border-blue-400 rounded-full top-1/2 cursor-crosshair"
        style={{ transform: "translate(-50%, -50%)" }}
        onMouseDown={(e) => onStartConnect(e, "left")}
        onMouseUp={(e) => onEndConnect(e, "left")}
        data-handle
        data-node-id={nodeId}
        data-position="left"
      />
      {/* Right */}
      <div
        className="absolute right-0 w-3 h-3 bg-blue-200 border border-blue-400 rounded-full top-1/2 cursor-crosshair"
        style={{ transform: "translate(50%, -50%)" }}
        onMouseDown={(e) => onStartConnect(e, "right")}
        onMouseUp={(e) => onEndConnect(e, "right")}
        data-handle
        data-node-id={nodeId}
        data-position="right"
      />
      {/* Top */}
      <div
        className="absolute top-0 w-3 h-3 bg-blue-200 border border-blue-400 rounded-full left-1/2 cursor-crosshair"
        style={{ transform: "translate(-50%, -50%)" }}
        onMouseDown={(e) => onStartConnect(e, "top")}
        onMouseUp={(e) => onEndConnect(e, "top")}
        data-handle
        data-node-id={nodeId}
        data-position="top"
      />
      {/* Bottom */}
      <div
        className="absolute bottom-0 w-3 h-3 bg-blue-200 border border-blue-400 rounded-full left-1/2 cursor-crosshair"
        style={{ transform: "translate(-50%, 50%)" }}
        onMouseDown={(e) => onStartConnect(e, "bottom")}
        onMouseUp={(e) => onEndConnect(e, "bottom")}
        data-handle
        data-node-id={nodeId}
        data-position="bottom"
      />
    </>
  );
});
