import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtPct(n: number, digits = 0) {
  return `${(n * 100).toFixed(digits)}%`;
}

export function fmtDuration(blocks: number, blockSeconds = 12) {
  const seconds = blocks * blockSeconds;
  if (seconds < 60) return `${seconds}s`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  const days = hours / 24;
  return `${days.toFixed(1)}d`;
}

export function fmtHours(hours: number) {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 48) {
    return `${hours.toFixed(hours < 10 && hours !== Math.round(hours) ? 1 : 0)}h`;
  }
  const days = hours / 24;
  return `${days.toFixed(days < 10 && days !== Math.round(days) ? 1 : 0)}d`;
}
