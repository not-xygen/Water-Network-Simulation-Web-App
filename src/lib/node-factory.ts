import type { Node } from "@/store/node-edge";

export const createNode = (
  type: string,
  offset: { x: number; y: number },
  zoom: number,
  label = "Node",
): Node => {
  return {
    id: `${type}-${Date.now()}`,
    type,
    data: { label },
    position: {
      x: -offset.x / (zoom / 100),
      y: -offset.y / (zoom / 100),
    },
  };
};
