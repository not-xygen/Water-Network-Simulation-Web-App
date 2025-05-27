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
    if (!user) {
      setError("User not available");
      return;
    }

    if (typeof user.update !== "function") {
      setError("User not available");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      await user.update({
        firstName: data.firstName,
        lastName: data.lastName,
      });

      form.reset({
        firstName: data.firstName,
        lastName: data.lastName,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Update failed");
      }
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
