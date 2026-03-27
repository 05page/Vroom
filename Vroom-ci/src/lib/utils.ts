import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Retourne l'URL d'affichage d'une photo véhicule.
 * - Si path est déjà une URL complète (Supabase) → utilisée directement
 * - Sinon → construit l'URL depuis le backend local (dev uniquement)
 */
export function getPhotoUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${path}`
}
