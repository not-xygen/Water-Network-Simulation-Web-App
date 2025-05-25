import { type AccountFormValues, accountSchema } from "@/lib/validations/auth";
import { useUser } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function useAccountForm() {
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
      form.reset({
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

  return {
    form,
    error,
    isLoading,
    onSubmit,
  };
}
