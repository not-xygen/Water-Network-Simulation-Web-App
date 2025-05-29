import { useUser } from "@clerk/clerk-react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAccountForm } from "../use-account-form";

vi.mock("@clerk/clerk-react", () => ({
	useUser: vi.fn(),
}));

describe("Account Form Hook", () => {
	const mockUser = {
		id: "user-123",
		update: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(useUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			user: mockUser,
		});
	});


	it("should handle successful form submission", async () => {
		const { result } = renderHook(() => useAccountForm());

		const formData = {
			firstName: "John",
			lastName: "Doe",
		};

		mockUser.update.mockResolvedValueOnce({});

		await act(async () => {
			await result.current.onSubmit(formData);
		});

		expect(mockUser.update).toHaveBeenCalledWith(formData);
		expect(result.current.error).toBe("");
		expect(result.current.isLoading).toBe(false);
	});

	it("should handle form submission error", async () => {
		const { result } = renderHook(() => useAccountForm());

		const formData = {
			firstName: "John",
			lastName: "Doe",
		};

		const error = new Error("Update failed");
		mockUser.update.mockRejectedValueOnce(error);

		await act(async () => {
			await result.current.onSubmit(formData);
		});

		expect(result.current.error).toBe(error.message);
		expect(result.current.isLoading).toBe(false);
	});

	it("should not submit if user is not available", async () => {
		vi.clearAllMocks();

		(useUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			user: null,
		});

		const { result } = renderHook(() => useAccountForm());

		const formData = {
			firstName: "John",
			lastName: "Doe",
		};

		await act(async () => {
			await result.current.onSubmit(formData);
		});

		expect(mockUser.update).not.toHaveBeenCalled();
		expect(result.current.error).toBe("User not available");
	});
});
