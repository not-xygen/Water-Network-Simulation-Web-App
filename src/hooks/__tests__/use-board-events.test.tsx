import { act, renderHook } from "@testing-library/react";
import type { MouseEvent } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBoardEvents } from "../board/use-board-events";

vi.mock("@/store/globals", () => ({
	default: () => ({
		zoom: 1,
		offset: { x: 0, y: 0 },
		mode: "drag",
	}),
}));

vi.mock("@/store/node-edge", () => ({
	default: () => ({
		removeNode: vi.fn(),
		removeEdge: vi.fn(),
		selectedNodes: [],
		setSelectedNodes: vi.fn(),
		selectedEdges: [],
		setSelectedEdges: vi.fn(),
		updateEdgeConnection: vi.fn(),
		nodes: [
			{
				id: "node-1",
				position: { x: 0, y: 0 },
				rotation: 0,
			},
		],
		edges: [],
		addEdge: vi.fn(),
		updateNodePosition: vi.fn(),
		updateNodeRotation: vi.fn(),
	}),
}));

describe("useBoardEvents", () => {
	const mockProps = {
		isSpacePressed: false,
	};

	const createMockMouseEvent = (
		x: number,
		y: number,
	): MouseEvent<HTMLDivElement> => {
		const element = document.createElement("div");
		const event = {
			preventDefault: vi.fn(),
			stopPropagation: vi.fn(),
			nativeEvent: new MouseEvent("mousedown"),
			isDefaultPrevented: vi.fn(),
			isPropagationStopped: vi.fn(),
			persist: vi.fn(),
			currentTarget: element,
			target: element,
			type: "mousedown",
			bubbles: true,
			cancelable: true,
			defaultPrevented: false,
			eventPhase: 0,
			isTrusted: true,
			timeStamp: Date.now(),
			button: 0,
			buttons: 0,
			clientX: x,
			clientY: y,
			ctrlKey: false,
			metaKey: false,
			movementX: 0,
			movementY: 0,
			offsetX: x,
			offsetY: y,
			pageX: x,
			pageY: y,
			relatedTarget: null,
			screenX: x,
			screenY: y,
			shiftKey: false,
			x: x,
			y: y,
			getModifierState: vi.fn(),
		} as unknown as MouseEvent<HTMLDivElement>;

		return event;
	};

	beforeEach(() => {
		vi.clearAllMocks();
		const mockBoard = document.createElement("div");
		mockBoard.getBoundingClientRect = () => ({
			left: 0,
			top: 0,
			right: 1000,
			bottom: 1000,
			width: 1000,
			height: 1000,
			x: 0,
			y: 0,
			toJSON: () => ({}),
		});
		document.getElementById = vi.fn().mockReturnValue(mockBoard);
	});

	it("should initialize with default values", () => {
		const { result } = renderHook(() => useBoardEvents(mockProps));

		expect(result.current.draggedNode).toBe(null);
		expect(result.current.connecting).toBe(null);
		expect(result.current.mousePos).toBe(null);
		expect(result.current.selectionStart).toBe(null);
		expect(result.current.selectionEnd).toBe(null);
	});

	it("should handle node drag start", () => {
		const { result } = renderHook(() => useBoardEvents(mockProps));
		const mockEvent = createMockMouseEvent(100, 100);

		act(() => {
			result.current.handleNodeMouseDown(mockEvent, "node-1");
		});

		expect(result.current.draggedNode).toBe("node-1");
	});

	it("should handle connection start", () => {
		const { result } = renderHook(() => useBoardEvents(mockProps));
		const mockEvent = createMockMouseEvent(100, 100);

		act(() => {
			result.current.handleConnectionStart(mockEvent, "node-1", "right");
		});

		expect(result.current.connecting).toEqual({
			sourceId: "node-1",
			sourcePosition: "right",
		});
	});

	it("should handle connection end", () => {
		const { result } = renderHook(() => useBoardEvents(mockProps));
		const mockEvent = createMockMouseEvent(100, 100);

		act(() => {
			result.current.handleConnectionStart(mockEvent, "node-1", "right");
		});

		act(() => {
			result.current.handleConnectionEnd(mockEvent, "node-2", "left");
		});

		expect(result.current.connecting).toBe(null);
	});

	it("should handle selection start and end", () => {
		const { result } = renderHook(() => useBoardEvents(mockProps));
		const mockEvent = createMockMouseEvent(100, 100);

		act(() => {
			result.current.handleBoardMouseDown(mockEvent);
		});

		expect(result.current.selectionStart).toEqual({ x: 100, y: 100 });

		act(() => {
			result.current.handleBoardMouseUp(mockEvent);
		});

		expect(result.current.selectionStart).toBe(null);
		expect(result.current.selectionEnd).toBe(null);
	});

	it("should handle edge reconnection", () => {
		const { result } = renderHook(() => useBoardEvents(mockProps));
		const mockEvent = createMockMouseEvent(100, 100);

		act(() => {
			result.current.handleEdgeReconnection(mockEvent, "edge-1", "source");
		});

		expect(result.current.draggingEdgeHandle).toEqual({
			edgeId: "edge-1",
			type: "source",
		});
	});
});
