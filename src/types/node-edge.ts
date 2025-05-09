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
};

export type ReservoirNode = NodeBase & {
  type: "reservoir";
  head: number;
};

export type TankNode = NodeBase & {
  type: "tank";
  level: number;
  minLevel: number;
  maxLevel: number;
};

export type PumpNode = NodeBase & {
  type: "pump";
  curve?: string;
};

export type ValveNode = NodeBase & {
  type: "valve";
  status: "open" | "close";
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
