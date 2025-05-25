import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { PasswordField, TextField } from "@/components/ui/form-fields";
import { useSignInForm } from "@/hooks/use-auth-form";
import { cn } from "@/lib/utils";
import { Link } from "react-router";

export default function SignIn() {
  const { form, error, isLoading, onSubmit, handleGoogleSignIn } =
    useSignInForm();

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

                    <TextField
                      control={form.control}
                      name="email"
                      label="Email"
                      type="email"
                      autoComplete="email"
                    />

                    <PasswordField
                      control={form.control}
                      name="password"
                      label="Password"
                      autoComplete="current-password"
                    />

                    <Button
                      type="submit"
                      className="w-full transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign in"}
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
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}>
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
                        className="font-semibold text-blue-600 hover:text-blue-500">
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
