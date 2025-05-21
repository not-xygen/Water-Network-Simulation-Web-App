/* eslint-disable no-unused-vars */
import { RefreshCcwDot } from "lucide-react";
import React from "react";

interface RotateHandleProps {
  onRotateStart: (e: React.MouseEvent) => void;
  onRotateEnd: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export const RotateHandle = React.memo(function RotateHandle({
  onRotateStart,
  onRotateEnd,
  style,
}: RotateHandleProps) {
  return (
    <div
      className="absolute flex items-center justify-center w-4 h-4 bg-blue-200 border border-blue-400 rounded-full cursor-grab"
      onMouseDown={onRotateStart}
      onMouseUp={onRotateEnd}
      data-handle
      data-type="rotate"
      style={style}>
      <RefreshCcwDot className="w-3 h-3 text-blue-600" />
    </div>
  );
});
