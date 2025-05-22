/* eslint-disable no-unused-vars */
import { useHandlePosition } from "@/handlers/use-position-handler";
import type { Edge } from "@/types/node-edge";
import clsx from "clsx";

type BoardCanvasProps = {
  edges: Edge[];
  zoom: number;
  onEdgeClick: (edge: Edge) => void;
  connecting: {
    sourceId: string;
    sourcePosition: "left" | "right" | "top" | "bottom";
  } | null;
  mousePos: { x: number; y: number } | null;
  draggingEdgeHandle: {
    edgeId: string;
    type: "source" | "target";
  } | null;
  onEdgeReconnection: (
    e: React.MouseEvent,
    edgeId: string,
    type: "source" | "target",
  ) => void;
};

export const BoardCanvas = ({
  edges,
  zoom,
  onEdgeClick,
  connecting,
  mousePos,
  draggingEdgeHandle,
  onEdgeReconnection,
}: BoardCanvasProps) => {
  const { getHandlePosition } = useHandlePosition();

  return (
    <>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-[45]"
        aria-label="Board Canvas"
        role="img">
        {/* Connection lines */}
        {edges.map((edge) => {
          const sourcePos = getHandlePosition(
            edge.sourceId,
            edge.sourcePosition,
          );
          const targetPos = getHandlePosition(
            edge.targetId,
            edge.targetPosition,
          );
          if (!sourcePos || !targetPos) return null;

          return (
            <line
              key={edge.id}
              x1={sourcePos.x}
              y1={sourcePos.y}
              x2={targetPos.x}
              y2={targetPos.y}
              className={clsx("transition-all duration-300", {
                "stroke-blue-500": edge.flowRate !== 0,
                "stroke-dashed stroke-gray-400": edge.flowRate === 0,
              })}
              strokeWidth={14 * (zoom / 100)}
              strokeLinecap="round"
              strokeLinejoin="round"
              onClick={() => onEdgeClick(edge)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onEdgeClick(edge);
                }
              }}
              tabIndex={0}
              style={{
                cursor: "pointer",
                pointerEvents: "stroke",
              }}
            />
          );
        })}

        {/* Connection progress while creating new */}
        {connecting &&
          mousePos &&
          (() => {
            const sourcePos = getHandlePosition(
              connecting.sourceId,
              connecting.sourcePosition,
            );
            if (!sourcePos) return null;

            return (
              <line
                x1={sourcePos.x}
                y1={sourcePos.y}
                x2={mousePos.x}
                y2={mousePos.y}
                className={"stroke-dashed stroke-gray-400"}
                strokeWidth={14 * (zoom / 100)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })()}

        {/* Connection progress while reconnecting */}
        {draggingEdgeHandle &&
          mousePos &&
          (() => {
            const edge = edges.find((e) => e.id === draggingEdgeHandle.edgeId);
            if (!edge) return null;

            const fromPosition =
              draggingEdgeHandle.type === "source"
                ? edge.targetPosition
                : edge.sourcePosition;

            const fixedNodeId =
              draggingEdgeHandle.type === "source"
                ? edge.targetId
                : edge.sourceId;

            const fixedPos = getHandlePosition(fixedNodeId, fromPosition);
            if (!fixedPos) return null;

            const x1 =
              draggingEdgeHandle.type === "source" ? mousePos.x : fixedPos.x;
            const y1 =
              draggingEdgeHandle.type === "source" ? mousePos.y : fixedPos.y;
            const x2 =
              draggingEdgeHandle.type === "source" ? fixedPos.x : mousePos.x;
            const y2 =
              draggingEdgeHandle.type === "source" ? fixedPos.y : mousePos.y;

            return (
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={"stroke-dashed stroke-blue-200"}
                strokeWidth={12 * (zoom / 100)}
                strokeDasharray="4 4"
              />
            );
          })()}
      </svg>

      {/* Edge Reconnection Points */}
      {edges.map((edge) => {
        const sourcePos = getHandlePosition(edge.sourceId, edge.sourcePosition);
        const targetPos = getHandlePosition(edge.targetId, edge.targetPosition);
        if (!sourcePos || !targetPos) return null;

        return (
          <div key={edge.id}>
            <div
              className="absolute z-[60] bg-white border border-blue-500 rounded-full cursor-crosshair hover:bg-blue-50"
              style={{
                left: `${sourcePos.x}px`,
                top: `${sourcePos.y}px`,
                transform: "translate(-50%, -50%)",
                width: `${16 * (zoom / 100)}px`,
                height: `${16 * (zoom / 100)}px`,
              }}
              data-handle
              data-node-id={edge.sourceId}
              data-position={edge.sourcePosition}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdgeReconnection(e, edge.id, "source");
              }}
            />
            <div
              className="absolute z-[60] bg-white border border-blue-500 rounded-full cursor-crosshair hover:bg-blue-50"
              style={{
                left: `${targetPos.x}px`,
                top: `${targetPos.y}px`,
                transform: "translate(-50%, -50%)",
                width: `${16 * (zoom / 100)}px`,
                height: `${16 * (zoom / 100)}px`,
              }}
              data-handle
              data-node-id={edge.targetId}
              data-position={edge.targetPosition}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdgeReconnection(e, edge.id, "target");
              }}
            />
          </div>
        );
      })}
    </>
  );
};
