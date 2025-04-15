import useGlobalStore from "@/store/globals";
import { useCallback, useRef, useState } from "react";
import type { MouseEvent } from "react";
import type { Node } from "@/store/globals";

export const BoardComponent = () => {
  const {
    zoom,
    offset,
    setOffset,
    zoomIn,
    zoomOut,
    nodes,
    updateNodePosition,
  } = useGlobalStore();

  const isDraggingBoardRef = useRef(false);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

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

  const worldToScreen = useCallback(
    (node: Node) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const screenX = centerX + node.x * (zoom / 100) + offset.x;
      const screenY = centerY + node.y * (zoom / 100) + offset.y;
      return { x: screenX, y: screenY };
    },
    [zoom, offset],
  );

  return (
    <div
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
          <div
            key={node.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-50 cursor-move
                      ${
                        node.type === "junction"
                          ? "bg-blue-500 rounded-full"
                          : ""
                      }
                      ${node.type === "pipe" ? "bg-red-500 rounded-md" : ""}
                      ${
                        node.type === "circle"
                          ? "bg-green-500 rounded-full"
                          : ""
                      }
                      ${
                        node.type === "square"
                          ? "bg-purple-500 rounded-md"
                          : ""
                      }`}
            style={{
              left: `${x}px`,
              top: `${y}px`,
              width: node.type === "pipe" ? "30px" : "20px",
              height: node.type === "pipe" ? "15px" : "20px",
              boxShadow:
                draggedNode === node.id
                  ? "0 0 0 2px white, 0 0 0 4px #3b82f6"
                  : "",
              zIndex: draggedNode === node.id ? 100 : 50,
            }}
            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}>
            <div className="flex items-center justify-center w-full h-full text-xs text-white select-none">
              {node.type.charAt(0).toUpperCase()}
            </div>
          </div>
        );
      })}
    </div>
  );
};
