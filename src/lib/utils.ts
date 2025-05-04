import { PIXEL_TO_CM } from "@/constant/globals";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatLengthCm = (lengthInPixel: number) => {
  return `${(lengthInPixel * PIXEL_TO_CM).toFixed(1)} cm`;
};
