import { useCallback } from "react";
import type { Node } from "@/store/node-edge";

export const useHandlePosition = ({
  nodes,
  zoom,
  offset,
}: {
  nodes: Node[];
  zoom: number;
  offset: { x: number; y: number };
}) => {
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
    (nodeId: string, position: "left" | "right" | "top" | "bottom") => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return null;

      const { x, y } = worldToScreen(node);
      const visualOffset = (32 * zoom) / 100;
      const rotationDeg = node.rotation ?? 0;
      const rotationRad = (rotationDeg * Math.PI) / 180;

      let dx = 0;
      let dy = 0;

      switch (position) {
        case "left":
          dx = -visualOffset;
          break;
        case "right":
          dx = visualOffset;
          break;
        case "top":
          dy = -visualOffset;
          break;
        case "bottom":
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
    [nodes, zoom, worldToScreen],
  );

  return { worldToScreen, getHandlePosition };
};
