import * as z from "zod";

export const signInSchema = z.object({
	email: z.string().email("Email tidak valid"),
	password: z.string().min(8, "Password minimal 8 karakter"),
});

export const signUpSchema = z
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

export const verificationSchema = z.object({
	code: z.string().length(6, "Kode verifikasi harus 6 digit"),
});

export const accountSchema = z.object({
	firstName: z.string().min(1, "Nama depan harus diisi"),
	lastName: z.string().min(1, "Nama belakang harus diisi"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type VerificationFormValues = z.infer<typeof verificationSchema>;
export type AccountFormValues = z.infer<typeof accountSchema>;
