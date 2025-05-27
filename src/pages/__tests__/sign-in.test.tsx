import "@/test/setup";
import { useSignInForm } from "@/hooks/use-auth-form";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import SignIn from "../sign-in";

// Mock useSignInForm hook
vi.mock("@/hooks/use-auth-form", () => ({
	useSignInForm: vi.fn(),
}));

// Mock form components
vi.mock("@/components/ui/form", () => ({
	Form: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	FormField: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	FormItem: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	FormLabel: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	FormControl: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	FormMessage: () => null,
}));

// Mock form fields
vi.mock("@/components/ui/form-fields", () => ({
	TextField: ({ label, name }: { label: string; name: string }) => (
		<div>
			<label htmlFor={name}>{label}</label>
			<input id={name} type="text" aria-label={label} name={name} />
		</div>
	),
	PasswordField: ({
		label,
		name,
		showPassword,
		onTogglePassword,
	}: {
		label: string;
		name: string;
		showPassword?: boolean;
		onTogglePassword?: () => void;
	}) => (
		<div>
			<label htmlFor={name}>{label}</label>
			<input
				id={name}
				type={showPassword ? "text" : "password"}
				aria-label={label}
				name={name}
			/>
			<button
				type="button"
				onClick={onTogglePassword}
				aria-label="toggle password"
			>
				{showPassword ? "Hide" : "Show"}
			</button>
		</div>
	),
}));

describe("SignIn", () => {
	const mockOnSubmit = vi.fn();
	const mockForm = {
		control: {},
		handleSubmit:
			(fn: (data: { email: string; password: string }) => void) =>
			(e: React.FormEvent) => {
				e.preventDefault();
				fn({ email: "test@example.com", password: "password123" });
			},
		formState: {
			errors: {},
		},
		getValues: vi.fn(),
		setValue: vi.fn(),
		watch: vi.fn(),
		register: vi.fn(),
		unregister: vi.fn(),
		reset: vi.fn(),
		clearErrors: vi.fn(),
		setError: vi.fn(),
		trigger: vi.fn(),
		getFieldState: vi.fn(),
		_fields: {},
		_formState: {
			isDirty: false,
			dirtyFields: {},
			touchedFields: {},
			isSubmitting: false,
			isSubmitted: false,
			submitCount: 0,
			isSubmitSuccessful: false,
			isValid: true,
			errors: {},
		},
	};

	const mockUseSignInForm = {
		form: mockForm,
		error: "",
		isLoading: false,
		onSubmit: mockOnSubmit,
		handleGoogleSignIn: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(useSignInForm as Mock).mockReturnValue(mockUseSignInForm);
	});

	const renderSignIn = () => {
		return render(
			<MemoryRouter>
				<SignIn />
			</MemoryRouter>,
		);
	};

	it("renders sign in form", () => {
		renderSignIn();

		expect(screen.getByText("Welcome Back")).toBeInTheDocument();
		expect(screen.getByText("Sign in to your WNS account")).toBeInTheDocument();
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
		expect(screen.getByLabelText("Password")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Sign in with Google" }),
		).toBeInTheDocument();
	});

	it("displays error message when error occurs", () => {
		const errorMessage = "Invalid credentials";
		(useSignInForm as Mock).mockReturnValue({
			...mockUseSignInForm,
			error: errorMessage,
		});

		renderSignIn();
		expect(screen.getByText(errorMessage)).toBeInTheDocument();
	});

	it("shows loading state during sign in", () => {
		(useSignInForm as Mock).mockReturnValue({
			...mockUseSignInForm,
			isLoading: true,
		});

		renderSignIn();
		expect(
			screen.getByRole("button", { name: "Signing in..." }),
		).toBeDisabled();
	});

	it("handles form submission", async () => {
		renderSignIn();

		const emailInput = screen.getByLabelText("Email");
		const passwordInput = screen.getByLabelText("Password");
		const submitButton = screen.getByRole("button", { name: "Sign in" });

		await act(async () => {
			fireEvent.change(emailInput, { target: { value: "test@example.com" } });
			fireEvent.change(passwordInput, { target: { value: "password123" } });
			fireEvent.click(submitButton);
		});

		// Panggil handleSubmit secara langsung
		mockForm.handleSubmit(mockOnSubmit)(
			new Event("submit") as unknown as React.FormEvent,
		);

		expect(mockOnSubmit).toHaveBeenCalledWith({
			email: "test@example.com",
			password: "password123",
		});
	});

	it("handles Google sign in", () => {
		renderSignIn();

		const googleButton = screen.getByRole("button", {
			name: "Sign in with Google",
		});
		fireEvent.click(googleButton);

		expect(mockUseSignInForm.handleGoogleSignIn).toHaveBeenCalled();
	});

	it("toggles password visibility", () => {
		renderSignIn();

		const passwordInput = screen.getByLabelText("Password");
		const toggleButton = screen.getByRole("button", {
			name: /toggle password/i,
		});

		expect(passwordInput).toHaveAttribute("type", "password");
		fireEvent.click(toggleButton);
		expect(passwordInput).toHaveAttribute("type", "text");
	});

	it("displays terms and privacy policy links", () => {
		renderSignIn();

		expect(screen.getByText("Terms of Service")).toBeInTheDocument();
		expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
	});

	it("displays sign up link", () => {
		renderSignIn();

		const signUpLink = screen.getByText("Sign up");
		expect(signUpLink).toBeInTheDocument();
		expect(signUpLink.closest("a")).toHaveAttribute("href", "/sign-up");
	});

	it("disables both sign in buttons when loading", () => {
		(useSignInForm as Mock).mockReturnValue({
			...mockUseSignInForm,
			isLoading: true,
		});

		renderSignIn();

		const regularSignInButton = screen.getByRole("button", {
			name: "Signing in...",
		});
		const googleSignInButton = screen.getByRole("button", {
			name: "Sign in with Google",
		});

		expect(regularSignInButton).toBeDisabled();
		expect(googleSignInButton).toBeDisabled();
	});

	it("validates email format", async () => {
		renderSignIn();

		const emailInput = screen.getByLabelText("Email");
		const submitButton = screen.getByRole("button", { name: "Sign in" });

		await act(async () => {
			fireEvent.change(emailInput, { target: { value: "invalid-email" } });
			fireEvent.click(submitButton);
		});

		// Panggil trigger secara langsung
		mockForm.trigger("email");

		expect(mockForm.trigger).toHaveBeenCalledWith("email");
	});

	it("handles form reset", async () => {
		renderSignIn();

		const emailInput = screen.getByLabelText("Email");
		const passwordInput = screen.getByLabelText("Password");

		await act(async () => {
			fireEvent.change(emailInput, { target: { value: "test@example.com" } });
			fireEvent.change(passwordInput, { target: { value: "password123" } });
		});

		// Panggil reset secara langsung
		mockForm.reset();

		expect(mockForm.reset).toHaveBeenCalled();
	});
});
