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
};

const useGlobalStore = create<GlobalState>((set) => ({
	zoom: 100,
	offset: { x: 0, y: 0 },
	nodes: [],
	zoomIn: () => set((state) => ({ zoom: Math.min(state.zoom + 10, 150) })),
	zoomOut: () => set((state) => ({ zoom: Math.max(state.zoom - 10, 50) })),
	setOffset: (x, y) => set({ offset: { x, y } }),
	addNode: (node) =>
		set((state) => ({
			nodes: [...state.nodes, node],
		})),
}));

export default useGlobalStore;
