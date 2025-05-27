import { describe, expect, it } from "vitest";
import { createEdge, createNode } from "../node-edge-factory";

describe("Node and Edge Factory", () => {
	describe("Node Creation", () => {
		const mockOffset = { x: 100, y: 100 };
		const mockZoom = 100;

		it("should create a fitting node", () => {
			const node = createNode(
				"fitting",
				"coupling",
				mockOffset,
				mockZoom,
				"Test Fitting",
			);

			expect(node).toMatchObject({
				type: "fitting",
				subtype: "coupling",
				label: "Test Fitting",
				position: { x: -100, y: -100 },
				rotation: 0,
				elevation: 1,
				demand: 0,
				diameter: 2,
				inletPressure: 0,
				outletPressure: 0,
				velocity: 0,
				flowRate: 0,
				pressure: 0,
				active: true,
				note: "",
			});
			expect(node.id).toMatch(/^f-/);
		});

		it("should create a reservoir node", () => {
			const node = createNode(
				"reservoir",
				"",
				mockOffset,
				mockZoom,
				"Test Reservoir",
			);

			expect(node).toMatchObject({
				type: "reservoir",
				label: "Test Reservoir",
				position: { x: -100, y: -100 },
				rotation: 0,
				elevation: 1,
				head: 10,
				flowRate: 0,
				pressure: 0,
				active: true,
				note: "",
			});
			expect(node.id).toMatch(/^r-/);
		});

		it("should create a tank node", () => {
			const node = createNode("tank", "", mockOffset, mockZoom, "Test Tank");

			expect(node).toMatchObject({
				type: "tank",
				label: "Test Tank",
				position: { x: -100, y: -100 },
				rotation: 0,
				elevation: 1,
				diameter: 83,
				height: 110,
				currentVolumeHeight: 0,
				currentVolume: 0,
				filledPercentage: 0,
				flowRate: 0,
				pressure: 0,
				active: true,
				note: "",
			});
			expect(node.id).toMatch(/^t-/);
		});

		it("should create a pump node", () => {
			const node = createNode("pump", "", mockOffset, mockZoom, "Test Pump");

			expect(node).toMatchObject({
				type: "pump",
				label: "Test Pump",
				position: { x: -100, y: -100 },
				rotation: 0,
				elevation: 1,
				suctionHeadMax: 9,
				totalHeadMax: 33,
				capacityMax: 33,
				curveHead: [10, 20],
				curveFlow: [18, 10],
				suctionPipeDiameter: 3,
				dischargePipeDiameter: 3,
				flowRate: 0,
				pressure: 0,
				active: true,
				note: "",
			});
			expect(node.id).toMatch(/^p-/);
		});

		it("should create a valve node", () => {
			const node = createNode("valve", "", mockOffset, mockZoom, "Test Valve");

			expect(node).toMatchObject({
				type: "valve",
				label: "Test Valve",
				position: { x: -100, y: -100 },
				rotation: 0,
				elevation: 1,
				status: "close",
				diameter: 2,
				lossCoefficient: 0,
				flowRate: 0,
				pressure: 0,
				active: true,
				note: "",
			});
			expect(node.id).toMatch(/^v-/);
		});

		it("should calculate position based on offset and zoom", () => {
			const node = createNode(
				"fitting",
				"coupling",
				{ x: 200, y: 200 },
				50,
				"Test",
			);

			expect(node.position).toEqual({ x: -400, y: -400 });
		});
	});

	describe("Edge Creation", () => {
		it("should create an edge with default values", () => {
			const edge = createEdge("source-1", "target-1", "right", "left");

			expect(edge).toMatchObject({
				sourceId: "source-1",
				targetId: "target-1",
				sourcePosition: "right",
				targetPosition: "left",
				label: "Pipe",
				diameter: 2,
				length: 0,
				roughness: 140,
				flowRate: 0,
				velocity: 0,
			});
			expect(edge.id).toMatch(/^e-/);
		});

		it("should create an edge with custom values", () => {
			const edge = createEdge("source-1", "target-1", "right", "left", {
				label: "Custom Pipe",
				diameter: 4,
				length: 100,
				roughness: 120,
			});

			expect(edge).toMatchObject({
				sourceId: "source-1",
				targetId: "target-1",
				sourcePosition: "right",
				targetPosition: "left",
				label: "Custom Pipe",
				diameter: 4,
				length: 100,
				roughness: 120,
				flowRate: 0,
				velocity: 0,
			});
			expect(edge.id).toMatch(/^e-/);
		});
	});
});
