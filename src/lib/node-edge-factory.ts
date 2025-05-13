import { FITTING_COEFFICIENTS } from "@/constant/globals";
import type { Edge, Node, NodeType } from "@/types/node-edge";
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
    elevation: 1,
    ...(type === "fitting" && {
      demand: 0,
      diameter: 2,
      inletPressure: 0,
      outletPressure: 0,
      minorLossCoefficient:
        FITTING_COEFFICIENTS[subtype as keyof typeof FITTING_COEFFICIENTS] ||
        FITTING_COEFFICIENTS.default,
      velocity: 0,
    }),
    ...(type === "reservoir" && { head: 10 }),
    ...(type === "tank" && {
      currentVolumeHeight: 0,
      diameter: 83,
      height: 110,
      maxVolume: Math.PI * (83 / 100 / 2) ** 2 * (110 / 100) * 1000,
      currentVolume: 0,
      filledPercentage: 0,
    }),
    ...(type === "pump" && {
      suctionHeadMax: 9,
      totalHeadMax: 33,
      capacityMax: 33,
      curveHead: [10, 20],
      curveFlow: [18, 10],
      suctionPipeDiameter: 3,
      dischargePipeDiameter: 3,
    }),
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
