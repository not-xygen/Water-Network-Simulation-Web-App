import * as z from "zod";

export const signInSchema = z.object({
	email: z.string().email("Invalid email"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signUpSchema = z
	.object({
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().min(1, "Last name is required"),
		email: z.string().email("Invalid email"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Password must contain uppercase, lowercase, and numbers",
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const verificationSchema = z.object({
	code: z.string().length(6, "Verification code must be 6 digits"),
});

export const accountSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type VerificationFormValues = z.infer<typeof verificationSchema>;
export type AccountFormValues = z.infer<typeof accountSchema>;
