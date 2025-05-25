import type { Edge, Node } from "./node-edge";

export interface SimulationMetadata {
  nodes: Node[];
  edges: Edge[];
}

export interface SimulationSave {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  screenshot: string;
  metadata: SimulationMetadata;
}

export interface SimulationSaveFormData {
  name: string;
  screenshot: string;
  metadata: SimulationMetadata;
}
