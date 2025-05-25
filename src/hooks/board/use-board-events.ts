import { useBoardHandler } from "@/hooks/board/use-board";
import { useConnectionHandler } from "@/hooks/use-connection";
import { useNodeHandler } from "@/hooks/use-node";
import useGlobalStore from "@/store/globals";
import useNodeEdgeStore from "@/store/node-edge";
import { useEffect, useRef, useState } from "react";

type UseBoardEventsProps = {
  isSpacePressed: boolean;
};

export const useBoardEvents = ({ isSpacePressed }: UseBoardEventsProps) => {
  const { zoom, offset } = useGlobalStore();
  const {
    removeNode,
    removeEdge,
    selectedNodes,
    setSelectedNodes,
    selectedEdges,
    setSelectedEdges,
    updateEdgeConnection,
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
    setConnecting,
    setMousePos,
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
    setDraggedNode,
    lastMousePosRef,
    connecting,
  });

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

  return {
    zoom,
    offset,
    isDraggingBoardRef,
    draggedNode,
    connecting,
    mousePos,
    draggingEdgeHandle,
    selectionStart,
    selectionEnd,
    handleBoardMouseWheel,
    handleBoardMouseDown,
    handleBoardMouseUp,
    handleBoardMouseMove,
    handleConnectionStart,
    handleConnectionEnd,
    handleEdgeReconnection,
    handleNodeMouseDown,
    handleNodeStartRotate,
  };
};
