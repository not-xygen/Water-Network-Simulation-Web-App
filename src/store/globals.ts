/* eslint-disable no-unused-vars */
import { create } from "zustand";

export type Mode = "drag" | "connect";

export type GlobalState = {
  zoom: number;
  resetZoom: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  offset: { x: number; y: number };
  setOffset: (x: number, y: number) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  preferencesOpen: boolean;
  setPreferencesOpen: (open: boolean) => void;
};

const useGlobalStore = create<GlobalState>((set) => ({
  zoom: 100,
  resetZoom: () => set({ zoom: 100 }),
  zoomIn: () => set((state) => ({ zoom: Math.min(state.zoom + 10, 200) })),
  zoomOut: () => set((state) => ({ zoom: Math.max(state.zoom - 10, 50) })),
  offset: { x: 0, y: 0 },
  setOffset: (x, y) => set({ offset: { x, y } }),
  mode: "drag",
  setMode: (mode) => set({ mode }),
  preferencesOpen: false,
  setPreferencesOpen: (open) => set({ preferencesOpen: open }),
}));

export default useGlobalStore;
