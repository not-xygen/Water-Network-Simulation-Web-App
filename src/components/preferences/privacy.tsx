import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";

export function PrivacyPreferences() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Privacy Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your privacy and data settings.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Data Collection</h4>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="analytics">Usage Analytics</Label>
            <p className="text-sm text-muted-foreground">
              Allow us to collect anonymous usage data to improve our service
            </p>
          </div>
          <Switch id="analytics" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="crash-reports">Crash Reports</Label>
            <p className="text-sm text-muted-foreground">
              Automatically send crash reports to help us fix issues
            </p>
          </div>
          <Switch id="crash-reports" defaultChecked />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Cookies</h4>

        <div className="space-y-2">
          <Label>Cookie Preferences</Label>
          <RadioGroup defaultValue="essential">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="essential" id="essential" />
              <div className="grid gap-0.5">
                <Label htmlFor="essential">Essential Only</Label>
                <p className="text-sm text-muted-foreground">
                  Only cookies required for the application to function
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="functional" id="functional" />
              <div className="grid gap-0.5">
                <Label htmlFor="functional">Functional</Label>
                <p className="text-sm text-muted-foreground">
                  Cookies that remember your preferences
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <div className="grid gap-0.5">
                <Label htmlFor="all">All Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Allow all cookies including analytics and advertising
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Account Visibility</h4>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="profile-visibility">Public Profile</Label>
            <p className="text-sm text-muted-foreground">
              Make your profile visible to other users
            </p>
          </div>
          <Switch id="profile-visibility" />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="activity-visibility">Activity Status</Label>
            <p className="text-sm text-muted-foreground">
              Show when you're active on the platform
            </p>
          </div>
          <Switch id="activity-visibility" />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Your Data</h4>

        <div className="flex flex-col gap-2">
          <Button variant="outline" className="justify-start">
            <Download className="w-4 h-4 mr-2" />
            Download Your Data
          </Button>
          <Button
            variant="outline"
            className="justify-start text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All Data
          </Button>
        </div>
      </div>
    </div>
  );
}
