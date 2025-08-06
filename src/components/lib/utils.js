// src/lib/utils.js
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Combines tailwind classes and merges conflicts like "p-4 p-2"
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
