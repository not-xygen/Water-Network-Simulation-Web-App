/* eslint-disable no-unused-vars */
import { useCallback } from "react";
import type { Edge } from "@/store/node-edge";

export const useConnectionHandler = ({
  addEdge,
  edges,
  connecting,
  setConnecting,
  setMousePos,
  updateEdgeConnection,
  isConnectingRef,
  setDraggingEdgeHandle,
}: {
  addEdge: (edge: Edge) => void;
  edges: Edge[];
  connecting: {
    sourceId: string;
    sourcePosition: "left" | "right" | "top" | "bottom";
  } | null;
  setConnecting: (
    connecting: {
      sourceId: string;
      sourcePosition: "left" | "right" | "top" | "bottom";
    } | null,
  ) => void;
  setMousePos: (pos: { x: number; y: number } | null) => void;
  updateEdgeConnection: (
    edgeId: string,
    args: {
      from: "source" | "target";
      newNodeId: string;
      newPosition: "left" | "right" | "top" | "bottom";
    },
  ) => void;
  isConnectingRef: React.MutableRefObject<boolean>;
  setDraggingEdgeHandle: (
    handle: {
      edgeId: string;
      type: "source" | "target";
    } | null,
  ) => void;
}) => {
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
      setConnecting({
        sourceId: nodeId,
        sourcePosition: position,
      });

      setMousePos({ x: startX, y: startY });

      const handleMouseMove = (e: globalThis.MouseEvent) => {
        const moveX = e.clientX - (boardRect?.left ?? 0);
        const moveY = e.clientY - (boardRect?.top ?? 0);
        setMousePos({ x: moveX, y: moveY });
      };

      const handleMouseUp = (e: globalThis.MouseEvent) => {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        const handle = target?.closest("[data-handle]") as HTMLElement | null;

        const targetId = handle
          ?.closest("[data-node-id]")
          ?.getAttribute("data-node-id");
        const pos = handle?.getAttribute("data-position") as
          | "left"
          | "right"
          | "top"
          | "bottom";

        if (!connecting) return;

        if (targetId && targetId !== connecting.sourceId) {
          addEdge({
            id: `edge-${connecting.sourceId}-${targetId}`,
            sourceId: connecting.sourceId,
            targetId,
            sourcePosition: connecting.sourcePosition,
            targetPosition: pos ?? "left",
          });
        }

        isConnectingRef.current = false;
        setConnecting(null);
        setMousePos(null);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [addEdge, connecting, isConnectingRef, setConnecting, setMousePos],
  );

  const handleEndConnection = useCallback(
    (
      event: React.MouseEvent,
      nodeId: string,
      position: "left" | "right" | "top" | "bottom",
    ) => {
      event.stopPropagation();

      if (!connecting || connecting.sourceId === nodeId) {
        setConnecting(null);
        setMousePos(null);
        return;
      }

      const edgeExists = edges.some(
        (e) =>
          (e.sourceId === connecting.sourceId && e.targetId === nodeId) ||
          (e.sourceId === nodeId && e.targetId === connecting.sourceId),
      );

      if (edgeExists) {
        console.warn("Edge sudah ada, tidak bisa membuat koneksi ganda.");
        return;
      }
      addEdge({
        id: `edge-${connecting.sourceId}-${nodeId}`,
        sourceId: connecting.sourceId,
        targetId: nodeId,
        sourcePosition: connecting.sourcePosition,
        targetPosition: position,
      });

      setConnecting(null);
      setMousePos(null);
    },
    [connecting, edges, addEdge, setConnecting, setMousePos],
  );

  const handleStartEdgeReconnect = useCallback(
    (e: React.MouseEvent, edgeId: string, from: "source" | "target") => {
      e.stopPropagation();
      e.preventDefault();

      const boardRect = document
        .getElementById("board-container")
        ?.getBoundingClientRect();

      const startX = e.clientX - (boardRect?.left ?? 0);
      const startY = e.clientY - (boardRect?.top ?? 0);

      setDraggingEdgeHandle({ edgeId, type: from });
      setMousePos({ x: startX, y: startY });

      const handleMouseMove = (e: globalThis.MouseEvent) => {
        const moveX = e.clientX - (boardRect?.left ?? 0);
        const moveY = e.clientY - (boardRect?.top ?? 0);
        setMousePos({ x: moveX, y: moveY });
      };

      const handleMouseUp = (e: globalThis.MouseEvent) => {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        const handle = target?.closest("[data-handle]") as HTMLElement | null;

        const targetId = handle?.getAttribute("data-node-id");
        const pos = handle?.getAttribute("data-position") as
          | "left"
          | "right"
          | "top"
          | "bottom";

        if (handle && targetId) {
          updateEdgeConnection(edgeId, {
            from,
            newNodeId: targetId,
            newPosition: pos,
          });
        }

        setDraggingEdgeHandle(null);
        setMousePos(null);
        window.removeEventListener("pointermove", handleMouseMove);
        window.removeEventListener("pointerup", handleMouseUp);
      };

      window.addEventListener("pointermove", handleMouseMove);
      window.addEventListener("pointerup", handleMouseUp);
    },
    [setDraggingEdgeHandle, setMousePos, updateEdgeConnection],
  );

  return {
    handleStartConnection,
    handleEndConnection,
    handleStartEdgeReconnect,
  };
};
