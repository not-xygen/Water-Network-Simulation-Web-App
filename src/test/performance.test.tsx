import NodeItem from "@/components/node/node-item";
import type { Node, ReservoirNode } from "@/types/node-edge";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";

describe("Performance Tests", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	const mockNode: ReservoirNode = {
		id: "1",
		type: "reservoir",
		position: { x: 0, y: 0 },
		rotation: 0,
		elevation: 0,
		flowRate: 0,
		pressure: 0,
		active: true,
		head: 10,
	};

	const defaultProps = {
		node: mockNode,
		isSelected: false,
		zoom: 100,
		isDragged: false,
		onMouseDown: vi.fn(),
		onMouseUp: vi.fn(),
		onStartConnect: vi.fn(),
		onEndConnect: vi.fn(),
		onRotateStart: vi.fn(),
		onRotateEnd: vi.fn(),
	};

	it("renders 100 nodes within 2000ms", () => {
		const startTime = performance.now();

		const nodes = Array.from({ length: 100 }, (_, i) => ({
			...mockNode,
			id: String(i + 1),
		}));

		const { container } = render(
			<div data-testid="nodes-container">
				{nodes.map((node) => (
					<NodeItem key={node.id} {...defaultProps} node={node} />
				))}
			</div>,
		);

		const endTime = performance.now();
		const renderTime = endTime - startTime;

		expect(renderTime).toBeLessThan(2000);
		expect(container.querySelectorAll('[data-testid*="node-"]')).toHaveLength(
			100,
		);
	});

	it("handles rapid state changes efficiently", () => {
		const startTime = performance.now();
		const { rerender } = render(
			<NodeItem {...defaultProps} isSelected={false} />,
		);

		try {
			for (let i = 0; i < 100; i++) {
				rerender(<NodeItem {...defaultProps} isSelected={i % 2 === 0} />);
			}
		} catch (error) {
			console.error("Error during state changes:", error);
			throw error;
		}

		const endTime = performance.now();
		const updateTime = endTime - startTime;

		expect(updateTime).toBeLessThan(1000);
	});

	it("maintains performance with complex node types", () => {
		const startTime = performance.now();

		const complexNode: Node = {
			...mockNode,
			type: "fitting",
			demand: 0,
			diameter: 0,
			subtype: "coupling",
			inletPressure: 0,
			outletPressure: 0,
			minorLossCoefficient: 0,
			velocity: 0,
		};

		const nodes = Array.from({ length: 50 }, (_, i) => ({
			...complexNode,
			id: String(i + 1),
		}));

		const { container } = render(
			<div data-testid="complex-nodes-container">
				{nodes.map((node) => (
					<NodeItem key={node.id} {...defaultProps} node={node} />
				))}
			</div>,
		);

		const endTime = performance.now();
		const renderTime = endTime - startTime;

		expect(renderTime).toBeLessThan(1000);
		expect(
			container.querySelector('[data-testid="complex-nodes-container"]'),
		).toBeInTheDocument();
	});

	it("handles zoom changes efficiently", () => {
		const startTime = performance.now();
		const { rerender } = render(<NodeItem {...defaultProps} zoom={50} />);

		const zoomLevels = [25, 50, 75, 100, 125, 150, 200];

		try {
			for (const zoom of zoomLevels) {
				rerender(<NodeItem {...defaultProps} zoom={zoom} />);
			}
		} catch (error) {
			console.error("Error during zoom changes:", error);
			throw error;
		}

		const endTime = performance.now();
		const zoomTime = endTime - startTime;

		expect(zoomTime).toBeLessThan(200);
	});

	it("handles drag state changes efficiently", () => {
		const startTime = performance.now();
		const { rerender } = render(
			<NodeItem {...defaultProps} isDragged={false} />,
		);

		try {
			for (let i = 0; i < 50; i++) {
				rerender(<NodeItem {...defaultProps} isDragged={i % 2 === 0} />);
			}
		} catch (error) {
			console.error("Error during drag state changes:", error);
			throw error;
		}

		const endTime = performance.now();
		const dragTime = endTime - startTime;

		expect(dragTime).toBeLessThan(400);
	});
});
