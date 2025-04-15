/* eslint-disable no-unused-vars */
import { create } from "zustand";

export type Node = {
  id: string;
  x: number;
  y: number;
  type: string;
};

export type GlobalState = {
  zoom: number;
  offset: { x: number; y: number };
  nodes: Node[];
  zoomIn: () => void;
  zoomOut: () => void;
  setOffset: (x: number, y: number) => void;
  addNode: (node: Node) => void;
  updateNodePosition: (id: string, deltaX: number, deltaY: number) => void;
  removeNode: (id: string) => void;
};

const useGlobalStore = create<GlobalState>((set) => ({
  zoom: 100,
  offset: { x: 0, y: 0 },
  nodes: [],
  zoomIn: () => set((state) => ({ zoom: Math.min(state.zoom + 10, 200) })),
  zoomOut: () => set((state) => ({ zoom: Math.max(state.zoom - 10, 25) })),
  setOffset: (x, y) => set({ offset: { x, y } }),

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),

  updateNodePosition: (id, deltaX, deltaY) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, x: node.x + deltaX, y: node.y + deltaY }
          : node,
      ),
    })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
    })),
}));

export default useGlobalStore;
