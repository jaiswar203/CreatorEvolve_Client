import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCloudFrontURL = (url: string) =>
  `${process.env.NEXT_PUBLIC_CLOUDFRONT_HOSTNAME}/${url}`;

export const secondsToHms = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [hours, minutes, secs].map((v) => (v < 10 ? "0" + v : v)).join(":");
};
