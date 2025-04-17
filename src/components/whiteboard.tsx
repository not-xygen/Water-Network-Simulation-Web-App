import useGlobalStore from "@/store/globals";
import { useCallback, useRef, useState } from "react";
import type { MouseEvent } from "react";

import { NodeItem } from "./node-item";

import type { Edge, Node } from "@/store/node-edge";
import useNodeEdgeStore from "@/store/node-edge";
import { NodePropertyDrawer } from "./node-property-drawer";
import { RotateCcw } from "lucide-react";
import { EdgePropertyDrawer } from "./edge-property-drawer";

export const Whiteboard = () => {
  const { zoom, offset, setOffset, zoomIn, zoomOut } = useGlobalStore();
  const { nodes, updateNodePosition, updateNodeRotation, edges, addEdge } =
    useNodeEdgeStore();

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

  console.log(drawerEdgeOpen);

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

  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      event.preventDefault();
      if (event.deltaY > 0) zoomOut();
      else zoomIn();
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

  const handleMouseUp = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    (_event: MouseEvent) => {
      if (draggedNode) {
        setDraggedNode(null);
      }

      isDraggingBoardRef.current = false;
      lastMousePosRef.current = null;
    },
    [draggedNode],
  );

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
      lastMousePosRef.current = { x: event.clientX, y: event.clientY };
      setDraggedNode(nodeId);

      const clickedNode = nodes.find((n) => n.id === nodeId);
      if (!clickedNode) return;

      const startX = event.clientX;
      const startY = event.clientY;

      const handleMouseUp = (e: globalThis.MouseEvent) => {
        const dx = Math.abs(e.clientX - startX);
        const dy = Math.abs(e.clientY - startY);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
          setSelectedNode(clickedNode);
          setDrawerNodeOpen(true);
        }

        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mouseup", handleMouseUp);
    },
    [nodes],
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

  const getHandlePosition = useCallback(
    (nodeId: string, position: "left" | "right" | "top" | "bottom") => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return null;

      const { x, y } = worldToScreen(node);
      const visualOffset = (32 * zoom) / 100;
      const rotationDeg = node.data.rotation ?? 0;
      const rotationRad = (rotationDeg * Math.PI) / 180;

      // Basis offset
      let dx = 0;
      let dy = 0;

      switch (position) {
        case "left":
          dx = -visualOffset;
          dy = 0;
          break;
        case "right":
          dx = visualOffset;
          dy = 0;
          break;
        case "top":
          dx = 0;
          dy = -visualOffset;
          break;
        case "bottom":
          dx = 0;
          dy = visualOffset;
          break;
      }

      const rotatedX = dx * Math.cos(rotationRad) - dy * Math.sin(rotationRad);
      const rotatedY = dx * Math.sin(rotationRad) + dy * Math.cos(rotationRad);

      return {
        x: x + rotatedX,
        y: y + rotatedY,
      };
    },
    [nodes, worldToScreen, zoom],
  );

  const handleStartRotate = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault();

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setRotatingNodeId(nodeId);

    const centerX =
      window.innerWidth / 2 + node.position.x * (zoom / 100) + offset.x;
    const centerY =
      window.innerHeight / 2 + node.position.y * (zoom / 100) + offset.y;

    const dxStart = e.clientX - centerX;
    const dyStart = e.clientY - centerY;
    const initialCursorAngle = Math.atan2(dyStart, dxStart) * (180 / Math.PI);

    const initialNodeAngle = node.data.rotation ?? 0;

    const rotateMove = (moveEvent: globalThis.MouseEvent) => {
      const dx = moveEvent.clientX - centerX;
      const dy = moveEvent.clientY - centerY;

      const currentCursorAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      const deltaAngle = currentCursorAngle - initialCursorAngle;
      const rawAngle = initialNodeAngle + deltaAngle;

      const finalAngle = moveEvent.shiftKey
        ? Math.round(rawAngle / 45) * 45
        : rawAngle;

      updateNodeRotation(nodeId, finalAngle);
    };

    const rotateEnd = () => {
      setRotatingNodeId(null);
      window.removeEventListener("mousemove", rotateMove);
      window.removeEventListener("mouseup", rotateEnd);
    };

    window.addEventListener("mousemove", rotateMove);
    window.addEventListener("mouseup", rotateEnd);
  };

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
        const isRotating = rotatingNodeId === node.id;

        return (
          <div key={node.id} className="absolute group">
            {/* Rotate Handle */}
            <div
              className={`absolute z-50 rounded-full cursor-rotate transition-opacity opacity-0 group-hover:opacity-100 bg-blue-500 ${
                isRotating ? "pointer-events-none opacity-100" : ""
              }`}
              onMouseDown={(e) => handleStartRotate(e, node.id)}
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: `translate(-50%, -50%) rotate(${
                  node.data.rotation ?? 0
                }deg) translateY(-${(32 * zoom) / 100 + 32}px)`,
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
              isDragged={draggedNode === node.id}
              onMouseDown={handleNodeMouseDown}
              onMouseUp={handleMouseUp}
              onStartConnect={handleStartConnection}
              onEndConnect={handleEndConnection}
            />
          </div>
        );
      })}

      {/* Connection lines */}
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: <intended> */}
      <svg className="fixed top-0 left-0 z-40 w-screen h-screen pointer-events-none">
        {edges.map((edge) => {
          const sourcePos = getHandlePosition(edge.sourceId, "right");
          const targetPos = getHandlePosition(edge.targetId, "left");

          if (!sourcePos || !targetPos) return null;

          return (
            // biome-ignore lint/a11y/useKeyWithClickEvents: SVG element cannot be focused anyway
            <line
              key={edge.id}
              x1={sourcePos.x}
              y1={sourcePos.y}
              x2={targetPos.x}
              y2={targetPos.y}
              stroke="#3b82f6"
              strokeWidth={12 * (zoom / 100)}
              onClick={() => {
                setSelectedEdge(edge);
                setDrawerEdgeOpen(true);
              }}
              style={{ cursor: "pointer", pointerEvents: "stroke" }}
            />
          );
        })}
      </svg>

      {/* Connection in progress */}
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: <intended> */}
      <svg className="fixed top-0 left-0 z-40 w-screen h-screen pointer-events-none">
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
                strokeWidth={12 * (zoom / 100)}
                strokeDasharray="5,5"
              />
            );
          })()}
      </svg>

      {/* Node Property Drawer */}
      <NodePropertyDrawer
        open={drawerNodeOpen}
        onOpenChange={setDrawerNodeOpen}
        node={selectedNode}
      />

      {/* Edge Property Drawer */}
      <EdgePropertyDrawer
        open={drawerEdgeOpen}
        onOpenChange={setDrawerEdgeOpen}
        edge={selectedEdge}
      />
    </div>
  );
};
