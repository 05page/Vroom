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
import { VehiculeDescription, vehicule } from "@/src/types"

interface Props {
    isOpen: boolean;
    onClose: () => void;
    vehicule: vehicule;
    onEdit?: () => void;
    onDelete?: () => void;
}
const formatDate = (date: Date | undefined) => {
    if (!date) return "—"
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}


const DetailsCard = ({ isOpen, onClose, vehicule, onEdit, onDelete }: Props) => {
    const isVente = vehicule.post_type === "vente"
    const isLocation = vehicule.post_type === "location"
    const infos = [
        { label: "Kilométrage", value: `${vehicule.description?.kilometrage} km`, icon: Gauge },
        { label: "Carburant", value: vehicule.description?.carburant, icon: Fuel },
        { label: "Transmission", value: vehicule.description?.transmission, icon: Settings },
        { label: "Couleur", value: vehicule.description?.couleur, icon: Palette },
        { label: "Portes", value: vehicule.description?.nombre_portes, icon: DoorOpen },
        { label: "Places", value: vehicule.description?.nombre_places, icon: Users },
    ]

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent className="max-w-7xl sm:max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-0 gap-0 rounded-2xl border-border/40">
                <DialogTitle className="sr-only">
                    {vehicule.description?.marque} {vehicule?.description?.modele}
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
                                {/* {isVente ? vehicule.prix : vehicule.prixParJour} */}
                                <span className="text-xs font-normal text-muted-foreground ml-1">
                                   {vehicule?.prix} FCFA{isLocation ? " / jour" : ""}
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
                            {vehicule?.description?.marque} {vehicule?.description?.modele}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {vehicule?.description?.annee} · {vehicule?.description?.carburant} · {vehicule?.description?.transmission}
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
                    {vehicule?.description?.equipements?.map((eq) => (
                        <Badge key={eq} variant="outline" className="rounded-full px-3 py-1.5 gap-1.5 ...">
                            <Check className="h-3 w-3" />
                            {eq.replace(/_/g, " ")}
                        </Badge>
                    ))}


                    {/* Description */}
                    {/* {vehicule.description && ( */}
                    <div>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                            Description
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed"></p>
                    </div>


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
                                            <p className="font-bold text-sm">{formatDate(vehicule?.date_disponibilite )}</p>
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
                                                {/* <p className="font-bold text-sm">{vehicule?.date_publication || "—"}</p> */}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <Clock className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Fin</p>
                                                {/* <p className="font-bold text-sm">{vehicule.dateFinLocation || "—"}</p> */}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DetailsCard
