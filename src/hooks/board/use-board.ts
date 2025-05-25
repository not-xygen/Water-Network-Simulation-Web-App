import useGlobalStore from "@/store/globals";
import useNodeEdgeStore from "@/store/node-edge";
import type { Node } from "@/types/node-edge";
/* eslint-disable no-unused-vars */
import { useCallback, useRef } from "react";
import type React from "react";

type UseBoardHandlerProps = {
  draggedNode: string | null;
  setDraggedNode: (id: string | null) => void;
  isDraggingBoardRef: React.MutableRefObject<boolean>;
  lastMousePosRef: React.MutableRefObject<{ x: number; y: number } | null>;
  isSpacePressed: boolean;
  selectionStart: { x: number; y: number } | null;
  setSelectionStart: (pos: { x: number; y: number } | null) => void;
  selectionEnd: { x: number; y: number } | null;
  setSelectionEnd: (pos: { x: number; y: number } | null) => void;
  setConnecting: React.Dispatch<
    React.SetStateAction<{
      sourceId: string;
      sourcePosition: "left" | "right" | "top" | "bottom";
    } | null>
  >;
  setMousePos: (value: { x: number; y: number } | null) => void;
};

export const useBoardHandler = ({
  draggedNode,
  setDraggedNode,
  isDraggingBoardRef,
  lastMousePosRef,
  isSpacePressed,
  selectionStart,
  setSelectionStart,
  selectionEnd,
  setSelectionEnd,
  setConnecting,
  setMousePos,
}: UseBoardHandlerProps) => {
  const { zoom, zoomIn, zoomOut, offset, setOffset } = useGlobalStore();

  const {
    nodes,
    updateNodePosition,
    selectedNodes,
    setSelectedNodes,
    setSelectedEdges,
  } = useNodeEdgeStore();
  const initialNodePositionsRef = useRef(new Map());

  const handleBoardMouseWheel = useCallback(
    (event: React.WheelEvent) => {
      if (event.deltaY > 0) zoomOut();
      else zoomIn();
    },
    [zoomIn, zoomOut],
  );

  const handleBoardMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
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
        }

        const board = document.getElementById("board")?.getBoundingClientRect();
        if (!board) return;

        setSelectionStart({
          x: event.clientX - board.left,
          y: event.clientY - board.top,
        });
        setSelectionEnd(null);

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
      setSelectedEdges,
      setSelectedNodes,
      setSelectionEnd,
      setSelectionStart,
    ],
  );

  const handleBoardMouseUp = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();

      if (draggedNode) {
        setDraggedNode(null);
      }

      if (typeof setConnecting === "function") setConnecting(null);
      if (typeof setMousePos === "function") setMousePos(null);

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
      setConnecting,
      setMousePos,
    ],
  );

  const handleBoardMouseMove = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
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

        const isInSelected = selectedNodes.some((n) => n.id === draggedNode);
        const nodesToMove = isInSelected
          ? selectedNodes
          : nodes.filter((n) => n.id === draggedNode);

        for (const node of nodesToMove) {
          let targetX = node.position.x + worldDeltaX;
          let targetY = node.position.y + worldDeltaY;

          if (event.shiftKey) {
            const gridSize = 5;
            targetX = Math.round(targetX / gridSize) * gridSize;
            targetY = Math.round(targetY / gridSize) * gridSize;
          }

          const dx = targetX - node.position.x;
          const dy = targetY - node.position.y;

          updateNodePosition(node.id, dx, dy);
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
