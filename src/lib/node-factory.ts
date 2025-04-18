import { nanoid } from "nanoid";
import type { Node } from "@/store/node-edge";

export const createNode = (
  type: string,
  offset: { x: number; y: number },
  zoom: number,
  label = "Node",
): Node => {
  return {
    id: `${type.charAt(0)}-${nanoid(12)}`,
    type,
    data: { label, rotation: 0 },
    position: {
      x: -offset.x / (zoom / 100),
      y: -offset.y / (zoom / 100),
    },
  };
};
