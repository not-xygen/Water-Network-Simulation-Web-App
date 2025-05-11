import { RedoDot as LucideRedoDot } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { useBoardHandler } from "@/handlers/use-board-handler";
import { useConnectionHandler } from "@/handlers/use-connection-handler";
import { useNodeHandler } from "@/handlers/use-node-handler";
import { useHandlePosition } from "@/handlers/use-position-handler";
import useGlobalStore from "@/store/globals";
import useNodeEdgeStore from "@/store/node-edge";

import clsx from "clsx";
import { NodeItem } from "./node-item";

const RedoDot = React.memo(LucideRedoDot);

type BoardProps = {
  isSpacePressed: boolean;
};

export const Board = ({ isSpacePressed }: BoardProps) => {
  const { zoom, offset } = useGlobalStore();
  const {
    nodes,
    removeNode,
    edges,
    updateEdgeConnection,
    removeEdge,
    selectedNodes,
    setSelectedNodes,
    selectedEdges,
    setSelectedEdges,
  } = useNodeEdgeStore();

  const isDraggingBoardRef = useRef(false);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  const [connecting, setConnecting] = useState<{
    sourceId: string;
    sourcePosition: "left" | "right" | "top" | "bottom";
  } | null>(null);
  const isConnectingRef = useRef(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const [rotatingNodeId, setRotatingNodeId] = useState<string | null>(null);

  const [draggingEdgeHandle, setDraggingEdgeHandle] = useState<{
    edgeId: string;
    type: "source" | "target";
  } | null>(null);

  const [selectionStart, setSelectionStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const {
    handleBoardMouseWheel,
    handleBoardMouseDown,
    handleBoardMouseUp,
    handleBoardMouseMove,
  } = useBoardHandler({
    draggedNode,
    setDraggedNode,
    isDraggingBoardRef,
    lastMousePosRef,
    isSpacePressed,
    selectionStart,
    setSelectionStart,
    selectionEnd,
    setSelectionEnd,
  });

  const { handleConnectionStart, handleConnectionEnd, handleEdgeReconnection } =
    useConnectionHandler({
      connecting,
      setConnecting,
      setMousePos,
      updateEdgeConnection,
      isConnectingRef,
      setDraggingEdgeHandle,
    });

  const { handleNodeMouseDown, handleNodeStartRotate } = useNodeHandler({
    setRotatingNodeId,
    setDraggedNode,
    lastMousePosRef,
  });

  const { getWorldToScreen, getHandlePosition } = useHandlePosition();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete") {
        for (const node of selectedNodes) {
          removeNode(node.id);
        }
        setSelectedNodes([]);

        for (const edge of selectedEdges) {
          removeEdge(edge.id);
        }
        setSelectedEdges([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedNodes,
    setSelectedNodes,
    removeNode,
    selectedEdges,
    setSelectedEdges,
    removeEdge,
  ]);

  return (
    <div
      id="board"
      className="relative z-40 w-full h-full overflow-hidden bg-gray-100"
      onWheel={handleBoardMouseWheel}
      onMouseDown={handleBoardMouseDown}
      onMouseUp={handleBoardMouseUp}
      onMouseLeave={handleBoardMouseUp}
      onMouseMove={handleBoardMouseMove}>
      {/* Grid Background */}
      <div
        className="absolute inset-0 board-background z-[-10]"
        style={{
          backgroundSize: `${30 * (zoom / 100)}px ${30 * (zoom / 100)}px`,
          backgroundImage:
            "radial-gradient(circle, #b8b8b8bf 1px, transparent 1px)",
          backgroundPosition: `${offset.x % (30 * (zoom / 100))}px ${
            offset.y % (30 * (zoom / 100))
          }px`,
          cursor: isSpacePressed
            ? isDraggingBoardRef.current
              ? "grabbing"
              : "grab"
            : "default",
        }}
      />
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: <intended> */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-[45] bg-red">
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
            // biome-ignore lint/a11y/useKeyWithClickEvents: <intended>
            <line
              key={edge.id}
              x1={sourcePos.x}
              y1={sourcePos.y}
              x2={targetPos.x}
              y2={targetPos.y}
              className={clsx("transition-all duration-300", {
                "stroke-blue-500": edge.flowRate > 0,
                "stroke-gray-400": edge.flowRate <= 0,
                "stroke-dashed": edge.flowRate <= 0,
              })}
              strokeWidth={14 * (zoom / 100)}
              strokeLinecap="round"
              strokeLinejoin="round"
              onClick={() => {
                setSelectedEdges([edge]);
                setSelectedNodes([]);
              }}
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
                className="stroke-blue-100"
                strokeWidth={12 * (zoom / 100)}
                strokeDasharray="4 4"
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
                className="stroke-blue-200"
                strokeWidth={12 * (zoom / 100)}
                strokeDasharray="4 4"
              />
            );
          })()}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => {
        const { x, y } = getWorldToScreen(node);
        const isRotating = rotatingNodeId === node.id;

        return (
          <div key={node.id} className="absolute group z-[40]">
            {/* Rotate Handle */}
            {(
              ["top-left", "top-right", "bottom-left", "bottom-right"] as (
                | "top-left"
                | "top-right"
                | "bottom-left"
                | "bottom-right"
              )[]
            ).map((pos) => {
              const transformMap = {
                "top-left": `translate(-${40 * (zoom / 100)}px, -${
                  40 * (zoom / 100)
                }px)`,
                "top-right": `translate(${40 * (zoom / 100)}px, -${
                  40 * (zoom / 100)
                }px)`,
                "bottom-left": `translate(-${40 * (zoom / 100)}px, ${
                  40 * (zoom / 100)
                }px)`,
                "bottom-right": `translate(${40 * (zoom / 100)}px, ${
                  40 * (zoom / 100)
                }px)`,
              };

              return (
                <div
                  key={pos}
                  className={`absolute z-[60] p-1 rounded-full cursor-rotate transition-opacity opacity-0 ${
                    isRotating ? "opacity-100 pointer-events-none" : ""
                  } group-hover:opacity-100`}
                  onMouseDown={(e) => handleNodeStartRotate(e, node.id)}
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: `translate(-50%, -50%) rotate(${
                      node.rotation ?? 0
                    }deg) ${transformMap[pos]}`,
                    width: `${12 * (zoom / 100)}px`,
                    height: `${12 * (zoom / 100)}px`,
                    backgroundColor: "#94B4C1",
                  }}>
                  <RedoDot className="w-full h-full text-center text-white" />
                </div>
              );
            })}

            <NodeItem
              node={node}
              x={x}
              y={y}
              zoom={zoom}
              isSelected={selectedNodes.some((n) => n.id === node.id)}
              isDragged={draggedNode === node.id}
              onMouseDown={handleNodeMouseDown}
              onMouseUp={handleBoardMouseUp}
              onStartConnect={handleConnectionStart}
              onEndConnect={handleConnectionEnd}
            />
          </div>
        );
      })}

      {/* Edge Reconnection Points */}
      {edges.map((edge) => {
        const sourcePos = getHandlePosition(edge.sourceId, edge.sourcePosition);
        const targetPos = getHandlePosition(edge.targetId, edge.targetPosition);
        if (!sourcePos || !targetPos) return null;

        return (
          <div key={edge.id}>
            <div
              className="absolute z-50 bg-white border border-blue-500 rounded-full cursor-crosshair"
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
              onMouseDown={(e) => handleEdgeReconnection(e, edge.id, "source")}
            />
            <div
              className="absolute z-50 w-4 h-4 bg-white border border-blue-500 rounded-full cursor-crosshair"
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
              onMouseDown={(e) => handleEdgeReconnection(e, edge.id, "target")}
            />
          </div>
        );
      })}

      {/* Selection Box */}
      {selectionStart && selectionEnd && (
        <div
          className="absolute z-20 w-full h-full border border-blue-500 bg-blue-500/10"
          style={{
            left: Math.min(selectionStart.x, selectionEnd.x),
            top: Math.min(selectionStart.y, selectionEnd.y),
            width: Math.abs(selectionStart.x - selectionEnd.x),
            height: Math.abs(selectionStart.y - selectionEnd.y),
          }}
        />
      )}
    </div>
  );
};
