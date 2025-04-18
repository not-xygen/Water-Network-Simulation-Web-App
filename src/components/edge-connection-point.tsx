/* eslint-disable no-unused-vars */
import type React from "react";

type PointProps = {
  nodeId: string;
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseUp: (event: React.MouseEvent) => void;
  position: "left" | "right" | "top" | "bottom";
};

const positionStyles = {
  left: "left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2",
  right: "right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2",
  top: "top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
  bottom: "bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2",
};

export const EdgeConnectionPoint: React.FC<PointProps> = ({
  nodeId,
  onMouseDown,
  onMouseUp,
  position,
}) => {
  return (
    <div
      className={`absolute w-3 h-3 bg-blue-500 rounded-full z-10 cursor-crosshair ${positionStyles[position]}`}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      data-handle
      data-node-id={nodeId}
      data-position={position}
    />
  );
};
