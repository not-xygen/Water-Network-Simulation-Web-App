import { Button } from "@/components/ui/button";
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
import useGlobalStore from "@/store/globals";

export function AdvancedPreferences() {
  const { developerMode, setDeveloperMode } = useGlobalStore();

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
          <Switch
            id="dev-mode"
            checked={developerMode}
            onCheckedChange={setDeveloperMode}
          />
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
