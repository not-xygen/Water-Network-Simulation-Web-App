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
  positions?: readonly ("left" | "right" | "top" | "bottom")[];
}

export const ConnectionHandles = React.memo(function ConnectionHandles({
  onStartConnect,
  onEndConnect,
  nodeId,
  positions = ["left", "right", "top", "bottom"],
}: ConnectionHandlesProps) {
  const handleProps = {
    left: {
      className:
        "absolute left-0 w-4 h-4 bg-blue-200 border border-blue-400 rounded-full top-1/2 cursor-crosshair z-[70]",
      style: { transform: "translate(-50%, -50%)" },
      dataPosition: "left",
    },
    right: {
      className:
        "absolute right-0 w-4 h-4 bg-blue-200 border border-blue-400 rounded-full top-1/2 cursor-crosshair z-[70]",
      style: { transform: "translate(50%, -50%)" },
      dataPosition: "right",
    },
    top: {
      className:
        "absolute top-0 w-4 h-4 bg-blue-200 border border-blue-400 rounded-full left-1/2 cursor-crosshair z-[70]",
      style: { transform: "translate(-50%, -50%)" },
      dataPosition: "top",
    },
    bottom: {
      className:
        "absolute bottom-0 w-4 h-4 bg-blue-200 border border-blue-400 rounded-full left-1/2 cursor-crosshair z-[70]",
      style: { transform: "translate(-50%, 50%)" },
      dataPosition: "bottom",
    },
  };

  return (
    <>
      {positions.map((position) => (
        <div
          key={position}
          className={`${handleProps[position].className} select-none`}
          style={handleProps[position].style}
          onMouseDown={(e) => {
            e.stopPropagation();
            onStartConnect(e, position);
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            onEndConnect(e, position);
          }}
          data-handle
          data-node-id={nodeId}
          data-position={handleProps[position].dataPosition}
        />
      ))}
    </>
  );
});
