"use client"

import type { LucideIcon } from "lucide-react"
import {
    BarChart3,
    Bell,
    BookOpen,
    Calendar,
    Car,
    Compass,
    Handshake,
    Heart,
    LayoutDashboard,
    MessageSquare,
    PlusCircle,
    Settings,
    TrendingUp,
    User,
    Users,
    Warehouse,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type GuideSpace = "client" | "vendeur" | "concessionnaire" | "auto_ecole"

interface GuideSection {
    icon: LucideIcon
    title: string
    description: string
}

interface GuideDefinition {
    title: string
    subtitle: string
    sections: GuideSection[]
}

/** Contenu du guide par espace — premier jet basé sur les fonctionnalités existantes, à relire/ajuster. */
const GUIDE_CONTENT: Record<GuideSpace, GuideDefinition> = {
    client: {
        title: "Guide de l'espace Client",
        subtitle: "Ce que tu peux faire ici, et où le trouver",
        sections: [
            { icon: Heart, title: "Favoris", description: "Enregistre les véhicules qui t'intéressent pour les retrouver facilement, triés par date ou par prix." },
            { icon: Compass, title: "Suggestions", description: "Des véhicules à vendre ou à louer recommandés selon tes recherches et tes favoris." },
            { icon: Calendar, title: "Réservations", description: "Suis le statut de tes réservations (en attente, confirmée...) — une réservation non confirmée expire automatiquement après un délai." },
            { icon: Calendar, title: "Rendez-vous", description: "Prends RDV avec un vendeur pour voir un véhicule en personne. Le vendeur doit confirmer le RDV de son côté." },
            { icon: Handshake, title: "Transactions", description: "Une fois l'accord conclu avec le vendeur, chacun confirme la transaction de son côté pour la finaliser. Aucun paiement ne passe par la plateforme." },
            { icon: BookOpen, title: "Formations", description: "Trouve une auto-école et inscris-toi à une formation au permis en ligne." },
            { icon: MessageSquare, title: "Messages", description: "Discute directement avec les vendeurs et auto-écoles en temps réel." },
            { icon: Bell, title: "Notifications", description: "Reçois une alerte dès qu'un RDV est confirmé, qu'un message arrive, ou qu'une transaction avance." },
            { icon: User, title: "Profil", description: "Gère tes informations personnelles et tes préférences de compte." },
        ],
    },
    vendeur: {
        title: "Guide de l'espace Vendeur",
        subtitle: "Ce que tu peux faire ici, et où le trouver",
        sections: [
            { icon: LayoutDashboard, title: "Tableau de bord", description: "Vue d'ensemble de ton activité : véhicules publiés, vues, demandes en cours." },
            { icon: Car, title: "Mes véhicules", description: "Gère tes annonces publiées : modifie, retire ou suis leur statut de validation." },
            { icon: PlusCircle, title: "Ajouter un véhicule", description: "Publie une nouvelle annonce. Elle passe par une vérification automatique (photos, kilométrage) avant d'être validée." },
            { icon: Users, title: "Suivi clients (CRM)", description: "Suis les acheteurs intéressés par tes annonces, du premier contact jusqu'à la vente." },
            { icon: Calendar, title: "Rendez-vous", description: "Gère les demandes de RDV des clients : confirme, annule ou marque comme terminé." },
            { icon: Handshake, title: "Transactions", description: "Confirme la vente une fois l'accord conclu avec le client — la transaction n'est finalisée qu'après confirmation des deux côtés." },
            { icon: BarChart3, title: "Statistiques", description: "Suis les performances de tes annonces : vues, tendances, taux de conversion." },
            { icon: MessageSquare, title: "Messages", description: "Échange directement avec tes clients en temps réel." },
            { icon: Bell, title: "Notifications", description: "Reçois une alerte dès qu'un client prend RDV ou t'envoie un message." },
            { icon: User, title: "Profil", description: "Gère tes informations personnelles et tes préférences de compte." },
        ],
    },
    concessionnaire: {
        title: "Guide de l'espace Concessionnaire",
        subtitle: "Ce que tu peux faire ici, et où le trouver",
        sections: [
            { icon: LayoutDashboard, title: "Tableau de bord", description: "Vue d'ensemble de ton activité sur la plateforme." },
            { icon: Warehouse, title: "Mon Garage", description: "Gère l'ensemble du parc de véhicules de ton établissement en un seul endroit." },
            { icon: BarChart3, title: "Statistiques", description: "Suis les performances de tes annonces et de ton activité." },
            { icon: TrendingUp, title: "Tendances", description: "Repère les tendances de la plateforme (modèles recherchés, prix du marché) pour ajuster ton offre." },
            { icon: Calendar, title: "Rendez-vous", description: "Gère les demandes de RDV de tes clients." },
            { icon: MessageSquare, title: "Messages", description: "Échange directement avec tes clients en temps réel." },
            { icon: Bell, title: "Notifications", description: "Reçois une alerte dès qu'un client prend RDV ou t'envoie un message." },
            { icon: Settings, title: "Paramètres", description: "Gère les informations de ton établissement et ton compte." },
        ],
    },
    auto_ecole: {
        title: "Guide de l'espace Auto-école",
        subtitle: "Ce que tu peux faire ici, et où le trouver",
        sections: [
            { icon: LayoutDashboard, title: "Tableau de bord", description: "Vue d'ensemble de ton activité sur la plateforme." },
            { icon: BookOpen, title: "Formations", description: "Crée et gère les formations au permis que tu proposes, suis les inscriptions." },
            { icon: BarChart3, title: "Statistiques", description: "Suis les performances de tes formations et de ton activité." },
            { icon: TrendingUp, title: "Tendances", description: "Repère les tendances de la plateforme pour ajuster ton offre de formations." },
            { icon: Calendar, title: "Rendez-vous", description: "Gère les demandes de RDV liées à tes formations." },
            { icon: MessageSquare, title: "Messages", description: "Échange directement avec tes élèves en temps réel." },
            { icon: Bell, title: "Notifications", description: "Reçois une alerte dès qu'un élève s'inscrit ou t'envoie un message." },
            { icon: Settings, title: "Paramètres", description: "Gère les informations de ton établissement et ton compte." },
        ],
    },
}

export default function GuideContent({ space }: { space: GuideSpace }) {
    const { title, subtitle, sections } = GUIDE_CONTENT[space]

    return (
        <div className="pt-20 px-4 md:px-6 max-w-3xl mx-auto mb-12 space-y-6">
            <div className="rounded-2xl bg-zinc-900 p-6 md:p-8 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Compass className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-white">{title}</h1>
                    <p className="text-zinc-400 text-sm mt-0.5">{subtitle}</p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {sections.map(section => (
                    <Card key={section.title} className="border-border/60">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <section.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                {section.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {section.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
