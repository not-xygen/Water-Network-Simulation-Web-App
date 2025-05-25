import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import type { Control, FieldValues, Path } from "react-hook-form";

interface TextFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
}

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  autoComplete,
}: TextFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface PasswordFieldProps<T extends FieldValues>
  extends Omit<TextFieldProps<T>, "type"> {
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export function PasswordField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  autoComplete,
  showPassword = false,
  onTogglePassword,
}: PasswordFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                autoComplete={autoComplete}
                {...field}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={onTogglePassword}>
                {showPassword ? (
                  <EyeOffIcon className="w-4 h-4 text-gray-500" />
                ) : (
                  <EyeIcon className="w-4 h-4 text-gray-500" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface NameFieldsProps<T extends FieldValues> {
  control: Control<T>;
  firstNameName: Path<T>;
  lastNameName: Path<T>;
}

export function NameFields<T extends FieldValues>({
  control,
  firstNameName,
  lastNameName,
}: NameFieldsProps<T>) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <TextField control={control} name={firstNameName} label="First Name" />
      <TextField control={control} name={lastNameName} label="Last Name" />
    </div>
  );
}
