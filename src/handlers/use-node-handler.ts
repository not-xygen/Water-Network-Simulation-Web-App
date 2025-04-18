/* eslint-disable no-unused-vars */
import type { Edge, Node } from "@/store/node-edge";
import type React from "react";
import { useCallback } from "react";

export const useNodeHandler = ({
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
  selectedNodes,
  setSelectedNodes,
  setSelectedEdges,
}: {
  nodes: Node[];
  zoom: number;
  mode: "drag" | "connect";
  offset: { x: number; y: number };
  setRotatingNodeId: (id: string | null) => void;
  updateNodeRotation: (id: string, angle: number) => void;
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>;
  setSelectedEdge: React.Dispatch<React.SetStateAction<Edge | null>>;
  setDrawerNodeOpen: (open: boolean) => void;
  setDrawerEdgeOpen: (open: boolean) => void;
  setDraggedNode: (id: string | null) => void;
  lastMousePosRef: React.MutableRefObject<{ x: number; y: number } | null>;
  selectedNodes: Node[];
  setSelectedNodes: (nodes: Node[]) => void;
  selectedEdges: Edge[];
  setSelectedEdges: (edges: Edge[]) => void;
}) => {
  const handleNodeMouseDown = useCallback(
    (event: React.MouseEvent, nodeId: string) => {
      event.stopPropagation();
      event.preventDefault();

      if (mode !== "drag") return;

      const startX = event.clientX;
      const startY = event.clientY;
      lastMousePosRef.current = { x: startX, y: startY };
      setDraggedNode(nodeId);

      const clickedNode = nodes.find((n) => n.id === nodeId);
      if (!clickedNode) return;

      let didDrag = false;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = Math.abs(moveEvent.clientX - startX);
        const dy = Math.abs(moveEvent.clientY - startY);
        if (dx > 2 || dy > 2) didDrag = true;
      };

      const handleMouseUp = (e: MouseEvent) => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);

        if (didDrag) return;

        if (e.ctrlKey || e.metaKey) {
          const already = selectedNodes.find((n) => n.id === clickedNode.id);
          if (already) {
            setSelectedNodes(
              selectedNodes.filter((n) => n.id !== clickedNode.id),
            );
          } else {
            setSelectedNodes([...selectedNodes, clickedNode]);
          }
          setSelectedEdges([]);
        } else {
          setSelectedNodes([clickedNode]);
          setSelectedEdges([]);
          setSelectedNode(clickedNode);
          setDrawerNodeOpen(true);
        }
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [
      mode,
      lastMousePosRef,
      nodes,
      selectedNodes,
      setSelectedNodes,
      setSelectedEdges,
      setSelectedNode,
      setDrawerNodeOpen,
      setDraggedNode,
    ],
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

    const initialNodeAngle = node.rotation ?? 0;

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

  return {
    handleNodeMouseDown,
    handleStartRotate,
  };
};
