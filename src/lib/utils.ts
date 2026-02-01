import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind merge support
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Get unique tags from a list of experiments
 */
export function getUniqueTags(experiments: { tags: string[] }[]): string[] {
  const tags = new Set<string>();
  experiments.forEach((exp) => exp.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}
