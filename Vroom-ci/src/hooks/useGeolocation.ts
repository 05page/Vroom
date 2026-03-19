import { useState, useEffect, useCallback } from "react"

/** Position géographique avec indicateur de fallback */
export interface GeoPosition {
  lat: number
  lng: number
  /** true si la position est le fallback Abidjan (refus ou indisponible) */
  isFallback: boolean
}

/** Fallback : coordonnées d'Abidjan */
const ABIDJAN: GeoPosition = {
  lat: 5.3599,
  lng: -4.0082,
  isFallback: true,
}

interface UseGeolocationReturn {
  /** Position actuelle (utilisateur ou fallback Abidjan) */
  position: GeoPosition | null
  /** true pendant la résolution de la position */
  loading: boolean
  /** Message d'erreur si la géolocalisation a échoué */
  error: string | null
  /** Relance une demande de géolocalisation */
  refresh: () => void
}

/**
 * Hook qui encapsule `navigator.geolocation.getCurrentPosition`.
 * - Retourne la position réelle si l'utilisateur accepte
 * - Fallback sur Abidjan { lat: 5.3599, lng: -4.0082 } si refus ou indisponible
 * - `isFallback` indique si la position est le fallback
 */
export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosition = useCallback(() => {
    setLoading(true)
    setError(null)

    // Géolocalisation indisponible dans ce navigateur
    if (!navigator.geolocation) {
      setError("Géolocalisation non supportée par ce navigateur")
      setPosition(ABIDJAN)
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isFallback: false,
        })
        setLoading(false)
      },
      (err) => {
        // Refus de permission ou erreur → fallback Abidjan
        setError(err.message)
        setPosition(ABIDJAN)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60_000, // Cache 1 minute pour éviter les appels répétés
      }
    )
  }, [])

  useEffect(() => {
    fetchPosition()
  }, [fetchPosition])

  return { position, loading, error, refresh: fetchPosition }
}
