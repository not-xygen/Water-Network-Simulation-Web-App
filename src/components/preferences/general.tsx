import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

export function GeneralPreferences() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure your general application preferences.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select defaultValue="id">
            <SelectTrigger id="language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">Bahasa Indonesia</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Time Zone</Label>
          <Select defaultValue="asia-jakarta">
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Select time zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asia-jakarta">Asia/Jakarta (GMT+7)</SelectItem>
              <SelectItem value="asia-singapore">
                Asia/Singapore (GMT+8)
              </SelectItem>
              <SelectItem value="america-los_angeles">
                America/Los Angeles (GMT-8)
              </SelectItem>
              <SelectItem value="america-new_york">
                America/New York (GMT-5)
              </SelectItem>
              <SelectItem value="europe-london">
                Europe/London (GMT+0)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date Format</Label>
          <RadioGroup defaultValue="dd-mm-yyyy">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dd-mm-yyyy" id="dd-mm-yyyy" />
              <Label htmlFor="dd-mm-yyyy">DD-MM-YYYY</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mm-dd-yyyy" id="mm-dd-yyyy" />
              <Label htmlFor="mm-dd-yyyy">MM-DD-YYYY</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yyyy-mm-dd" id="yyyy-mm-dd" />
              <Label htmlFor="yyyy-mm-dd">YYYY-MM-DD</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Notifications</h4>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email notifications about account activity
            </p>
          </div>
          <Switch id="email-notifications" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications in your browser
            </p>
          </div>
          <Switch id="push-notifications" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="update-notifications">Product Updates</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications about product updates and new features
            </p>
          </div>
          <Switch id="update-notifications" />
        </div>
      </div>
    </div>
  );
}
