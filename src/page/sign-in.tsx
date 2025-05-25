"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSignIn } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import * as z from "zod";

const signInSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignInFormValues) {
    setError("");
    setLoading(true);
    if (!isLoaded) return;
    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = "/";
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> };
      setError(error.errors?.[0]?.message || "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "",
        redirectUrlComplete: "/",
      });
    } catch (error: unknown) {
      console.error("Google sign in error:", error);
      setError("Failed to sign in with Google.");
    }
  }

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-100">
      <div className="flex flex-col justify-center w-full max-w-4xl gap-6">
        <div className={cn("flex flex-col gap-6 justify-center")}>
          <Card className="overflow-hidden border-0 shadow-lg">
            <CardContent className="grid p-0 md:grid-cols-2">
              <Form {...form}>
                <form
                  className="p-6 md:p-8 bg-gradient-to-b from-white to-slate-50"
                  onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center text-center">
                      <h1 className="text-2xl font-bold">Welcome Back</h1>
                      <p className="text-balance text-muted-foreground">
                        Sign in to your WNS account
                      </p>
                    </div>
                    {error && (
                      <div className="text-sm text-center text-red-500">
                        {error}
                      </div>
                    )}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="m@example.com"
                              type="email"
                              autoComplete="username"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center">
                            <FormLabel>Password</FormLabel>
                            <Link
                              to="/forgot-password"
                              className="ml-auto text-sm underline-offset-2 hover:underline">
                              Forgot password?
                            </Link>
                          </div>
                          <FormControl>
                            <Input
                              type="password"
                              autoComplete="current-password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      disabled={loading}>
                      {loading ? "Processing..." : "Sign In"}
                    </Button>
                    <div className="relative text-sm text-center after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                      <span className="relative z-10 px-2 bg-background text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                    <div className="w-full">
                      <Button
                        variant="outline"
                        className="w-full transition-all duration-300 border border-gray-200 hover:bg-gray-50"
                        type="button"
                        onClick={handleGoogleSignIn}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          aria-hidden="true">
                          <path
                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                            fill="currentColor"
                          />
                        </svg>
                        <span>Sign in with Google</span>
                      </Button>
                    </div>
                    <div className="text-sm text-center">
                      Don't have an account?{" "}
                      <Link
                        to="/sign-up"
                        className="underline underline-offset-4">
                        Sign up
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
              <div className="relative hidden bg-gradient-to-tr from-blue-600 to-indigo-800 md:block">
                <img
                  src="/assets/images/sign-in-hero.webp"
                  alt="Water Network Simulation Illustration"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            By continuing, you agree to our{" "}
            <Link to="/terms">Terms of Service</Link> and{" "}
            <Link to="/privacy">Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
