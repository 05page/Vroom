/**
 * FicheVehiculePDF
 * ─────────────────
 * Composant react-pdf qui génère la fiche PDF d'un véhicule.
 *
 * IMPORTANT : react-pdf n'utilise PAS HTML/Tailwind.
 * On utilise StyleSheet.create() + des primitives spéciales :
 *   Document, Page, View, Text, Image
 *
 * Ce fichier est importé en mode dynamique (ssr: false) car
 * @react-pdf/renderer accède à des APIs navigateur.
 */
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"
import { vehicule } from "@/src/types"

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 10,
    color: "#18181b",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: "#f59e0b",
  },
  brandBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandDot: {
    width: 24,
    height: 24,
    backgroundColor: "#f59e0b",
    borderRadius: 6,
  },
  brandName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    color: "#18181b",
    letterSpacing: 0.5,
  },
  docTitle: {
    fontSize: 9,
    color: "#71717a",
    textAlign: "right",
  },

  // Photo
  photo: {
    width: "100%",
    height: 180,
    objectFit: "cover",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#f4f4f5",
  },

  // Titre véhicule
  vehicleTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    marginBottom: 4,
  },
  vehicleSubtitle: {
    fontSize: 10,
    color: "#71717a",
    marginBottom: 16,
  },

  // Badge type
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  badgeVente: {
    backgroundColor: "#f4f4f5",
    color: "#3f3f46",
  },
  badgeLocation: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
  },
  badgeNego: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },

  // Prix
  priceBox: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: { fontSize: 9, color: "#71717a" },
  priceValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    color: "#18181b",
  },
  priceSuffix: { fontSize: 10, color: "#71717a" },

  // Sections
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },

  // Grille specs
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  specItem: {
    width: "31%",
    backgroundColor: "#f4f4f5",
    borderRadius: 6,
    padding: 8,
  },
  specLabel: { fontSize: 8, color: "#71717a", marginBottom: 2 },
  specValue: { fontFamily: "Helvetica-Bold", fontSize: 10 },

  // Docs
  docsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  docItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "47%",
    backgroundColor: "#f4f4f5",
    borderRadius: 6,
    padding: 8,
  },
  docDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  docText: { fontSize: 9 },

  // Équipements
  equipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  equipBadge: {
    backgroundColor: "#f4f4f5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 9,
    color: "#3f3f46",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e4e4e7",
    paddingTop: 8,
  },
  footerText: { fontSize: 8, color: "#a1a1aa" },
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n)

const fmtDate = (d: Date | string | undefined) => {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  vehicule: vehicule
  backendUrl: string
}

export function FicheVehiculePDF({ vehicule: v, backendUrl }: Props) {
  const desc = v.description
  const isLocation = v.post_type === "location"

  // URL de la première photo (si disponible)
  const primaryPhoto =
    v.photos?.find((p) => p.is_primary) ?? v.photos?.[0]
  const photoUrl = primaryPhoto
    ? `${backendUrl}/storage/${primaryPhoto.path}`
    : null

  // Données documents
  const docs = [
    { label: "Carte grise", ok: desc?.carte_grise },
    { label: "Assurance", ok: desc?.assurance },
    { label: "Visite technique", ok: desc?.visite_technique },
    { label: "Sans accident", ok: !desc?.historique_accidents },
  ]

  // Specs techniques
  const specs = [
    { label: "Kilométrage", value: desc?.kilometrage ? `${desc.kilometrage} km` : "—" },
    { label: "Carburant", value: desc?.carburant ?? "—" },
    { label: "Transmission", value: desc?.transmission ?? "—" },
    { label: "Couleur", value: desc?.couleur ?? "—" },
    { label: "Portes", value: desc?.nombre_portes ? `${desc.nombre_portes} portes` : "—" },
    { label: "Places", value: desc?.nombre_places ? `${desc.nombre_places} places` : "—" },
  ]

  return (
    <Document
      title={`Fiche ${desc?.marque} ${desc?.modele} — Move`}
      author="Move CI"
    >
      <Page size="A4" style={s.page}>

        {/* ── En-tête ── */}
        <View style={s.header}>
          <View style={s.brandBox}>
            <View style={s.brandDot} />
            <Text style={s.brandName}>Move</Text>
          </View>
          <View>
            <Text style={s.docTitle}>FICHE VÉHICULE</Text>
            <Text style={s.docTitle}>
              Générée le {fmtDate(new Date())}
            </Text>
          </View>
        </View>

        {/* ── Photo ── */}
        {photoUrl && (
          <Image src={photoUrl} style={s.photo} />
        )}

        {/* ── Titre + badges ── */}
        <Text style={s.vehicleTitle}>
          {desc?.marque} {desc?.modele}
        </Text>
        <Text style={s.vehicleSubtitle}>
          {desc?.annee} · {desc?.carburant} · {desc?.transmission}
        </Text>

        <View style={s.badgeRow}>
          <Text style={[s.badge, isLocation ? s.badgeLocation : s.badgeVente]}>
            {isLocation ? "Location" : "Vente"}
          </Text>
          {v.negociable && (
            <Text style={[s.badge, s.badgeNego]}>Négociable</Text>
          )}
        </View>

        {/* ── Prix ── */}
        <View style={s.priceBox}>
          <Text style={s.priceLabel}>
            {isLocation ? "Prix / jour" : "Prix de vente"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
            <Text style={s.priceValue}>{fmt(v.prix)}</Text>
            <Text style={s.priceSuffix}>FCFA</Text>
          </View>
        </View>

        {/* ── Caractéristiques techniques ── */}
        <Text style={s.sectionTitle}>Caractéristiques techniques</Text>
        <View style={s.specsGrid}>
          {specs.map((sp) => (
            <View key={sp.label} style={s.specItem}>
              <Text style={s.specLabel}>{sp.label}</Text>
              <Text style={s.specValue}>{sp.value}</Text>
            </View>
          ))}
        </View>

        {/* ── Documents ── */}
        <Text style={s.sectionTitle}>Documents & état</Text>
        <View style={s.docsGrid}>
          {docs.map((d) => (
            <View key={d.label} style={s.docItem}>
              <View style={[s.docDot, { backgroundColor: d.ok ? "#22c55e" : "#ef4444" }]} />
              <Text style={s.docText}>{d.label}</Text>
              <Text style={[s.docText, { color: d.ok ? "#16a34a" : "#dc2626", fontFamily: "Helvetica-Bold" }]}>
                {d.ok ? "✓" : "✗"}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Équipements ── */}
        {desc?.equipements && desc.equipements.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Équipements</Text>
            <View style={s.equipRow}>
              {desc.equipements.map((eq) => (
                <Text key={eq} style={s.equipBadge}>
                  {eq.replace(/_/g, " ")}
                </Text>
              ))}
            </View>
          </>
        )}

        {/* ── Disponibilité ── */}
        <Text style={s.sectionTitle}>Disponibilité</Text>
        <Text style={{ fontSize: 10, color: "#3f3f46" }}>
          {isLocation
            ? "Contacter le vendeur pour les dates disponibles."
            : `Disponible à partir du ${fmtDate(v.date_disponibilite)}`}
        </Text>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Move CI · moveci.com · contact@moveci.com
          </Text>
          <Text style={s.footerText}>
            {desc?.marque} {desc?.modele} — Réf. {v.id.slice(0, 8).toUpperCase()}
          </Text>
        </View>

      </Page>
    </Document>
  )
}
