"use client";

import { DialogProfileImage } from "@/components/dialog-profile-image";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { NameFields } from "@/components/ui/form-fields";
import { useAccountForm } from "@/hooks/use-account-form";
import { useUser } from "@clerk/clerk-react";
import { Pencil, RotateCcw } from "lucide-react";

export function AccountPreferences() {
  const { user } = useUser();
  const { form, error, isLoading, onSubmit } = useAccountForm();
  const isDirty = form.formState.isDirty;

  const handleReset = () => {
    form.reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    });
  };

  return (
    <div className="flex flex-col h-full">
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
          <p className="text-sm text-gray-500">Upload a new profile picture</p>
        </div>
      </div>

      <div className="flex flex-col justify-center flex-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  disabled={isLoading}>
                  <RotateCcw className="w-4 h-4" />
                  <span className="sr-only">Reset form</span>
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
