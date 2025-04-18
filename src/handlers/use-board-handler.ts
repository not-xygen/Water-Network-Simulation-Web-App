/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import type React from "react";
import { useCallback } from "react";
import type { Node } from "@/store/node-edge";

export const useBoardHandler = ({
  zoom,
  offset,
  setOffset,
  zoomIn,
  zoomOut,
  nodes,
  setSelectedNodes,
  draggedNode,
  selectedNodes,
  setDraggedNode,
  updateNodePosition,
  isDraggingBoardRef,
  lastMousePosRef,
  isSpacePressed,
  selectionStart,
  setSelectionStart,
  selectionEnd,
  setSelectionEnd,
}: {
  zoom: number;
  offset: { x: number; y: number };
  setOffset: (x: number, y: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  nodes: Node[];
  selectedNodes: Node[];
  setSelectedNodes: (nodes: Node[]) => void;
  draggedNode: string | null;
  setDraggedNode: (id: string | null) => void;
  updateNodePosition: (id: string, dx: number, dy: number) => void;
  isDraggingBoardRef: React.MutableRefObject<boolean>;
  lastMousePosRef: React.MutableRefObject<{ x: number; y: number } | null>;
  isSpacePressed: boolean;
  selectionStart: { x: number; y: number } | null;
  setSelectionStart: (pos: { x: number; y: number } | null) => void;
  selectionEnd: { x: number; y: number } | null;
  setSelectionEnd: (pos: { x: number; y: number } | null) => void;
}) => {
  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      event.preventDefault();
      if (event.deltaY > 0) zoomOut();
      else zoomIn();
    },
    [zoomIn, zoomOut],
  );

  const handleBoardMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (
        isSpacePressed &&
        (event.target as HTMLElement).classList.contains("board-background")
      ) {
        isDraggingBoardRef.current = true;
        lastMousePosRef.current = { x: event.clientX, y: event.clientY };
        event.preventDefault();
      }

      if (!isSpacePressed && event.button === 0) {
        const board = document
          .getElementById("board-container")
          ?.getBoundingClientRect();
        if (!board) return;

        setSelectionStart({
          x: event.clientX - board.left,
          y: event.clientY - board.top,
        });
        setSelectionEnd(null);
      }
    },
    [
      isDraggingBoardRef,
      isSpacePressed,
      lastMousePosRef,
      setSelectionEnd,
      setSelectionStart,
    ],
  );

  const handleMouseUp = useCallback(
    (_event: React.MouseEvent) => {
      if (draggedNode) {
        setDraggedNode(null);
      }

      if (selectionStart && selectionEnd) {
        const isNodeInSelectionBox = (
          node: Node,
          zoom: number,
          offset: { x: number; y: number },
          start: { x: number; y: number },
          end: { x: number; y: number },
        ) => {
          const nodeX =
            window.innerWidth / 2 + node.position.x * (zoom / 100) + offset.x;
          const nodeY =
            window.innerHeight / 2 + node.position.y * (zoom / 100) + offset.y;

          const minX = Math.min(start.x, end.x);
          const maxX = Math.max(start.x, end.x);
          const minY = Math.min(start.y, end.y);
          const maxY = Math.max(start.y, end.y);

          return (
            nodeX >= minX && nodeX <= maxX && nodeY >= minY && nodeY <= maxY
          );
        };

        const selected = nodes.filter((node) =>
          isNodeInSelectionBox(
            node,
            zoom,
            offset,
            selectionStart,
            selectionEnd,
          ),
        );

        setSelectedNodes(selected);
      }

      // reset
      setSelectionStart(null);
      setSelectionEnd(null);
      isDraggingBoardRef.current = false;
      lastMousePosRef.current = null;
    },
    [
      draggedNode,
      nodes,
      zoom,
      offset,
      selectionStart,
      selectionEnd,
      setSelectedNodes,
      setSelectionStart,
      setSelectionEnd,
      setDraggedNode,
      isDraggingBoardRef,
      lastMousePosRef,
    ],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (isDraggingBoardRef.current && lastMousePosRef.current) {
        const deltaX = event.clientX - lastMousePosRef.current.x;
        const deltaY = event.clientY - lastMousePosRef.current.y;
        setOffset(offset.x + deltaX, offset.y + deltaY);
        lastMousePosRef.current = { x: event.clientX, y: event.clientY };
      } else if (draggedNode && lastMousePosRef.current) {
        const deltaX = event.clientX - lastMousePosRef.current.x;
        const deltaY = event.clientY - lastMousePosRef.current.y;
        const worldDeltaX = deltaX / (zoom / 100);
        const worldDeltaY = deltaY / (zoom / 100);

        const isInSelected = selectedNodes.some(
          (n: { id: string }) => n.id === draggedNode,
        );
        const nodesToMove = isInSelected
          ? selectedNodes
          : nodes.filter((n) => n.id === draggedNode);

        for (const node of nodesToMove) {
          updateNodePosition(node.id, worldDeltaX, worldDeltaY);
        }

        lastMousePosRef.current = { x: event.clientX, y: event.clientY };
      }

      if (selectionStart) {
        const board = document
          .getElementById("board-container")
          ?.getBoundingClientRect();
        if (!board) return;

        setSelectionEnd({
          x: event.clientX - board.left,
          y: event.clientY - board.top,
        });
      }
    },
    [
      isDraggingBoardRef,
      lastMousePosRef,
      draggedNode,
      selectionStart,
      setOffset,
      offset.x,
      offset.y,
      zoom,
      selectedNodes,
      nodes,
      updateNodePosition,
      setSelectionEnd,
    ],
  );

  return {
    handleWheel,
    handleBoardMouseDown,
    handleMouseUp,
    handleMouseMove,
  };
};
