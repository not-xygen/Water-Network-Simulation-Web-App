/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { PIXEL_TO_CM } from "@/constant/globals";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";

export const renderEditableProperty = <T,>(
  key: string,
  value: T,
  onChange: (value: T) => void,
) => {
  if (key === "status") {
    return (
      <div className="flex justify-between">
        <Switch
          id="node-active"
          onCheckedChange={(checked) =>
            onChange((checked ? "open" : "close") as T)
          }
          className="h-4"
        />
      </div>
    );
  }

  if (key === "note") {
    return (
      <Textarea
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full px-1 py-0.5 text-xs h-max md:text-xs"
      />
    );
  }

  if (typeof value === "number") {
    return (
      <Input
        type="number"
        className="w-full px-1 py-0.5 text-xs h-max md:text-xs"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as T)}
      />
    );
  }

  return (
    <Input
      type="text"
      className="w-full px-1 py-0.5 text-xs h-max md:text-xs"
      // biome-ignore lint/suspicious/noExplicitAny: <intended>
      value={value as any}
      onChange={(e) => onChange(e.target.value as T)}
    />
  );
};

export const renderEditableProperties = <T extends object>(
  obj: T,
  exclude: string[],
  update: <K extends keyof T>(key: K, value: T[K]) => void,
) => {
  return Object.entries(obj)
    .filter(([key]) => !exclude.includes(key))
    .map(([key, value]) => {
      const isNote = key === "note";
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      return (
        <div
          key={key}
          className={`flex ${
            isNote ? "flex-col" : "items-center justify-between"
          } gap-2 w-full`}>
          <span className="w-1/2 flex gap-0.5 capitalize">
            {label}
            {key === "diameter" || key === "height" ? (
              <span className="font-mono text-xs text-gray-400 lowercase">
                (cm)
              </span>
            ) : null}
          </span>
          <div className="w-1/2">
            {renderEditableProperty(key, value, (v) =>
              update(key as keyof T, v),
            )}
          </div>
        </div>
      );
    });
};

export const renderReadonlyProperties = <T extends object>(
  obj: T,
  exclude: string[] = [],
) => {
  return Object.entries(obj)
    .filter(([key]) => !exclude.includes(key))
    .map(([key, value]) => {
      let displayValue: React.ReactNode = String(value);

      if (
        (key === "elevation" || key === "head") &&
        typeof value === "number"
      ) {
        displayValue = `${value.toFixed()} m`;
      }

      if (key === "length" && typeof value === "number") {
        displayValue = `${(value * PIXEL_TO_CM).toFixed(1)} cm`;
      }

      if (
        (key === "diameter" || key === "height") &&
        typeof value === "number"
      ) {
        displayValue = `${value} cm`;
      }

      if (key === "flowRate" && typeof value === "number") {
        displayValue = `${Math.abs(value).toFixed(4)} L/s`;
      }

      if (
        (key === "pressure" ||
          key === "inletPressure" ||
          key === "outletPressure") &&
        typeof value === "number"
      ) {
        displayValue = `${value.toFixed(4)} bar`;
      }

      if (key === "currentVolume" && typeof value === "number") {
        displayValue = `${value.toFixed(2)} L`;
      }

      if (key === "currentVolumeHeight" && typeof value === "number") {
        displayValue = `${value.toFixed(4)} m`;
      }

      if (key === "maxVolume" && typeof value === "number") {
        displayValue = `${value.toFixed()} L`;
      }

      if (key === "filledPercentage" && typeof value === "number") {
        displayValue = `${value.toFixed(2)} %`;
      }

      if (
        (key === "minorLossCoefficient" || key === "roughness") &&
        typeof value === "number"
      ) {
        displayValue = `${value} C`;
      }

      if (key === "velocity" && typeof value === "number") {
        displayValue = `${value.toFixed(4)} m/s`;
      }

      if (key === "suctionHeadMax" && typeof value === "number") {
        displayValue = `${value} m`;
      }

      if (key === "totalHeadMax" && typeof value === "number") {
        displayValue = `${value} m`;
      }

      if (key === "capacityMax" && typeof value === "number") {
        displayValue = `${value} L/min`;
      }

      if (key === "suctionPipeDiameter" && typeof value === "number") {
        displayValue = `${value} cm`;
      }

      return (
        <div
          key={key}
          className="flex items-center justify-between w-full gap-2">
          <span className="w-1/2 flex gap-0.5 capitalize">{key}</span>
          <span className="w-1/2 font-mono text-xs">{displayValue}</span>
        </div>
      );
    });
};
