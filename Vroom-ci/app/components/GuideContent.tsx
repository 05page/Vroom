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

/**
 * `embedded` : true quand la page hôte a déjà son propre header en flux (ex. layout à sidebar
 * de l'espace partenaire) — évite le double décalage avec le `pt-20` pensé pour un header fixe.
 */
export default function GuideContent({ space, embedded = false }: { space: GuideSpace; embedded?: boolean }) {
    const { title, subtitle, sections } = GUIDE_CONTENT[space]

    return (
        <div className={embedded
            ? "max-w-5xl space-y-6"
            : "pt-20 px-4 md:px-6 max-w-5xl mx-auto mb-12 space-y-6"
        }>
            <header className="pb-6 border-b border-zinc-200">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-move-gold mb-2">
                    <Compass className="h-3.5 w-3.5" />
                    Guide
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900">
                    {title}
                </h1>
                <p className="text-sm text-zinc-500 mt-1.5 max-w-lg">
                    {subtitle}
                </p>
            </header>

            <div className="rounded-2xl border border-zinc-200 bg-white divide-y divide-zinc-100 overflow-hidden">
                {sections.map(section => (
                    <div
                        key={section.title}
                        className="group flex items-start gap-4 p-5 sm:p-6 hover:bg-zinc-50 transition-colors"
                    >
                        <div className="shrink-0 w-9 h-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:border-move-gold group-hover:text-move-gold transition-colors">
                            <section.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 pt-0.5">
                            <h3 className="text-sm font-semibold text-zinc-900">{section.title}</h3>
                            <p className="text-sm text-zinc-500 mt-1 leading-relaxed max-w-2xl">{section.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
