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
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { useSignUp } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import * as z from "zod";

const signUpSchema = z
	.object({
		firstName: z.string().min(1, "Nama depan harus diisi"),
		lastName: z.string().min(1, "Nama belakang harus diisi"),
		email: z.string().email("Email tidak valid"),
		password: z
			.string()
			.min(8, "Password minimal 8 karakter")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Password harus mengandung huruf besar, huruf kecil, dan angka",
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Password tidak cocok",
		path: ["confirmPassword"],
	});

const verificationSchema = z.object({
	code: z.string().length(6, "Kode verifikasi harus 6 digit"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;
type VerificationFormValues = z.infer<typeof verificationSchema>;

export default function SignUp() {
	const { isLoaded, signUp, setActive } = useSignUp();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
				redirectUrl: "",
				redirectUrlComplete: "/",
			});
		} catch (error: unknown) {
			console.error("Google sign up error:", error);
			setError("Failed to sign up with Google.");
		}
	};

	return (
		<div className="flex items-center justify-center w-full min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-100">
			<div className="flex flex-col justify-center w-full max-w-4xl gap-6">
				<div className={cn("flex flex-col gap-6 justify-center")}>
					<Card className="overflow-hidden border-0 shadow-lg">
						<CardContent className="grid p-0 md:grid-cols-2">
							{!verificationPending ? (
								<Form {...form}>
									<form
										className="p-6 md:p-8 bg-gradient-to-b from-white to-slate-50"
										onSubmit={form.handleSubmit(onSubmit)}
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
												<FormField
													control={form.control}
													name="firstName"
													render={({ field }) => (
														<FormItem>
															<FormLabel>First Name</FormLabel>
															<FormControl>
																<Input type="text" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="lastName"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Last Name</FormLabel>
															<FormControl>
																<Input type="text" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
											<FormField
												control={form.control}
												name="email"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Email</FormLabel>
														<FormControl>
															<Input
																type="email"
																placeholder="m@example.com"
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
														<FormLabel>Password</FormLabel>
														<FormControl>
															<div className="relative">
																<Input
																	type={showPassword ? "text" : "password"}
																	{...field}
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
																		{showPassword
																			? "Hide password"
																			: "Show password"}
																	</span>
																</Button>
															</div>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="confirmPassword"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Confirm Password</FormLabel>
														<FormControl>
															<div className="relative">
																<Input
																	type={
																		showConfirmPassword ? "text" : "password"
																	}
																	{...field}
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
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
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
								</Form>
							) : (
								<Form {...verificationForm}>
									<form
										className="p-6 md:p-8 bg-gradient-to-b from-white to-slate-50"
										onSubmit={verificationForm.handleSubmit(
											onVerificationSubmit,
										)}
									>
										<div className="flex flex-col gap-6">
											<div className="flex flex-col items-center text-center">
												<h1 className="text-2xl font-bold">
													Verify your email
												</h1>
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
												<FormField
													control={verificationForm.control}
													name="code"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Verification Code</FormLabel>
															<FormControl>
																<div className="flex flex-col items-center">
																	<InputOTP
																		maxLength={6}
																		value={field.value}
																		onChange={field.onChange}
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
																</div>
															</FormControl>
															<FormMessage />
														</FormItem>
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
								</Form>
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
