import { DialogProfileImage } from "@/components/dialog/dialog-profile-image";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { NameFields } from "@/components/ui/form-fields";
import { useAccountForm } from "@/hooks/use-account-form";
import { SignedIn, SignedOut, useClerk, useUser } from "@clerk/clerk-react";
import { LogOut, Pencil, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router";
import { Separator } from "../ui/separator";

export function AccountPreferences() {
	const { user } = useUser();
	const { signOut, redirectToUserProfile } = useClerk();
	const { form, error, isLoading, onSubmit } = useAccountForm();
	const isDirty = form.formState.isDirty;
	const navigate = useNavigate();

	const handleReset = () => {
		form.reset({
			firstName: user?.firstName || "",
			lastName: user?.lastName || "",
		});
	};

	const handleSignOut = () => {
		signOut();
		navigate("/");
	};

	return (
		<>
			<SignedIn>
				<div className="flex flex-col h-full gap-6">
					<div>
						<h3 className="text-lg font-medium">Account</h3>
						<p className="text-sm text-muted-foreground">
							Manage your account settings and preferences.
						</p>
					</div>

					<div>
						<div className="flex items-center gap-4 mb-6">
							<DialogProfileImage>
								<div className="relative w-20 h-20 overflow-hidden rounded-full cursor-pointer group">
									<img
										src={user?.imageUrl}
										alt={user?.fullName || "Profile"}
										className="object-cover w-full h-full"
									/>
									<div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/50 group-hover:opacity-100">
										<Pencil className="w-4 h-4 text-white" />
									</div>
								</div>
							</DialogProfileImage>
							<div>
								<h3 className="text-lg font-medium">Profile Picture</h3>
								<p className="text-sm text-gray-500">
									Upload a new profile picture
								</p>
							</div>
						</div>

						<div className="flex flex-col justify-center flex-1">
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-6"
								>
									<NameFields
										control={form.control}
										firstNameName="firstName"
										lastNameName="lastName"
									/>

									{error && <div className="text-sm text-red-600">{error}</div>}

									<div className="flex items-center gap-2">
										<Button type="submit" disabled={isLoading || !isDirty}>
											{isLoading ? "Saving..." : "Save changes"}
										</Button>
										{isDirty && (
											<Button
												type="button"
												variant="outline"
												size="icon"
												onClick={handleReset}
												disabled={isLoading}
											>
												<RotateCcw className="w-4 h-4" />
												<span className="sr-only">Reset form</span>
											</Button>
										)}
									</div>
								</form>
							</Form>
						</div>
					</div>

					<Separator />

					<div className="space-y-4">
						<h4 className="font-medium">Account Settings</h4>
						<div className="">
							<Button
								variant="outline"
								className="flex items-center gap-2 mb-4"
								onClick={() => redirectToUserProfile()}
							>
								Account Settings
							</Button>
							<Button
								variant="destructive"
								onClick={handleSignOut}
								className="flex items-center gap-2"
							>
								<LogOut className="w-4 h-4" />
								Sign Out
							</Button>
							<p className="mt-2 text-xs text-gray-500">
								Sign out from your account
							</p>
						</div>
					</div>
				</div>
			</SignedIn>
			<SignedOut>
				<div className="flex flex-col items-center justify-center h-full space-y-4">
					<h3 className="text-lg font-medium">You are not signed in</h3>
					<p className="text-sm text-muted-foreground">
						Please sign in to access account settings
					</p>
					<Button onClick={() => navigate("/login")}>Sign In</Button>
				</div>
			</SignedOut>
		</>
	);
}
