import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export function AccessibilityPreferences() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Accessibility</h3>
        <p className="text-sm text-muted-foreground">
          Customize accessibility settings to improve your experience.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="screen-reader">Screen Reader Support</Label>
            <p className="text-sm text-muted-foreground">
              Optimize the interface for screen readers
            </p>
          </div>
          <Switch id="screen-reader" />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="reduce-motion">Reduce Motion</Label>
            <p className="text-sm text-muted-foreground">
              Minimize animations and transitions
            </p>
          </div>
          <Switch id="reduce-motion" />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="high-contrast">High Contrast</Label>
            <p className="text-sm text-muted-foreground">
              Increase contrast for better visibility
            </p>
          </div>
          <Switch id="high-contrast" />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Text Options</h4>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="text-size">Text Size</Label>
            <span className="text-sm text-muted-foreground">100%</span>
          </div>
          <Slider
            id="text-size"
            defaultValue={[100]}
            max={200}
            min={50}
            step={10}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>50%</span>
            <span>200%</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Text Spacing</Label>
          <RadioGroup defaultValue="normal">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="normal" id="normal-spacing" />
              <Label htmlFor="normal-spacing">Normal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium-spacing" />
              <Label htmlFor="medium-spacing">Medium</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="large" id="large-spacing" />
              <Label htmlFor="large-spacing">Large</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Focus Indicators</h4>

        <div className="space-y-2">
          <Label>Focus Style</Label>
          <RadioGroup defaultValue="outline">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="outline" id="outline-focus" />
              <Label htmlFor="outline-focus">Outline</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="solid" id="solid-focus" />
              <Label htmlFor="solid-focus">Solid Background</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="underline" id="underline-focus" />
              <Label htmlFor="underline-focus">Underline</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
