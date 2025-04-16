import useGlobalStore from "@/store/globals";
import { useCallback, useRef, useState } from "react";
import type { MouseEvent } from "react";

import { NodeItem } from "./node-item";

import type { Node } from "@/store/node-edge";
import useNodeEdgeStore from "@/store/node-edge";

export const Whiteboard = () => {
  const { zoom, offset, setOffset, zoomIn, zoomOut } = useGlobalStore();
  const { nodes, updateNodePosition, edges, addEdge } = useNodeEdgeStore();

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

  const NODE_WIDTH = 100;
  const HANDLE_OFFSET = NODE_WIDTH / 2;

  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      event.preventDefault();
      if (event.deltaY < 0) zoomIn();
      else zoomOut();
    },
    [zoomIn, zoomOut],
  );

  const handleBoardMouseDown = useCallback((event: MouseEvent) => {
    if ((event.target as HTMLElement).classList.contains("board-background")) {
      isDraggingBoardRef.current = true;
      lastMousePosRef.current = { x: event.clientX, y: event.clientY };
      event.preventDefault();
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingBoardRef.current = false;
    setDraggedNode(null);
    lastMousePosRef.current = null;
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      // Case 1: Dragging the board
      if (isDraggingBoardRef.current && lastMousePosRef.current) {
        const deltaX = event.clientX - lastMousePosRef.current.x;
        const deltaY = event.clientY - lastMousePosRef.current.y;

        setOffset(offset.x + deltaX, offset.y + deltaY);

        lastMousePosRef.current = { x: event.clientX, y: event.clientY };
      }

      // Case 2: Dragging a node
      else if (draggedNode && lastMousePosRef.current) {
        const deltaX = event.clientX - lastMousePosRef.current.x;
        const deltaY = event.clientY - lastMousePosRef.current.y;

        const worldDeltaX = deltaX / (zoom / 100);
        const worldDeltaY = deltaY / (zoom / 100);

        updateNodePosition(draggedNode, worldDeltaX, worldDeltaY);
        lastMousePosRef.current = { x: event.clientX, y: event.clientY };
      }
    },
    [offset, setOffset, draggedNode, zoom, updateNodePosition],
  );

  const handleNodeMouseDown = useCallback(
    (event: MouseEvent, nodeId: string) => {
      event.stopPropagation();
      setDraggedNode(nodeId);
      lastMousePosRef.current = { x: event.clientX, y: event.clientY };
    },
    [],
  );

  const handleStartConnection = useCallback(
    (
      event: React.MouseEvent,
      nodeId: string,
      position: "left" | "right" | "top" | "bottom",
    ) => {
      event.stopPropagation();

      const boardRect = document
        .getElementById("board-container")
        ?.getBoundingClientRect();

      const startX = event.clientX - (boardRect?.left ?? 0);
      const startY = event.clientY - (boardRect?.top ?? 0);

      isConnectingRef.current = true;
      setConnecting({ sourceId: nodeId, sourcePosition: position });
      setMousePos({ x: startX, y: startY });

      const handleMouseMove = (e: globalThis.MouseEvent) => {
        const moveX = e.clientX - (boardRect?.left ?? 0);
        const moveY = e.clientY - (boardRect?.top ?? 0);
        setMousePos({ x: moveX, y: moveY });
      };

      const handleMouseUp = (e: globalThis.MouseEvent) => {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        const parent = target?.closest("[data-node-id]") as HTMLElement | null;
        const targetId = parent?.getAttribute("data-node-id");

        if (
          target?.hasAttribute("data-handle") &&
          targetId &&
          targetId !== nodeId
        ) {
          addEdge({
            id: `edge-${nodeId}-${targetId}`,
            sourceId: nodeId,
            targetId: targetId,
          });
        }

        isConnectingRef.current = false;
        setConnecting(null);
        setMousePos(null);
        window.removeEventListener(
          "mousemove",
          handleMouseMove as EventListener,
        );
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [addEdge],
  );

  const handleEndConnection = useCallback(
    (
      event: React.MouseEvent,
      nodeId: string,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      _position: "left" | "right" | "top" | "bottom",
    ) => {
      event.stopPropagation();
      if (
        connecting &&
        connecting.sourceId !== nodeId &&
        !edges.find(
          (e) =>
            (e.sourceId === connecting.sourceId && e.targetId === nodeId) ||
            (e.sourceId === nodeId && e.targetId === connecting.sourceId),
        )
      ) {
        addEdge({
          id: `edge-${connecting.sourceId}-${nodeId}`,
          sourceId: connecting.sourceId,
          targetId: nodeId,
        });
      }

      setConnecting(null);
      setMousePos(null);
    },
    [connecting, edges, addEdge],
  );

  const worldToScreen = useCallback(
    (node: Node) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const screenX = centerX + node.position.x * (zoom / 100) + offset.x;
      const screenY = centerY + node.position.y * (zoom / 100) + offset.y;
      return { x: screenX, y: screenY };
    },
    [zoom, offset],
  );

  const getHandlePosition = useCallback(
    (nodeId: string, position: "left" | "right") => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return null;

      const { x, y } = worldToScreen(node);

      if (position === "left") {
        return { x: x - HANDLE_OFFSET, y };
      }
      if (position === "right") {
        return { x: x + HANDLE_OFFSET, y };
      }

      return { x, y };
    },
    [HANDLE_OFFSET, nodes, worldToScreen],
  );

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
          cursor: isDraggingBoardRef.current ? "grabbing" : "grab",
        }}
      />

      {/* Nodes */}
      {nodes.map((node) => {
        const { x, y } = worldToScreen(node);
        return (
          <NodeItem
            key={node.id}
            node={node}
            x={x}
            y={y}
            isDragged={draggedNode === node.id}
            onMouseDown={handleNodeMouseDown}
            onMouseUp={handleMouseUp}
            onStartConnect={handleStartConnection}
            onEndConnect={handleEndConnection}
          />
        );
      })}

      {/* Connection lines */}
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: <intended> */}
      <svg className="fixed top-0 left-0 z-10 w-screen h-screen pointer-events-none">
        {edges.map((edge) => {
          const sourcePos = getHandlePosition(edge.sourceId, "right");
          const targetPos = getHandlePosition(edge.targetId, "left");

          if (!sourcePos || !targetPos) return null;

          return (
            <line
              key={edge.id}
              x1={sourcePos.x}
              y1={sourcePos.y}
              x2={targetPos.x}
              y2={targetPos.y}
              stroke="#3b82f6"
              strokeWidth={2}
            />
          );
        })}
      </svg>

      {/* Connection in progress */}
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: <intended> */}
      <svg className="fixed top-0 left-0 z-10 w-screen h-screen pointer-events-none">
        {connecting &&
          mousePos &&
          (() => {
            const sourceNode = nodes.find((n) => n.id === connecting.sourceId);
            if (!sourceNode) return null;

            const sourcePos = getHandlePosition(
              connecting.sourceId,
              connecting.sourcePosition as "left" | "right",
            );

            if (!sourcePos) return null;

            return (
              <line
                x1={sourcePos.x}
                y1={sourcePos.y}
                x2={mousePos.x}
                y2={mousePos.y}
                stroke="gray"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            );
          })()}
      </svg>
    </div>
  );
};
