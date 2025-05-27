import "@/test/setup";
import { useSignIn } from "@clerk/clerk-react";
import { act, renderHook } from "@testing-library/react";
import { useNavigate } from "react-router";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { useSignInForm } from "../use-auth-form";
import { useToast } from "../use-toast";

vi.mock("@clerk/clerk-react", () => ({
	useSignIn: vi.fn(),
}));

vi.mock("react-router", () => ({
	useNavigate: vi.fn(),
}));

vi.mock("../use-toast", () => ({
	useToast: vi.fn(),
}));

describe("Sign In Form Hook", () => {
	const mockNavigate = vi.fn();
	const mockToast = vi.fn();
	const mockSignIn = {
		signIn: {
			create: vi.fn(),
			authenticateWithRedirect: vi.fn(),
		},
		isLoaded: true,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(useNavigate as Mock).mockReturnValue(mockNavigate);
		(useToast as Mock).mockReturnValue({ toast: mockToast });
		(useSignIn as Mock).mockReturnValue(mockSignIn);
	});

	it("should initialize with default values", () => {
		const { result } = renderHook(() => useSignInForm());

		expect(result.current.form.getValues()).toEqual({
			email: "",
			password: "",
		});
		expect(result.current.error).toBe("");
		expect(result.current.isLoading).toBe(false);
	});

	it("should handle successful sign in", async () => {
		mockSignIn.signIn.create.mockResolvedValueOnce({ status: "complete" });

		const { result } = renderHook(() => useSignInForm());

		await act(async () => {
			await result.current.onSubmit({
				email: "test@example.com",
				password: "password123",
			});
		});

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(mockSignIn.signIn.create).toHaveBeenCalledWith({
			identifier: "test@example.com",
			password: "password123",
		});
		expect(mockToast).toHaveBeenCalledWith({
			title: "Success",
			description: "Successfully signed in!",
		});
		expect(mockNavigate).toHaveBeenCalledWith("/");
	});

	it("handles failed sign in", async () => {
		const errorMessage = "Invalid email or password.";
		mockSignIn.signIn.create.mockRejectedValueOnce({
			errors: [{ message: errorMessage }],
		});

		const { result } = renderHook(() => useSignInForm());

		await act(async () => {
			await result.current.onSubmit({
				email: "test@example.com",
				password: "wrongpassword",
			});
		});

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(mockSignIn.signIn.create).toHaveBeenCalledWith({
			identifier: "test@example.com",
			password: "wrongpassword",
		});
		expect(result.current.error).toBe(errorMessage);
		expect(mockToast).toHaveBeenCalledWith({
			variant: "destructive",
			title: "Error",
			description: errorMessage,
		});
	});

	it("handles Google sign in", async () => {
		const { result } = renderHook(() => useSignInForm());

		await act(async () => {
			await result.current.handleGoogleSignIn();
		});

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(mockSignIn.signIn.authenticateWithRedirect).toHaveBeenCalledWith({
			strategy: "oauth_google",
			redirectUrl: `${window.location.origin}/sso-callback`,
			redirectUrlComplete: "/",
		});
	});

	it("handles Google sign in error", async () => {
		const errorMessage = "Failed to sign in with Google.";
		mockSignIn.signIn.authenticateWithRedirect.mockRejectedValueOnce({
			errors: [{ message: errorMessage }],
		});

		const { result } = renderHook(() => useSignInForm());

		await act(async () => {
			await result.current.handleGoogleSignIn();
		});

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(mockSignIn.signIn.authenticateWithRedirect).toHaveBeenCalledWith({
			strategy: "oauth_google",
			redirectUrl: `${window.location.origin}/sso-callback`,
			redirectUrlComplete: "/",
		});
		expect(result.current.error).toBe(errorMessage);
		expect(mockToast).toHaveBeenCalledWith({
			variant: "destructive",
			title: "Error",
			description: errorMessage,
		});
	});
});
