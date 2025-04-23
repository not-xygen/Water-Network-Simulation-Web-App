/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { useRef, useCallback } from "react";
import type React from "react";
import type { Edge, Node } from "@/store/node-edge";

export const useBoardHandler = ({
  zoom,
  offset,
  setOffset,
  zoomIn,
  zoomOut,
  nodes,
  draggedNode,
  setSelectedNode,
  selectedNodes,
  setSelectedNodes,
  setSelectedEdge,
  setSelectedEdges,
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
  setSelectedNode: (nodes: Node | null) => void;
  selectedNodes: Node[];
  setSelectedNodes: (nodes: Node[]) => void;
  setSelectedEdge: (edge: Edge | null) => void;
  setSelectedEdges: (edges: Edge[]) => void;
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
  const initialNodePositionsRef = useRef(new Map());

  const handleBoardMouseWheel = useCallback(
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
        const target = event.target as HTMLElement;
        const isInNode = target.closest("[data-node-id]");
        const isInHandle = target.closest("[data-handle]");

        if (!isInNode && !isInHandle) {
          setSelectedNodes([]);
          setSelectedEdges([]);
          setSelectedNode(null);
          setSelectedEdge(null);
        }

        const board = document.getElementById("board")?.getBoundingClientRect();
        if (!board) return;

        setSelectionStart({
          x: event.clientX - board.left,
          y: event.clientY - board.top,
        });
        setSelectionEnd(null);

        // Simpan posisi awal node
        for (const node of selectedNodes) {
          initialNodePositionsRef.current.set(node.id, {
            x: node.position.x,
            y: node.position.y,
          });
        }
      }
    },
    [
      isDraggingBoardRef,
      isSpacePressed,
      lastMousePosRef,
      selectedNodes,
      setSelectedEdge,
      setSelectedEdges,
      setSelectedNode,
      setSelectedNodes,
      setSelectionEnd,
      setSelectionStart,
    ],
  );

  const handleBoardMouseUp = useCallback(
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
          const boardRect = document
            .getElementById("board")
            ?.getBoundingClientRect();
          if (!boardRect) return;

          const nodeX =
            boardRect.width / 2 + node.position.x * (zoom / 100) + offset.x;
          const nodeY =
            boardRect.height / 2 + node.position.y * (zoom / 100) + offset.y;

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

      setSelectionStart(null);
      setSelectionEnd(null);

      // Simpan posisi awal node
      for (const node of selectedNodes) {
        initialNodePositionsRef.current.set(node.id, {
          x: node.position.x,
          y: node.position.y,
        });
      }
      isDraggingBoardRef.current = false;
      lastMousePosRef.current = null;
    },
    [
      draggedNode,
      selectionStart,
      selectionEnd,
      setSelectionStart,
      setSelectionEnd,
      isDraggingBoardRef,
      lastMousePosRef,
      setDraggedNode,
      nodes,
      setSelectedNodes,
      zoom,
      offset,
      selectedNodes,
    ],
  );

  const handleBoardMouseMove = useCallback(
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
          let targetX = node.position.x + worldDeltaX;
          let targetY = node.position.y + worldDeltaY;

          if (event.shiftKey) {
            const gridSize = 20;
            targetX = Math.round(targetX / gridSize) * gridSize;
            targetY = Math.round(targetY / gridSize) * gridSize;
          }

          const deltaX = targetX - node.position.x;
          const deltaY = targetY - node.position.y;

          updateNodePosition(node.id, deltaX, deltaY);
        }

        lastMousePosRef.current = { x: event.clientX, y: event.clientY };
      }

      if (selectionStart) {
        const board = document.getElementById("board")?.getBoundingClientRect();
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
    handleBoardMouseWheel,
    handleBoardMouseDown,
    handleBoardMouseUp,
    handleBoardMouseMove,
  };
};
