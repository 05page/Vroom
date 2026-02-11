"use client"

import { cn } from "@/src/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
    Car, Tag, Key, Calendar, Fuel, Settings, Palette, DoorOpen, Users,
    Gauge, Check, Edit, Trash2, Eye,
    Clock, Shield, MapPin, Sparkles,
} from "lucide-react"

interface DetailsVehicules {
    typePublication: "vente" | "location" | ""
    marque: string
    modele: string
    annee: string
    kilometrage: string
    carburant: string
    transmission: string
    couleur: string
    nombrePortes: string
    nombrePlaces: string
    description: string
    equipements: string[]
    dateDisponibilite: Date | undefined
    dateDebutLocation: string
    dateFinLocation: string
    prix: string
    prixParJour: string
    negociable: boolean
}

interface Props {
    isOpen: boolean
    onClose: () => void
    vehicule: DetailsVehicules
    onEdit?: () => void
    onDelete?: () => void
}

const EQUIPEMENTS_MAP: Record<string, { label: string; icon: typeof Check }> = {
    climatisation: { label: "Climatisation", icon: Sparkles },
    gps: { label: "GPS / Navigation", icon: MapPin },
    camera_recul: { label: "Caméra de recul", icon: Eye },
    bluetooth: { label: "Bluetooth", icon: Settings },
    regulateur: { label: "Régulateur de vitesse", icon: Gauge },
    sieges_chauffants: { label: "Sièges chauffants", icon: Shield },
    toit_ouvrant: { label: "Toit ouvrant", icon: Car },
    phares_led: { label: "Phares LED", icon: Sparkles },
    jantes_alliage: { label: "Jantes alliage", icon: Settings },
    abs: { label: "ABS", icon: Shield },
    airbags: { label: "Airbags", icon: Shield },
    audio_premium: { label: "Audio premium", icon: Sparkles },
    demarrage_sans_cle: { label: "Démarrage sans clé", icon: Key },
    capteurs_parking: { label: "Capteurs de parking", icon: Eye },
    radar_angle_mort: { label: "Radar angle mort", icon: Shield },
}

const formatDate = (date: Date | undefined) => {
    if (!date) return "—"
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

const DetailsCard = ({ isOpen, onClose, vehicule, onEdit, onDelete }: Props) => {
    const isVente = vehicule.typePublication === "vente"
    const isLocation = vehicule.typePublication === "location"

    const infos = [
        { label: "Année", value: vehicule.annee, icon: Calendar },
        { label: "Kilométrage", value: vehicule.kilometrage ? `${vehicule.kilometrage} km` : "—", icon: Gauge },
        { label: "Carburant", value: vehicule.carburant || "—", icon: Fuel },
        { label: "Transmission", value: vehicule.transmission || "—", icon: Settings },
        { label: "Couleur", value: vehicule.couleur || "—", icon: Palette },
        { label: "Portes", value: vehicule.nombrePortes || "—", icon: DoorOpen },
        { label: "Places", value: vehicule.nombrePlaces || "—", icon: Users },
    ]

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent className="max-w-7xl sm:max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-0 gap-0 rounded-2xl border-border/40">
                <DialogTitle className="sr-only">
                    {vehicule.marque} {vehicule.modele}
                </DialogTitle>

                {/* Hero image + badges */}
                <div className="relative h-52 md:h-64 bg-linear-to-br from-muted/60 to-muted/20 flex items-center justify-center overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                    <Car className="h-20 w-20 text-muted-foreground/15 transition-transform duration-500 group-hover:scale-110" />

                    <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className={cn(
                            "rounded-full font-bold shadow-sm",
                            isVente
                                ? "bg-zinc-900/15 text-zinc-700 border-zinc-900/25"
                                : "bg-blue-500/15 text-blue-600 border-blue-500/25"
                        )}>
                            {isVente ? <Tag className="h-3 w-3 mr-1" /> : <Key className="h-3 w-3 mr-1" />}
                            {isVente ? "Vente" : "Location"}
                        </Badge>
                        {vehicule.negociable && (
                            <Badge className="rounded-full bg-amber-500/15 text-amber-600 border-amber-500/25 font-bold shadow-sm">
                                Négociable
                            </Badge>
                        )}
                    </div>

                    {/* Price overlay */}
                    <div className="absolute bottom-4 right-4">
                        <div className="bg-white/90 dark:bg-black/70 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg">
                            <p className="text-lg font-black text-zinc-700">
                                {isVente ? vehicule.prix : vehicule.prixParJour}
                                <span className="text-xs font-normal text-muted-foreground ml-1">
                                    FCFA{isLocation ? " / jour" : ""}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 md:p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">
                            {vehicule.marque} {vehicule.modele}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {vehicule.annee} · {vehicule.carburant} · {vehicule.transmission}
                        </p>
                    </div>

                    <Separator />

                    {/* Specs grid */}
                    <div>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                            Caractéristiques
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                            {infos.map((info) => (
                                <div
                                    key={info.label}
                                    className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-zinc-900/10 flex items-center justify-center shrink-0">
                                        <info.icon className="h-4 w-4 text-zinc-700" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-muted-foreground leading-tight">{info.label}</p>
                                        <p className="text-sm font-bold truncate">{info.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Equipements */}
                    {vehicule.equipements.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                                Équipements
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {vehicule.equipements.map((eq) => {
                                    const mapped = EQUIPEMENTS_MAP[eq]
                                    const Icon = mapped?.icon || Check
                                    return (
                                        <Badge
                                            key={eq}
                                            variant="outline"
                                            className="rounded-full px-3 py-1.5 gap-1.5 bg-muted/20 border-border/40 hover:bg-zinc-900/10 hover:text-zinc-700 hover:border-zinc-900/20 transition-colors cursor-default"
                                        >
                                            <Icon className="h-3 w-3" />
                                            {mapped?.label || eq}
                                        </Badge>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {vehicule.description && (
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                Description
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{vehicule.description}</p>
                        </div>
                    )}

                    {/* Availability & Pricing */}
                    <div>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                            {isVente ? "Disponibilité" : "Période de location"}
                        </h3>
                        <Card className="rounded-xl border border-border/40 bg-muted/20 shadow-none">
                            <CardContent className="p-4">
                                {isVente && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-zinc-900/10 flex items-center justify-center">
                                            <Calendar className="h-4 w-4 text-zinc-700" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Disponible à partir du</p>
                                            <p className="font-bold text-sm">{formatDate(vehicule.dateDisponibilite)}</p>
                                        </div>
                                    </div>
                                )}
                                {isLocation && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <Calendar className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Début</p>
                                                <p className="font-bold text-sm">{vehicule.dateDebutLocation || "—"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <Clock className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Fin</p>
                                                <p className="font-bold text-sm">{vehicule.dateFinLocation || "—"}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Separator />

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        <Button
                            className="flex-1 gap-2 bg-zinc-900 hover:bg-zinc-700 text-white font-bold rounded-xl cursor-pointer"
                            onClick={onEdit}
                        >
                            <Edit className="h-4 w-4" /> Modifier l&apos;annonce
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2 rounded-xl cursor-pointer text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                            onClick={onDelete}
                        >
                            <Trash2 className="h-4 w-4" /> Supprimer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DetailsCard
