import { PIXEL_TO_CM } from "@/constant/globals";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatLengthCm = (lengthInPixel: number) => {
  return `${(lengthInPixel * PIXEL_TO_CM).toFixed(1)} cm`;
};

export const formatElapsedTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
};

export function formatFlowRate(flowRateLps: number): string {
  return `${flowRateLps.toFixed(1)} L/s`;
}

export const formatPressure = (pressure: number) => {
  const bar = pressure / 100;
  return `${bar.toFixed(2)} bar`;
};

/**
 * Menghitung velocity (m/s) dari flowrate (L/s) dan diameter pipa (mm).
 * @param flowRateLps Flowrate dalam liter per detik (L/s)
 * @param diameterMm Diameter pipa dalam milimeter (mm)
 * @returns Velocity dalam meter per detik (m/s)
 */
export function calculateVelocity(
  flowRateLps: number,
  diameterMm: number,
): number {
  if (diameterMm <= 0) return 0;

  const flowRateM3s = flowRateLps / 1000;
  const diameterM = diameterMm / 1000;
  const area = Math.PI * (diameterM / 2) ** 2;
  const velocity = flowRateM3s / area;

  return velocity;
}
