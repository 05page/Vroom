// Fix CSS Leaflet — doit être importé avant tout composant react-leaflet
import "leaflet/dist/leaflet.css"

import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import type { UserProche } from "@/src/actions/geolocalisation.actions"

// ─── Fix icônes Leaflet manquantes avec webpack ───────────────────────────────
// Webpack ne résout pas automatiquement les assets internes de Leaflet.
// On pointe directement vers le CDN unpkg pour les images de marqueur.
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// ─── Icônes custom par rôle (DivIcon = icône HTML/CSS sans image) ─────────────
/**
 * Crée une DivIcon circulaire colorée pour un rôle donné.
 * @param color Couleur CSS du cercle
 */
function createRoleIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "", // Annule la classe CSS par défaut de Leaflet
    html: `<div style="
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: ${color};
      border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],   // Centre du cercle = point d'ancrage
    popupAnchor: [0, -10],
  })
}

/** Icône de position utilisateur : cercle bleu */
const ICON_ME = createRoleIcon("#3b82f6")

/** Map rôle → couleur */
const ROLE_COLORS: Record<UserProche["role"], string> = {
  vendeur: "#f97316",         // orange
  concessionnaire: "#a855f7", // violet
  auto_ecole: "#06b6d4",      // cyan
}

/** Labels lisibles pour les badges rôle */
const ROLE_LABELS: Record<UserProche["role"], string> = {
  vendeur: "Vendeur",
  concessionnaire: "Concessionnaire",
  auto_ecole: "Auto-école",
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MapViewProps {
  /** Centre initial de la carte */
  center: { lat: number; lng: number }
  /** Liste des vendeurs/partenaires à afficher */
  markers: UserProche[]
  /** Callback au clic sur un marqueur */
  onMarkerClick?: (user: UserProche) => void
  /** Classes CSS additionnelles sur le conteneur */
  className?: string
}

// ─── Composant ────────────────────────────────────────────────────────────────
// Pas de "use client" : ce composant est toujours importé via dynamic({ ssr: false })
// ce qui garantit qu'il ne s'exécute jamais côté serveur.

/**
 * Carte Leaflet interactive affichant la position utilisateur
 * et les vendeurs/partenaires proches avec des marqueurs colorés par rôle.
 *
 * IMPORTANT : importer uniquement via `dynamic(..., { ssr: false })` — Leaflet
 * accède à `window` et ne peut pas s'exécuter côté serveur.
 */
export default function MapView({
  center,
  markers,
  onMarkerClick,
  className,
}: MapViewProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      className={className}
      style={{ height: "100%", width: "100%" }}
    >
      {/* Tuiles OpenStreetMap */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Marqueur "Ma position" */}
      <Marker position={[center.lat, center.lng]} icon={ICON_ME}>
        <Popup>
          <span className="text-sm font-semibold text-blue-600">
            Ma position
          </span>
        </Popup>
      </Marker>

      {/* Marqueurs des vendeurs / partenaires */}
      {markers.map((user) => {
        const color = ROLE_COLORS[user.role]
        const icon = createRoleIcon(color)

        return (
          <Marker
            key={user.id}
            position={[user.latitude, user.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => onMarkerClick?.(user),
            }}
          >
            <Popup>
              <div className="min-w-[160px] space-y-1.5">
                {/* Nom + rôle */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-zinc-900">
                    {user.raison_sociale ?? user.fullname}
                  </span>
                  <span
                    className="text-[11px] font-medium px-1.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: color }}
                  >
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>

                {/* Distance */}
                <p className="text-xs text-zinc-500">
                  {user.distance.toFixed(1)} km
                </p>

                {/* Note si disponible */}
                {user.note_moyenne != null && (
                  <p className="text-xs text-zinc-600 flex items-center gap-1">
                    <span>⭐</span>
                    <span>{user.note_moyenne.toFixed(1)} / 5</span>
                  </p>
                )}

                {/* Adresse si disponible */}
                {user.adresse && (
                  <p className="text-xs text-zinc-400">{user.adresse}</p>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
