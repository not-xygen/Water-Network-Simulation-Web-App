import { describe, expect, it } from "vitest";
import { cn, formatElapsedTime } from "../utils";

describe("Utility Functions", () => {
	describe("Class Name Utility (cn)", () => {
		it("should merge class names correctly", () => {
			expect(cn("base", "additional")).toBe("base additional");
		});

		it("should handle conditional classes", () => {
			expect(cn("base", { conditional: true, hidden: false })).toBe(
				"base conditional",
			);
		});

		it("should handle multiple conditional classes", () => {
			expect(cn("base", { active: true, disabled: false, hidden: true })).toBe(
				"base active hidden",
			);
		});

		it("should handle empty inputs", () => {
			expect(cn()).toBe("");
		});

		it("should handle undefined and null values", () => {
			expect(cn("base", undefined, null, "additional")).toBe("base additional");
		});
	});

	describe("Time Formatting Utility (formatElapsedTime)", () => {
		it("should format seconds correctly", () => {
			expect(formatElapsedTime(0)).toBe("00:00:00");
			expect(formatElapsedTime(59)).toBe("00:00:59");
			expect(formatElapsedTime(60)).toBe("00:01:00");
			expect(formatElapsedTime(3599)).toBe("00:59:59");
			expect(formatElapsedTime(3600)).toBe("01:00:00");
			expect(formatElapsedTime(3661)).toBe("01:01:01");
		});

		it("should handle large numbers", () => {
			expect(formatElapsedTime(86400)).toBe("24:00:00");
			expect(formatElapsedTime(90061)).toBe("25:01:01");
		});

		it("should handle negative numbers", () => {
			expect(formatElapsedTime(-1)).toBe("00:00:00");
			expect(formatElapsedTime(-60)).toBe("00:00:00");
		});

		it("should handle decimal numbers", () => {
			expect(formatElapsedTime(61.5)).toBe("00:01:01");
			expect(formatElapsedTime(3601.7)).toBe("01:00:01");
		});
	});
});
