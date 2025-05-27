import "@/test/setup";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import useSimulationStore from "../simulation";

describe("Simulation Store", () => {
	beforeEach(() => {
		const { result } = renderHook(() => useSimulationStore());
		act(() => {
			result.current.reset();
		});
	});

	it("should initialize with default values", () => {
		const { result } = renderHook(() => useSimulationStore());
		expect(result.current.running).toBe(false);
		expect(result.current.paused).toBe(false);
		expect(result.current.step).toBe(0);
		expect(result.current.elapsedTime).toBe(0);
	});

	it("should handle start operation", () => {
		const { result } = renderHook(() => useSimulationStore());

		act(() => {
			result.current.start();
		});
		expect(result.current.running).toBe(true);
		expect(result.current.paused).toBe(false);
	});

	it("should handle stop operation", () => {
		const { result } = renderHook(() => useSimulationStore());

		act(() => {
			result.current.start();
			result.current.stop();
		});
		expect(result.current.running).toBe(false);
		expect(result.current.paused).toBe(true);
	});

	it("should handle reset operation", () => {
		const { result } = renderHook(() => useSimulationStore());

		act(() => {
			result.current.start();
			result.current.increment();
			result.current.reset();
		});
		expect(result.current.running).toBe(false);
		expect(result.current.paused).toBe(false);
		expect(result.current.step).toBe(0);
		expect(result.current.elapsedTime).toBe(0);
	});

	it("should handle increment operation", () => {
		const { result } = renderHook(() => useSimulationStore());

		act(() => {
			result.current.increment();
		});
		expect(result.current.step).toBe(1);
		expect(result.current.elapsedTime).toBe(1);

		act(() => {
			result.current.increment();
		});
		expect(result.current.step).toBe(2);
		expect(result.current.elapsedTime).toBe(2);
	});
});
