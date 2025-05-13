export type NodeType = "fitting" | "reservoir" | "tank" | "pump" | "valve";

export type NodeBase = {
  id: string;
  type: NodeType;
  subtype?: string;
  label?: string;
  position: { x: number; y: number };
  rotation: number;
  elevation: number;
  flowRate: number;
  pressure: number;
  active: boolean;
  note?: string;
};

export type FittingNode = NodeBase & {
  type: "fitting";
  demand: number;
  diameter: number;
  inletPressure?: number;
  outletPressure?: number;
  minorLossCoefficient?: number;
  velocity?: number;
};

export type ReservoirNode = NodeBase & {
  type: "reservoir";
  head: number;
};

export type TankNode = NodeBase & {
  type: "tank";
  diameter: number;
  height: number;
  maxVolume: number;
  currentVolume: number;
  currentVolumeHeight: number;
  filledPercentage: number;
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
};

export type ValveNode = NodeBase & {
  type: "valve";
  status: "open" | "close";
  diameter: number;
  lossCoefficient?: number;
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
  diameter: number;
  length: number;
  roughness: number;
  flowRate: number;
  velocity: number;
};
