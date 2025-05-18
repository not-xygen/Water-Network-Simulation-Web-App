import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Sun, Monitor } from "lucide-react";

export function AppearancePreferences() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize how the application looks and feels.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Theme</Label>
          <Tabs defaultValue="system">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="light" className="flex items-center gap-2">
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </TabsTrigger>
              <TabsTrigger value="dark" className="flex items-center gap-2">
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                <span>System</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-2">
          <Label htmlFor="color-scheme">Color Scheme</Label>
          <Select defaultValue="blue">
            <SelectTrigger id="color-scheme">
              <SelectValue placeholder="Select color scheme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blue">Blue</SelectItem>
              <SelectItem value="green">Green</SelectItem>
              <SelectItem value="purple">Purple</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
              <SelectItem value="red">Red</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Text & Display</h4>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="font-size">Font Size</Label>
            <span className="text-sm text-muted-foreground">16px</span>
          </div>
          <Slider
            id="font-size"
            defaultValue={[16]}
            max={24}
            min={12}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Small</span>
            <span>Large</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="font-family">Font Family</Label>
          <Select defaultValue="inter">
            <SelectTrigger id="font-family">
              <SelectValue placeholder="Select font family" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inter">Inter</SelectItem>
              <SelectItem value="roboto">Roboto</SelectItem>
              <SelectItem value="open-sans">Open Sans</SelectItem>
              <SelectItem value="system">System Font</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="density">Compact Mode</Label>
            <p className="text-sm text-muted-foreground">
              Reduce spacing for a more compact layout
            </p>
          </div>
          <Switch id="density" />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Effects</h4>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="animations">Animations</Label>
            <p className="text-sm text-muted-foreground">
              Enable animations and transitions
            </p>
          </div>
          <Switch id="animations" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="blur-effects">Blur Effects</Label>
            <p className="text-sm text-muted-foreground">
              Enable background blur effects
            </p>
          </div>
          <Switch id="blur-effects" defaultChecked />
        </div>
      </div>
    </div>
  );
}
