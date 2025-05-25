import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NameFields, PasswordField } from "@/components/ui/form-fields";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useSignUpForm } from "@/hooks/use-auth-form";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Controller, FormProvider } from "react-hook-form";
import { Link, useNavigate } from "react-router";

export default function SignUp() {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const {
		form,
		verificationForm,
		error: formError,
		isLoading: formLoading,
		verificationPending: formVerificationPending,
		emailAddress: formEmailAddress,
		onSubmit,
		onVerificationSubmit,
		resendCode,
		handleGoogleSignUp,
	} = useSignUpForm();

	return (
		<div className="flex items-center justify-center w-full min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-100">
			<div className="flex flex-col justify-center w-full max-w-4xl gap-6">
				<div className={cn("flex flex-col gap-6 justify-center")}>
					<Card className="overflow-hidden border-0 shadow-lg">
						<CardContent className="grid p-0 md:grid-cols-2">
							{!formVerificationPending ? (
								<FormProvider {...form}>
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
											{formError && (
												<div className="text-sm text-center text-red-500">
													{formError}
												</div>
											)}
											<NameFields
												control={form.control}
												firstNameName="firstName"
												lastNameName="lastName"
											/>
											<div className="grid gap-2">
												<Label htmlFor="email">Email</Label>
												<Controller
													control={form.control}
													name="email"
													render={({ field }) => (
														<Input
															id="email"
															type="email"
															placeholder="m@example.com"
															{...field}
														/>
													)}
												/>
												{form.formState.errors.email && (
													<p className="text-xs text-red-500">
														{form.formState.errors.email.message}
													</p>
												)}
											</div>
											<PasswordField
												control={form.control}
												name="password"
												label="Password"
												showPassword={showPassword}
												onTogglePassword={() => setShowPassword(!showPassword)}
											/>
											<PasswordField
												control={form.control}
												name="confirmPassword"
												label="Confirm Password"
												showPassword={showConfirmPassword}
												onTogglePassword={() =>
													setShowConfirmPassword(!showConfirmPassword)
												}
											/>
											<Button
												type="submit"
												className="w-full transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
												disabled={formLoading}
											>
												{formLoading ? "Processing..." : "Sign Up"}
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
								</FormProvider>
							) : (
								<div className="flex items-center justify-center p-6 md:p-8 bg-gradient-to-b from-white to-slate-50">
									<Card className="w-full max-w-md bg-transparent border-none shadow-none">
										<CardContent className="p-6">
											<form
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
															We sent a verification code to {formEmailAddress}
														</p>
													</div>
													{formError && (
														<div className="text-sm text-center text-red-500">
															{formError}
														</div>
													)}
													<div className="grid gap-2 place-items-center">
														<Label htmlFor="code">Verification Code</Label>
														<Controller
															control={verificationForm.control}
															name="code"
															rules={{
																required: "Verification code is required",
															}}
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
																	{verificationForm.formState.errors.code && (
																		<p className="text-xs text-red-500">
																			{
																				verificationForm.formState.errors.code
																					.message
																			}
																		</p>
																	)}
																</div>
															)}
														/>
													</div>
													<Button
														type="submit"
														className="w-full transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
														disabled={formLoading}
													>
														{formLoading ? "Verifying..." : "Verify Email"}
													</Button>
													<div className="text-sm text-center">
														Didn't receive the code?{" "}
														<Button
															variant="link"
															className="h-auto p-0 font-semibold"
															onClick={resendCode}
															disabled={formLoading}
														>
															Resend code
														</Button>
													</div>
												</div>
											</form>
										</CardContent>
									</Card>
								</div>
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
