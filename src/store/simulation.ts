import { create } from "zustand";
import { devtools } from "zustand/middleware";

type SimulationState = {
  running: boolean;
  paused: boolean;
  step: number;
  elapsedTime: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
  increment: () => void;
};

const useSimulationStore = create(
  devtools<SimulationState>((set) => ({
    running: false,
    paused: false,
    step: 0,
    elapsedTime: 0,
    start: () => set({ running: true }),
    stop: () => set({ running: false }),
    reset: () => set({ running: false, step: 0, elapsedTime: 0 }),
    increment: () =>
      set((state) => ({
        step: state.step + 1,
        elapsedTime: state.elapsedTime + 1,
      })),
  })),
);

export default useSimulationStore;
