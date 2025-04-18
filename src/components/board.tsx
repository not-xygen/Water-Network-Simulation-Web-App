import useGlobalStore from "@/store/globals";
import { useEffect, useRef, useState } from "react";

import { NodeItem } from "./node-item";
import type { Edge, Node } from "@/store/node-edge";
import useNodeEdgeStore from "@/store/node-edge";
import { NodePropertyDrawer } from "./node-property-drawer";
import { RotateCcw } from "lucide-react";
import { EdgePropertyDrawer } from "./edge-property-drawer";
import { useBoardHandler } from "@/handlers/use-board-handler";
import { useConnectionHandler } from "@/handlers/use-connection-handler";
import { useNodeHandler } from "@/handlers/use-node-handler";
import { useHandlePosition } from "@/handlers/use-handle-position";

export const Board = () => {
  const { zoom, offset, setOffset, zoomIn, zoomOut, mode } = useGlobalStore();
  const {
    nodes,
    updateNodePosition,
    updateNodeRotation,
    edges,
    addEdge,
    updateEdgeConnection,
    selectedNodes,
    setSelectedNodes,
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

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [drawerNodeOpen, setDrawerNodeOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [drawerEdgeOpen, setDrawerEdgeOpen] = useState(false);

  const [draggingEdgeHandle, setDraggingEdgeHandle] = useState<{
    edgeId: string;
    type: "source" | "target";
  } | null>(null);

  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const [selectionStart, setSelectionStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const { handleWheel, handleBoardMouseDown, handleMouseUp, handleMouseMove } =
    useBoardHandler({
      zoom,
      offset,
      setOffset,
      zoomIn,
      zoomOut,
      nodes,
      selectedNodes,
      setSelectedNodes,
      draggedNode,
      setDraggedNode,
      updateNodePosition,
      isDraggingBoardRef,
      lastMousePosRef,
      isSpacePressed,
      selectionStart,
      setSelectionStart,
      selectionEnd,
      setSelectionEnd,
    });

  const {
    handleStartConnection,
    handleEndConnection,
    handleStartEdgeReconnect,
  } = useConnectionHandler({
    addEdge,
    edges,
    connecting,
    setConnecting,
    setMousePos,
    updateEdgeConnection,
    isConnectingRef,
    setDraggingEdgeHandle,
  });

  const { handleNodeMouseDown, handleStartRotate } = useNodeHandler({
    nodes,
    zoom,
    offset,
    mode,
    setRotatingNodeId,
    updateNodeRotation,
    setSelectedNode,
    setDrawerNodeOpen,
    setDraggedNode,
    lastMousePosRef,
  });

  const { worldToScreen, getHandlePosition } = useHandlePosition({
    nodes,
    zoom,
    offset,
  });

  return (
    <div
      id="board-container"
      className="w-screen h-screen overflow-hidden bg-gray-100"
      onWheel={handleWheel}
      onMouseDown={handleBoardMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}>
      {/* Grid Background */}
      <div
        className="absolute inset-0 board-background"
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
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-[45] bg-red">
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
              stroke="#3b82f6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={14 * (zoom / 100)}
              onClick={() => {
                setSelectedEdge(edge);
                setDrawerEdgeOpen(true);
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
                stroke="gray"
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
                stroke="gray"
                strokeWidth={12 * (zoom / 100)}
                strokeDasharray="4 4"
              />
            );
          })()}

        {/* Reconnecting Edge */}
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
                stroke="gray"
                strokeWidth={12 * (zoom / 100)}
                strokeDasharray="4 4"
              />
            );
          })()}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => {
        const { x, y } = worldToScreen(node);
        const isRotating = rotatingNodeId === node.id;

        return (
          <div key={node.id} className="absolute group">
            {/* Rotate Handle */}
            <div
              className={`absolute z-[60] rounded-full cursor-rotate transition-opacity opacity-0 group-hover:opacity-100 bg-blue-500 ${
                isRotating ? "pointer-events-none opacity-100" : ""
              }`}
              onMouseDown={(e) => {
                handleStartRotate(e, node.id);
              }}
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: `translate(-50%, -50%) rotate(${
                  node.rotation ?? 0
                }deg) translateY(-${60 * (zoom / 100)}px)`,
                width: `${20 * (zoom / 100)}px`,
                height: `${20 * (zoom / 100)}px`,
              }}>
              <RotateCcw
                className="text-white"
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>

            {/* Node Item */}
            <NodeItem
              node={node}
              x={x}
              y={y}
              zoom={zoom}
              isSelected={
                selectedNode?.id === node.id ||
                selectedNodes.some((n) => n.id === node.id)
              }
              isDragged={draggedNode === node.id}
              onMouseDown={handleNodeMouseDown}
              onMouseUp={handleMouseUp}
              onStartConnect={handleStartConnection}
              onEndConnect={handleEndConnection}
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
              onMouseDown={(e) =>
                handleStartEdgeReconnect(e, edge.id, "source")
              }
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
              onMouseDown={(e) =>
                handleStartEdgeReconnect(e, edge.id, "target")
              }
            />
          </div>
        );
      })}

      {/* Selection Box */}
      {selectionStart && selectionEnd && (
        <div
          className="absolute z-40 border border-blue-500 bg-blue-500/10"
          style={{
            left: Math.min(selectionStart.x, selectionEnd.x),
            top: Math.min(selectionStart.y, selectionEnd.y),
            width: Math.abs(selectionStart.x - selectionEnd.x),
            height: Math.abs(selectionStart.y - selectionEnd.y),
          }}
        />
      )}

      {/* Node Property Drawer */}
      <NodePropertyDrawer
        open={drawerNodeOpen}
        onOpenChange={(open) => {
          setDrawerNodeOpen(open);
          if (!open) {
            setSelectedNode(null);
          }
        }}
        node={selectedNode}
      />

      {/* Edge Property Drawer */}
      <EdgePropertyDrawer
        open={drawerEdgeOpen}
        onOpenChange={(open) => {
          setDrawerEdgeOpen(open);
          if (!open) {
            setSelectedEdge(null);
          }
        }}
        edge={selectedEdge}
      />
    </div>
  );
};
