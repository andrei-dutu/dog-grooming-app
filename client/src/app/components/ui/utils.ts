import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateText(input?: string | null, max = 21) {
  if (!input) return '';
  return input.length > max ? input.slice(0, max - 1) + '…' : input;
}
