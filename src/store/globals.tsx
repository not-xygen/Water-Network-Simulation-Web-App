/* eslint-disable no-unused-vars */
import { create } from "zustand";

export type Mode = "drag" | "connect";

export type GlobalState = {
  zoom: number;
  offset: { x: number; y: number };
  zoomIn: () => void;
  zoomOut: () => void;
  setOffset: (x: number, y: number) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
};

const useGlobalStore = create<GlobalState>((set) => ({
  zoom: 100,
  offset: { x: 0, y: 0 },
  zoomIn: () => set((state) => ({ zoom: Math.min(state.zoom + 10, 200) })),
  zoomOut: () => set((state) => ({ zoom: Math.max(state.zoom - 10, 25) })),
  setOffset: (x, y) => set({ offset: { x, y } }),
  mode: "drag",
  setMode: (mode) => set({ mode }),
}));

export default useGlobalStore;
