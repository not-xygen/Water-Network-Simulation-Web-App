import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PencilIcon } from "lucide-react";

export function AccountPreferences() {
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
              src="/placeholder.svg?height=80&width=80"
              alt="Profile"
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full">
            <PencilIcon className="w-3 h-3" />
            <span className="sr-only">Change avatar</span>
          </Button>
        </div>
        <div>
          <h4 className="font-medium">John Doe</h4>
          <p className="text-sm text-muted-foreground">john.doe@example.com</p>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Personal Information</h4>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input id="first-name" defaultValue="John" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input id="last-name" defaultValue="Doe" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" defaultValue="john.doe@example.com" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Password</h4>

        <div className="space-y-2">
          <Label htmlFor="current-password">Current Password</Label>
          <Input id="current-password" type="password" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
        </div>

        <Button className="mt-2">Update Password</Button>
      </div>
    </div>
  );
}
