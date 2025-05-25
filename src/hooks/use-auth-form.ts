// use-auth-form.ts - Complete fix for Google OAuth issues

import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();

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
        toast({
          title: "Success",
          description: "Successfully signed in!",
        });
        navigate("/");
      } else {
        const message = "Authentication failed. Please try again.";
        setError(message);
        toast({
          variant: "destructive",
          title: "Error",
          description: message,
        });
      }
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> };
      const errorMessage = error.errors?.[0]?.message || "";

      if (errorMessage.toLowerCase().includes("verification strategy")) {
        const message =
          "This account is registered with Google. Please sign in with Google.";
        setError(message);
        toast({
          variant: "destructive",
          title: "Error",
          description: message,
        });
      } else {
        const message = errorMessage || "Invalid email or password.";
        setError(message);
        toast({
          variant: "destructive",
          title: "Error",
          description: message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;

    try {
      setIsLoading(true);
      setError("");

      console.log("Starting Google OAuth sign in with:", {
        origin: window.location.origin,
        currentPath: window.location.pathname,
      });

      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: "/",
      });
    } catch (error: unknown) {
      console.error("Google sign in error:", error);

      const err = error as {
        errors?: Array<{ message: string; code?: string }>;
      };
      let message = "Failed to sign in with Google. Please try again.";

      if (err.errors?.[0]) {
        const errorCode = err.errors[0].code;
        const errorMessage = err.errors[0].message;

        console.log("OAuth Error Details:", { errorCode, errorMessage });

        switch (errorCode) {
          case "oauth_access_denied":
            message = "Google sign-in was cancelled.";
            break;
          case "oauth_callback_url_mismatch":
            message =
              "OAuth redirect URL mismatch. Check your Clerk dashboard settings.";
            break;
          case "oauth_application_suspended":
            message = "OAuth application is suspended. Contact support.";
            break;
          case "oauth_email_domain_reserved_by_saml":
            message =
              "This email domain uses SAML. Contact your administrator.";
            break;
          default:
            message = errorMessage || message;
        }
      }

      toast({
        variant: "destructive",
        title: "Google Sign-In Error",
        description: message,
      });
      setError(message);
    } finally {
      setIsLoading(false);
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
  const { toast } = useToast();

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
        toast({
          title: "Success",
          description: "Successfully signed up!",
        });
        navigate("/");
      } else {
        setVerificationPending(true);
        setEmailAddress(data.email);
        await signUp.prepareEmailAddressVerification();
        toast({
          title: "Verification Required",
          description: "Please check your email for verification code.",
        });
      }
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> };
      const message =
        error.errors?.[0]?.message || "An error occurred during registration";
      setError(message);
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
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
        toast({
          title: "Success",
          description: "Email verified successfully!",
        });
        navigate("/");
      } else {
        const message = "Verification failed. Please try again.";
        setError(message);
        toast({
          variant: "destructive",
          title: "Error",
          description: message,
        });
      }
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> };
      const message =
        error.errors?.[0]?.message || "An error occurred during verification";
      setError(message);
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
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
      toast({
        title: "Success",
        description: "Verification code has been resent to your email.",
      });
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> };
      const message =
        error.errors?.[0]?.message || "Failed to resend verification code";
      setError(message);
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;

    try {
      setIsLoading(true);
      setError("");

      console.log("Starting Google OAuth sign up with:", {
        origin: window.location.origin,
        currentPath: window.location.pathname,
      });

      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: "/",
      });
    } catch (error: unknown) {
      console.error("Google sign up error:", error);

      const err = error as {
        errors?: Array<{ message: string; code?: string }>;
      };
      let message = "Failed to sign up with Google. Please try again.";

      if (err.errors?.[0]) {
        const errorCode = err.errors[0].code;
        const errorMessage = err.errors[0].message;

        console.log("OAuth Signup Error:", { errorCode, errorMessage });

        switch (errorCode) {
          case "oauth_access_denied":
            message = "Google sign-up was cancelled.";
            break;
          case "oauth_callback_url_mismatch":
            message =
              "OAuth redirect URL mismatch. Check your Clerk dashboard.";
            break;
          case "oauth_email_domain_reserved_by_saml":
            message = "This email domain uses SAML authentication.";
            break;
          case "identifier_already_exists":
            message =
              "An account with this email already exists. Try signing in instead.";
            break;
          default:
            message = errorMessage || message;
        }
      }

      toast({
        variant: "destructive",
        title: "Google Sign-Up Error",
        description: message,
      });
      setError(message);
    } finally {
      setIsLoading(false);
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
