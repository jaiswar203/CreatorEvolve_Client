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

export const extractExtension = (url: string) => {
  if (!url) return;

  const match = url.match(/\.(\w+)(?:\?.*)?$/);
  return match ? match[1] : null;
};

export const trimText = (text: string, len: number) =>
  text.length > len ? `${text.slice(0, len)}...` : text;

export const downloadFile = async (fileUrl: string, name: string) => {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const videoExtention = extractExtension(fileUrl);
    const videoName = `${name.replaceAll(" ", "-")}.${videoExtention}`;

    const a = document.createElement("a");
    a.href = url;
    a.download = videoName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading video:", error);
  }
};

export const getYouTubeVideoId = (url: string) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Check for standard YouTube URLs
    if (hostname === "www.youtube.com" || hostname === "youtube.com") {
      if (urlObj.pathname.startsWith("/watch")) {
        return urlObj.searchParams.get("v");
      } else if (urlObj.pathname.startsWith("/shorts/")) {
        return urlObj.pathname.split("/shorts/")[1];
      }
    }

    // Check for shortened YouTube URLs
    if (hostname === "youtu.be") {
      return urlObj.pathname.split("/")[1];
    }

    return null;
  } catch (e) {
    return null;
  }
};
