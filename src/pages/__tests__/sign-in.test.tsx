import { useSignInForm } from "@/hooks/use-auth-form";
import { fireEvent, render, screen } from "@testing-library/react";
import type { SubmitHandler } from "react-hook-form";
import { BrowserRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignIn from "../sign-in";

vi.mock("@/hooks/use-auth-form");

interface SignInFormData {
  email: string;
  password: string;
}

describe("SignIn Component", () => {
  const mockOnSubmit = vi.fn();
  const mockHandleGoogleSignIn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useSignInForm as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      form: {
        handleSubmit: (fn: SubmitHandler<SignInFormData>) => fn,
        control: {
          _fields: {},
          _formState: {},
          _formValues: {},
          _getDirty: () => ({}),
          _getFields: () => ({}),
          _getState: () => ({}),
          _getValues: () => ({}),
          _options: {},
          _subjects: {},
          _updateValid: () => {},
          _updateWatched: () => {},
          _watch: () => ({}),
          array: {
            append: () => {},
            fields: [],
            insert: () => {},
            move: () => {},
            prepend: () => {},
            remove: () => {},
            replace: () => {},
            swap: () => {},
            update: () => {},
          },
          field: {
            _f: {},
            onChange: () => {},
            onBlur: () => {},
            name: "",
            ref: { value: "" },
          },
          formState: {
            isDirty: false,
            isSubmitting: false,
            isSubmitted: false,
            isSubmitSuccessful: false,
            errors: {},
          },
          getFieldState: () => ({
            invalid: false,
            isDirty: false,
            isTouched: false,
          }),
          getValues: () => ({}),
          handleSubmit: () => () => {},
          register: () => ({
            onChange: () => {},
            onBlur: () => {},
            name: "",
            ref: { value: "" },
          }),
          reset: () => {},
          setError: () => {},
          setValue: () => {},
          trigger: () => Promise.resolve(true),
          unregister: () => {},
          watch: () => ({}),
        },
      },
      error: null,
      isLoading: false,
      onSubmit: mockOnSubmit,
      handleGoogleSignIn: mockHandleGoogleSignIn,
    });
  });

  const renderSignIn = () => {
    return render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>,
    );
  };

  it("renders sign in form correctly", () => {
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

  it("shows error message when error prop is provided", () => {
    const errorMessage = "Invalid credentials";
    (useSignInForm as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      form: {
        handleSubmit: (fn: SubmitHandler<SignInFormData>) => fn,
        control: {
          _fields: {},
          _formState: {},
          _formValues: {},
          _getDirty: () => ({}),
          _getFields: () => ({}),
          _getState: () => ({}),
          _getValues: () => ({}),
          _options: {},
          _subjects: {},
          _updateValid: () => {},
          _updateWatched: () => {},
          _watch: () => ({}),
          array: {
            append: () => {},
            fields: [],
            insert: () => {},
            move: () => {},
            prepend: () => {},
            remove: () => {},
            replace: () => {},
            swap: () => {},
            update: () => {},
          },
          field: {
            _f: {},
            onChange: () => {},
            onBlur: () => {},
            name: "",
            ref: { value: "" },
          },
          formState: {
            isDirty: false,
            isSubmitting: false,
            isSubmitted: false,
            isSubmitSuccessful: false,
            errors: {},
          },
          getFieldState: () => ({
            invalid: false,
            isDirty: false,
            isTouched: false,
          }),
          getValues: () => ({}),
          handleSubmit: () => () => {},
          register: () => ({
            onChange: () => {},
            onBlur: () => {},
            name: "",
            ref: { value: "" },
          }),
          reset: () => {},
          setError: () => {},
          setValue: () => {},
          trigger: () => Promise.resolve(true),
          unregister: () => {},
          watch: () => ({}),
        },
      },
      error: errorMessage,
      isLoading: false,
      onSubmit: mockOnSubmit,
      handleGoogleSignIn: mockHandleGoogleSignIn,
    });

    renderSignIn();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("shows loading state when isLoading is true", () => {
    (useSignInForm as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      form: {
        handleSubmit: (fn: SubmitHandler<SignInFormData>) => fn,
        control: {
          _fields: {},
          _formState: {},
          _formValues: {},
          _getDirty: () => ({}),
          _getFields: () => ({}),
          _getState: () => ({}),
          _getValues: () => ({}),
          _options: {},
          _subjects: {},
          _updateValid: () => {},
          _updateWatched: () => {},
          _watch: () => ({}),
          array: {
            append: () => {},
            fields: [],
            insert: () => {},
            move: () => {},
            prepend: () => {},
            remove: () => {},
            replace: () => {},
            swap: () => {},
            update: () => {},
          },
          field: {
            _f: {},
            onChange: () => {},
            onBlur: () => {},
            name: "",
            ref: { value: "" },
          },
          formState: {
            isDirty: false,
            isSubmitting: false,
            isSubmitted: false,
            isSubmitSuccessful: false,
            errors: {},
          },
          getFieldState: () => ({
            invalid: false,
            isDirty: false,
            isTouched: false,
          }),
          getValues: () => ({}),
          handleSubmit: () => () => {},
          register: () => ({
            onChange: () => {},
            onBlur: () => {},
            name: "",
            ref: { value: "" },
          }),
          reset: () => {},
          setError: () => {},
          setValue: () => {},
          trigger: () => Promise.resolve(true),
          unregister: () => {},
          watch: () => ({}),
        },
      },
      error: null,
      isLoading: true,
      onSubmit: mockOnSubmit,
      handleGoogleSignIn: mockHandleGoogleSignIn,
    });

    renderSignIn();
    expect(screen.getByText("Signing in...")).toBeInTheDocument();
  });

  it("calls handleGoogleSignIn when Google sign in button is clicked", () => {
    renderSignIn();
    const googleButton = screen.getByRole("button", {
      name: "Sign in with Google",
    });
    fireEvent.click(googleButton);
    expect(mockHandleGoogleSignIn).toHaveBeenCalledTimes(1);
  });

  it("toggles password visibility when show/hide password button is clicked", async () => {
    renderSignIn();
    const passwordInput = screen.getByLabelText("Password");
    const toggleButton = screen.getByRole("button", {
      name: /toggle password/i,
    });

    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
