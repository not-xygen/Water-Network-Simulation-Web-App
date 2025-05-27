import "@/test/setup";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import useGlobalStore from "../globals";

describe("useGlobalStore", () => {
	beforeEach(() => {
		const { result } = renderHook(() => useGlobalStore());
		act(() => {
			result.current.resetZoom();
			result.current.setOffset(0, 0);
			result.current.setMode("drag");
			result.current.setPreferencesOpen(false);
		});
	});

	it("should initialize with default values", () => {
		const { result } = renderHook(() => useGlobalStore());
		expect(result.current.zoom).toBe(100);
		expect(result.current.offset).toEqual({ x: 0, y: 0 });
		expect(result.current.mode).toBe("drag");
		expect(result.current.preferencesOpen).toBe(false);
	});

	it("should handle zoom operations", () => {
		const { result } = renderHook(() => useGlobalStore());

		act(() => {
			result.current.zoomIn();
		});
		expect(result.current.zoom).toBe(110);

		act(() => {
			result.current.zoomOut();
		});
		expect(result.current.zoom).toBe(100);

		act(() => {
			result.current.zoomOut();
		});
		expect(result.current.zoom).toBe(90);

		act(() => {
			result.current.resetZoom();
		});
		expect(result.current.zoom).toBe(100);
	});

	it("should handle offset operations", () => {
		const { result } = renderHook(() => useGlobalStore());

		act(() => {
			result.current.setOffset(10, 20);
		});
		expect(result.current.offset).toEqual({ x: 10, y: 20 });
	});

	it("should handle mode operations", () => {
		const { result } = renderHook(() => useGlobalStore());

		act(() => {
			result.current.setMode("connect");
		});
		expect(result.current.mode).toBe("connect");

		act(() => {
			result.current.setMode("drag");
		});
		expect(result.current.mode).toBe("drag");
	});

	it("should handle preferences operations", () => {
		const { result } = renderHook(() => useGlobalStore());

		act(() => {
			result.current.setPreferencesOpen(true);
		});
		expect(result.current.preferencesOpen).toBe(true);

		act(() => {
			result.current.setPreferencesOpen(false);
		});
		expect(result.current.preferencesOpen).toBe(false);
	});
});
