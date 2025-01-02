import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizePath(filePath: string) {
  // Decode the URL-encoded path
  const decodedPath = filePath
    .replace(/^file:\/\/\//, '')
    .replace(/%3A/g, ':')
    .replace(/%2F/g, '/')
    .replace(/%5C/g, '\\')
    .replace(/%20/g, ' ')

  // Get the last two segments of the path for display
  const segments = decodedPath.split(/[\\/]/)
  const shortPath = segments.slice(-2).join('\\')

  return {
    fullPath: decodedPath,
    shortPath
  }
}
