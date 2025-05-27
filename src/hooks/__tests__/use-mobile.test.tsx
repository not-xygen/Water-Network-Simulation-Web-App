import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useIsMobile } from "../use-mobile";

describe("useIsMobile", () => {
	it("should return false for desktop width", () => {
		window.innerWidth = 1024;
		const { result } = renderHook(() => useIsMobile());
		expect(result.current).toBe(false);
	});

	it("should return true for mobile width", () => {
		window.innerWidth = 375;
		const { result } = renderHook(() => useIsMobile());
		expect(result.current).toBe(true);
	});

	it("should update when window is resized", () => {
		window.innerWidth = 1024;
		const { result } = renderHook(() => useIsMobile());
		expect(result.current).toBe(false);

		act(() => {
			window.innerWidth = 375;
			window.dispatchEvent(new Event("resize"));
		});

		expect(result.current).toBe(true);
	});

	it("should clean up event listener on unmount", () => {
		const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
		const { unmount } = renderHook(() => useIsMobile());

		unmount();

		expect(removeEventListenerSpy).toHaveBeenCalledWith(
			"resize",
			expect.any(Function),
		);
	});
});
