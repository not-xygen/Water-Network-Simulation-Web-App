import type { Node, NodeType, Edge } from "@/types/node-edge";
import { nanoid } from "nanoid";

export const createNode = (
  type: NodeType,
  subtype: string,
  offset: { x: number; y: number },
  zoom: number,
  label = "Node",
): Node => {
  return {
    id: `${type.charAt(0)}-${nanoid(12)}`,
    type,
    subtype,
    label,
    position: {
      x: -offset.x / (zoom / 100),
      y: -offset.y / (zoom / 100),
    },
    rotation: 0,
    elevation: 0,
    ...(type === "fitting" && { demand: 0 }),
    ...(type === "reservoir" && { head: 10 }),
    ...(type === "tank" && {
      level: 0,
      minLevel: 0,
      maxLevel: 10,
    }),
    ...(type === "pump" && { curve: "" }),
    ...(type === "valve" && { status: "close" }),
    flowRate: 0,
    pressure: 0,
    active: true,
    note: "",
  } as Node;
};

export const createEdge = (
  sourceId: string,
  targetId: string,
  sourcePosition: "left" | "right" | "top" | "bottom",
  targetPosition: "left" | "right" | "top" | "bottom",
  options?: Partial<Pick<Edge, "label" | "diameter" | "length" | "roughness">>,
): Edge => {
  return {
    id: `e-${nanoid(12)}`,
    sourceId,
    targetId,
    sourcePosition,
    targetPosition,
    label: options?.label ?? "Pipe",
    diameter: options?.diameter ?? 2,
    length: options?.length ?? 0,
    roughness: options?.roughness ?? 140,
    flowRate: 0,
    velocity: 0,
  };
};
