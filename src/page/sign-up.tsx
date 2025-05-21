import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSignUp } from "@clerk/clerk-react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

type FormData = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
};

type VerificationData = {
	code: string;
};

export default function SignUp() {
	const { isLoaded, signUp, setActive } = useSignUp();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [verificationPending, setVerificationPending] = useState(false);
	const [emailAddress, setEmailAddress] = useState("");

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<FormData>();

	const {
		control,
		handleSubmit: handleVerificationSubmit,
		formState: { errors: verificationErrors },
	} = useForm<VerificationData>({
		defaultValues: {
			code: "",
		},
	});

	const onSubmit = async (data: FormData) => {
		if (!isLoaded) return;
		setError("");

		if (data.password !== data.confirmPassword) {
			setError("Passwords do not match");
			return;
		}

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

	const onVerificationSubmit = async (data: VerificationData) => {
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
			setError(error.errors?.[0]?.message || "Verification failed");
		} finally {
			setIsLoading(false);
		}
	};

	const resendCode = async () => {
		if (!isLoaded) return;
		try {
			await signUp.prepareEmailAddressVerification();
			setError("");
		} catch (err: unknown) {
			const error = err as { errors?: Array<{ message: string }> };
			setError(error.errors?.[0]?.message || "Failed to resend code");
		}
	};

	async function handleGoogleSignUp() {
		if (!isLoaded) return;
		try {
			await signUp.authenticateWithRedirect({
				strategy: "oauth_google",
				redirectUrl: "",
				redirectUrlComplete: "/",
			});
		} catch (error: unknown) {
			console.error("Google sign up error:", error);
			setError("Failed to sign up with Google.");
		}
	}

	return (
		<div className="flex items-center justify-center w-full min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-100">
			<div className="flex flex-col justify-center w-full max-w-4xl gap-6">
				<div className={cn("flex flex-col gap-6 justify-center")}>
					<Card className="overflow-hidden border-0 shadow-lg">
						<CardContent className="grid p-0 md:grid-cols-2">
							{!verificationPending ? (
								<form
									className="p-6 md:p-8 bg-gradient-to-b from-white to-slate-50"
									onSubmit={handleSubmit(onSubmit)}
								>
									<div className="flex flex-col gap-6">
										<div className="flex flex-col items-center text-center">
											<h1 className="text-2xl font-bold">Create Account</h1>
											<p className="text-balance text-muted-foreground">
												Sign up to create your WNS account
											</p>
										</div>
										{error && (
											<div className="text-sm text-center text-red-500">
												{error}
											</div>
										)}
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="firstName">First Name</Label>
												<Input
													id="firstName"
													{...register("firstName", {
														required: "First name is required",
													})}
													type="text"
												/>
												{errors.firstName && (
													<p className="text-xs text-red-500">
														{errors.firstName.message}
													</p>
												)}
											</div>
											<div className="space-y-2">
												<Label htmlFor="lastName">Last Name</Label>
												<Input
													id="lastName"
													{...register("lastName", {
														required: "Last name is required",
													})}
													type="text"
												/>
												{errors.lastName && (
													<p className="text-xs text-red-500">
														{errors.lastName.message}
													</p>
												)}
											</div>
										</div>
										<div className="grid gap-2">
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												type="email"
												placeholder="m@example.com"
												{...register("email", {
													required: "Email is required",
													pattern: {
														value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
														message: "Invalid email format",
													},
												})}
											/>
											{errors.email && (
												<p className="text-xs text-red-500">
													{errors.email.message}
												</p>
											)}
										</div>
										<div className="grid gap-2">
											<Label htmlFor="password">Password</Label>
											<div className="relative">
												<Input
													id="password"
													type={showPassword ? "text" : "password"}
													{...register("password", {
														required: "Password is required",
														minLength: {
															value: 8,
															message: "Password must be at least 8 characters",
														},
													})}
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
													onClick={() => setShowPassword(!showPassword)}
												>
													{showPassword ? (
														<EyeOffIcon className="w-4 h-4 text-gray-500" />
													) : (
														<EyeIcon className="w-4 h-4 text-gray-500" />
													)}
													<span className="sr-only">
														{showPassword ? "Hide password" : "Show password"}
													</span>
												</Button>
											</div>
											{errors.password && (
												<p className="text-xs text-red-500">
													{errors.password.message}
												</p>
											)}
										</div>
										<div className="grid gap-2">
											<Label htmlFor="confirmPassword">Confirm Password</Label>
											<div className="relative">
												<Input
													id="confirmPassword"
													type={showConfirmPassword ? "text" : "password"}
													{...register("confirmPassword", {
														required: "Confirm password is required",
														validate: (val: string) => {
															if (watch("password") !== val) {
																return "Passwords do not match";
															}
														},
													})}
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
													onClick={() =>
														setShowConfirmPassword(!showConfirmPassword)
													}
												>
													{showConfirmPassword ? (
														<EyeOffIcon className="w-4 h-4 text-gray-500" />
													) : (
														<EyeIcon className="w-4 h-4 text-gray-500" />
													)}
													<span className="sr-only">
														{showConfirmPassword
															? "Hide password"
															: "Show password"}
													</span>
												</Button>
											</div>
											{errors.confirmPassword && (
												<p className="text-xs text-red-500">
													{errors.confirmPassword.message}
												</p>
											)}
										</div>
										<Button
											type="submit"
											className="w-full transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
											disabled={isLoading}
										>
											{isLoading ? "Processing..." : "Sign Up"}
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
												onClick={handleGoogleSignUp}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													aria-hidden="true"
												>
													<path
														d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
														fill="currentColor"
													/>
												</svg>
												<span>Sign up with Google</span>
											</Button>
										</div>
										<div className="text-sm text-center">
											Already have an account?{" "}
											<Button
												variant="link"
												className="h-auto p-0 font-semibold"
												onClick={() => navigate("/sign-in")}
											>
												Sign In
											</Button>
										</div>
									</div>
								</form>
							) : (
								<form
									className="p-6 md:p-8 bg-gradient-to-b from-white to-slate-50"
									onSubmit={handleVerificationSubmit(onVerificationSubmit)}
								>
									<div className="flex flex-col gap-6">
										<div className="flex flex-col items-center text-center">
											<h1 className="text-2xl font-bold">Verify your email</h1>
											<p className="text-balance text-muted-foreground">
												We sent a verification code to {emailAddress}
											</p>
										</div>
										{error && (
											<div className="text-sm text-center text-red-500">
												{error}
											</div>
										)}
										<div className="grid gap-2 place-items-center">
											<Label htmlFor="code">Verification Code</Label>
											<Controller
												control={control}
												name="code"
												rules={{ required: "Verification code is required" }}
												render={({ field: { onChange, value } }) => (
													<div className="flex flex-col items-center">
														<InputOTP
															maxLength={6}
															value={value}
															onChange={onChange}
														>
															<InputOTPGroup>
																<InputOTPSlot
																	index={0}
																	className="text-2xl font-bold h-14 w-14"
																/>
																<InputOTPSlot
																	index={1}
																	className="text-2xl font-bold h-14 w-14"
																/>
																<InputOTPSlot
																	index={2}
																	className="text-2xl font-bold h-14 w-14"
																/>
																<InputOTPSlot
																	index={3}
																	className="text-2xl font-bold h-14 w-14"
																/>
																<InputOTPSlot
																	index={4}
																	className="text-2xl font-bold h-14 w-14"
																/>
																<InputOTPSlot
																	index={5}
																	className="text-2xl font-bold h-14 w-14"
																/>
															</InputOTPGroup>
														</InputOTP>
														{verificationErrors.code && (
															<p className="text-xs text-red-500">
																{verificationErrors.code.message}
															</p>
														)}
													</div>
												)}
											/>
										</div>
										<Button
											type="submit"
											className="w-full transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
											disabled={isLoading}
										>
											{isLoading ? "Verifying..." : "Verify Email"}
										</Button>
										<div className="text-sm text-center">
											Didn't receive the code?{" "}
											<Button
												variant="link"
												className="h-auto p-0 font-semibold"
												onClick={resendCode}
												disabled={isLoading}
											>
												Resend code
											</Button>
										</div>
									</div>
								</form>
							)}
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
