import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { DialogProfileImage } from "../dialog-profile-image";

const accountSchema = z.object({
	firstName: z.string().min(1, "Nama depan harus diisi"),
	lastName: z.string().min(1, "Nama belakang harus diisi"),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export function AccountForm() {
	const { user } = useUser();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const form = useForm<AccountFormValues>({
		resolver: zodResolver(accountSchema),
		defaultValues: {
			firstName: user?.firstName || "",
			lastName: user?.lastName || "",
		},
	});

	const onSubmit = async (data: AccountFormValues) => {
		if (!user) return;
		setError("");

		try {
			setIsLoading(true);
			await user.update({
				firstName: data.firstName,
				lastName: data.lastName,
			});
		} catch (err: unknown) {
			const error = err as { errors?: Array<{ message: string }> };
			setError(
				error.errors?.[0]?.message ||
					"An error occurred while updating profile",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Profile</h3>
				<p className="text-sm text-muted-foreground">
					This is how others will see you on the site.
				</p>
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<div className="flex items-center gap-4">
						<div className="relative w-20 h-20 overflow-hidden rounded-full">
							<img
								src={user?.imageUrl}
								alt={user?.fullName || "Profile"}
								className="object-cover w-full h-full"
							/>
						</div>
						<DialogProfileImage>
							<Button variant="outline" size="sm">
								Change avatar
							</Button>
						</DialogProfileImage>
					</div>
					{error && <div className="text-sm text-red-500">{error}</div>}
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
					<Button type="submit" disabled={isLoading}>
						{isLoading ? "Saving..." : "Save changes"}
					</Button>
				</form>
			</Form>
		</div>
	);
}
