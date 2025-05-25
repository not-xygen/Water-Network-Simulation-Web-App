import { DialogProfileImage } from "@/components/dialog-profile-image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useClerk, useUser } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const accountSchema = z.object({
  firstName: z.string().min(1, "Nama depan harus diisi"),
  lastName: z.string().min(1, "Nama belakang harus diisi"),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export function AccountPreferences() {
  const { user } = useUser();
  const { redirectToUserProfile } = useClerk();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  const onSubmit = async (data: AccountFormValues) => {
    try {
      if (!user) return;

      await user.update({
        firstName: data.firstName,
        lastName: data.lastName,
      });

      reset(data);

      toast({
        title: "Profile updated successfully",
        description: "Your profile changes have been saved",
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Failed to update profile",
        description: "An error occurred while updating your profile",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account information and credentials.
        </p>
      </div>

      <Separator />

      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="w-20 h-20">
            <AvatarImage
              src={user?.imageUrl}
              alt={user?.fullName || "Profile"}
            />
            <AvatarFallback>
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <DialogProfileImage>
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full">
              <PencilIcon className="w-3 h-3" />
              <span className="sr-only">Change avatar</span>
            </Button>
          </DialogProfileImage>
        </div>
        <div>
          <h4 className="font-medium">{user?.fullName}</h4>
          <p className="text-sm text-muted-foreground">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>

      <Separator />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h4 className="font-medium">Personal Information</h4>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" {...register("firstName")} />
            {errors.firstName && (
              <p className="text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register("lastName")} />
            {errors.lastName && (
              <p className="text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={user?.primaryEmailAddress?.emailAddress || ""}
            disabled
          />
        </div>

        <Button type="submit" disabled={!isDirty || isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Password</h4>
        <p className="text-sm text-muted-foreground">
          To change your password, please visit Clerk security settings.
        </p>
        <Button
          onClick={async () => {
            await redirectToUserProfile();
          }}>
          Open Security Settings
        </Button>
      </div>
    </div>
  );
}
