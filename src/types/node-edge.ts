import { FITTING_COEFFICIENTS } from "@/constant/globals";

export type NodeType = "fitting" | "reservoir" | "tank" | "pump" | "valve";

export type NodeBase = {
  id: string;
  type: NodeType;
  subtype?: string;
  label?: string;
  position: { x: number; y: number };
  rotation: number; // [deg]
  elevation: number; // [m]
  flowRate: number; // [L/s]
  inletPressure: number; // [bar]
  outletPressure: number; // [bar]
  velocity: number; // [m/s]
  active: boolean;
  note?: string;
};

export type FittingNode = NodeBase & {
  type: "fitting";
  subtype: keyof typeof FITTING_COEFFICIENTS;
  diameter: number; // [cm]
  minorLossCoefficient?: number; // [C]
  demand?: number; // [L/s]
};

export type ReservoirNode = NodeBase & {
  type: "reservoir";
  head: number; // [m]
};

export type TankNode = NodeBase & {
  type: "tank";
  inletDiameter: number; // [cm]
  outletDiameter: number; // [cm]
  tankDiameter: number; // [cm]
  tankHeight: number; // [cm]
  maxVolume: number; // [L]
  currentVolume: number; // [L]
  currentVolumeHeight: number; // [cm]
  filledPercentage: number; // [%]
};

export type PumpNode = NodeBase & {
  type: "pump";
  suctionHeadMax: number;
  totalHeadMax: number;
  capacityMax: number;
  curveHead: number[];
  curveFlow: number[];
  suctionPipeDiameter: number;
  dischargePipeDiameter: number;
  operatingHead?: number;
};

export type ValveNode = NodeBase & {
  type: "valve";
  status: "open" | "close";
  diameter: number; // [cm]
  minorLossCoefficient?: number; // [C]
};

export type Node =
  | FittingNode
  | ReservoirNode
  | TankNode
  | PumpNode
  | ValveNode;

export type Edge = {
  id: string;
  label: string;
  sourceId: string;
  targetId: string;
  sourcePosition: "left" | "right" | "top" | "bottom";
  targetPosition: "left" | "right" | "top" | "bottom";
  diameter: number; // [cm]
  length: number; // [m]
  roughness: number; // [C]
  flowRate: number; // [L/s]
  velocity: number; // [m/s]
};
