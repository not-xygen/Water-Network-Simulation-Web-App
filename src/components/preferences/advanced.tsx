import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function AdvancedPreferences() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Advanced Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure advanced options for power users.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Developer Options</h4>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="dev-mode">Developer Mode</Label>
            <p className="text-sm text-muted-foreground">
              Enable additional debugging tools and options
            </p>
          </div>
          <Switch id="dev-mode" />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="verbose-logging">Verbose Logging</Label>
            <p className="text-sm text-muted-foreground">
              Enable detailed application logs
            </p>
          </div>
          <Switch id="verbose-logging" />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">API Settings</h4>

        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <div className="flex gap-2">
            <Input
              id="api-key"
              type="password"
              value="••••••••••••••••••••••••••••••"
              readOnly
            />
            <Button variant="outline">Regenerate</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your API key grants full access to your account. Keep it secure.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="api-url">API Endpoint</Label>
          <Input id="api-url" defaultValue="https://api.example.com/v1" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="request-timeout">Request Timeout (ms)</Label>
          <Input id="request-timeout" type="number" defaultValue="30000" />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Experimental Features</h4>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="beta-features">Beta Features</Label>
            <p className="text-sm text-muted-foreground">
              Enable experimental features that are still in development
            </p>
          </div>
          <Switch id="beta-features" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-css">Custom CSS</Label>
          <Textarea
            id="custom-css"
            placeholder="/* Add your custom CSS here */"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Add custom CSS to modify the application's appearance. Use at your
            own risk.
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Performance</h4>

        <div className="space-y-2">
          <Label htmlFor="cache-strategy">Cache Strategy</Label>
          <Select defaultValue="balanced">
            <SelectTrigger id="cache-strategy">
              <SelectValue placeholder="Select cache strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minimal">Minimal (Save Memory)</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="aggressive">
                Aggressive (Faster Performance)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline">Clear Application Cache</Button>
      </div>
    </div>
  );
}
