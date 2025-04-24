import { useCallback } from "react";

import useGlobalStore from "@/store/globals";
import useNodeEdgeStore from "@/store/node-edge";

import type { Node } from "@/store/node-edge";
export const useHandlePosition = () => {
  const { nodes } = useNodeEdgeStore();
  const { zoom, offset } = useGlobalStore();

  const getWorldToScreen = useCallback(
    (node: Node) => {
      const boardRect = document
        .getElementById("board")
        ?.getBoundingClientRect();
      if (!boardRect) return { x: 0, y: 0 };

      const centerX = boardRect.width / 2;
      const centerY = boardRect.height / 2;
      const screenX = centerX + node.position.x * (zoom / 100) + offset.x;
      const screenY = centerY + node.position.y * (zoom / 100) + offset.y;
      return { x: screenX, y: screenY };
    },
    [zoom, offset],
  );

  const getHandlePosition = useCallback(
    (nodeId: string, position: "left" | "right" | "top" | "bottom") => {
      const node = nodes.find((n: Node) => n.id === nodeId);
      if (!node) return null;

      const { x, y } = getWorldToScreen(node);
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
    [nodes, zoom, getWorldToScreen],
  );

  return { getWorldToScreen, getHandlePosition };
};
