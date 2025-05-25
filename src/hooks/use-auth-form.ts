import {
  type SignInFormValues,
  type SignUpFormValues,
  type VerificationFormValues,
  signInSchema,
  signUpSchema,
  verificationSchema,
} from "@/lib/validations/auth";
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

export function useSignInForm() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    if (!isLoaded) return;
    setError("");

    try {
      setIsLoading(true);
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> };
      const errorMessage = error.errors?.[0]?.message || "";

      // Cek apakah error terkait dengan strategi verifikasi
      if (errorMessage.toLowerCase().includes("verification strategy")) {
        setError(
          "Akun ini terdaftar menggunakan Google. Silakan login menggunakan Google.",
        );
      } else {
        setError(errorMessage || "Email atau password salah.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sign-in`,
        redirectUrlComplete: "/",
      });
    } catch (error: unknown) {
      console.error("Google sign in error:", error);
      setError("Failed to sign in with Google.");
    }
  };

  return {
    form,
    error,
    isLoading,
    onSubmit,
    handleGoogleSignIn,
  };
}

export function useSignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const verificationForm = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    if (!isLoaded) return;
    setError("");

    try {
      setIsLoading(true);
      const result = await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/");
      } else {
        setVerificationPending(true);
        setEmailAddress(data.email);
        await signUp.prepareEmailAddressVerification();
      }
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> };
      setError(
        error.errors?.[0]?.message || "An error occurred during registration",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onVerificationSubmit = async (data: VerificationFormValues) => {
    if (!isLoaded) return;
    setError("");

    try {
      setIsLoading(true);
      const result = await signUp.attemptEmailAddressVerification({
        code: data.code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/");
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> };
      setError(
        error.errors?.[0]?.message || "An error occurred during verification",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (!isLoaded) return;
    setError("");

    try {
      setIsLoading(true);
      await signUp.prepareEmailAddressVerification();
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> };
      setError(
        error.errors?.[0]?.message || "Failed to resend verification code",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sign-up`,
        redirectUrlComplete: "/",
      });
    } catch (error: unknown) {
      console.error("Google sign up error:", error);
      setError("Failed to sign up with Google.");
    }
  };

  return {
    form,
    verificationForm,
    error,
    isLoading,
    verificationPending,
    emailAddress,
    onSubmit,
    onVerificationSubmit,
    resendCode,
    handleGoogleSignUp,
  };
}
