"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    ArrowRight,
    BadgeCheck,
    Briefcase,
    Car,
    ChevronRight,
    Clock,
    Eye,
    Fuel,
    Globe,
    HandCoins,
    Handshake,
    HeartHandshake,
    KeyRound,
    MapPin,
    MessageCircle,
    Phone,
    Search,
    Shield,
    ShieldCheck,
    Star,
    Store,
    TrendingUp,
    Users,
    Zap,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { DevenirPartenaire } from "../components/DevenirPartenaire";

const LandingPage = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [partenaireDialog, setPartenaireDialog] = useState(false);

    const howItWorks = [
        {
            step: "01",
            icon: Search,
            title: "Recherchez",
            desc: "Parcourez notre catalogue et filtrez par marque, prix, type ou localisation.",
            color: "bg-orange-500",
        },
        {
            step: "02",
            icon: Eye,
            title: "Comparez",
            desc: "Consultez les details, photos et avis sur chaque vehicule pour faire le bon choix.",
            color: "bg-orange-500",
        },
        {
            step: "03",
            icon: MessageCircle,
            title: "Contactez",
            desc: "Echangez directement avec le vendeur via notre messagerie securisee.",
            color: "bg-orange-500",
        },
        {
            step: "04",
            icon: Handshake,
            title: "Finalisez",
            desc: "Prenez rendez-vous, visitez le vehicule et finalisez la transaction en confiance.",
            color: "bg-orange-500",
        },
    ]

    const temoignages = [
        {
            name: "Kouame Ange",
            role: "Acheteur",
            text: "J'ai trouve ma Toyota RAV4 en moins d'une semaine. Le processus etait simple et le vendeur tres professionnel. Je recommande !",
            rating: 5,
        },
        {
            name: "Diallo Ibrahim",
            role: "Vendeur",
            text: "J'ai vendu ma Mercedes en 3 jours grace a Vroom CI. Les acheteurs sont serieux et la plateforme est tres bien faite.",
            rating: 5,
        },
        {
            name: "Traore Aminata",
            role: "Locataire",
            text: "La location est super pratique. J'ai loue un SUV pour un weekend et tout etait parfait. Prix correct et vehicule impeccable.",
            rating: 5,
        },
    ]

    const popularVehicles = [
        {
            marque: "Toyota",
            modele: "RAV4 2024",
            prix: "18 500 000",
            type: "vente",
            carburant: "Essence",
            lieu: "Abidjan, Cocody",
        },
        {
            marque: "Mercedes",
            modele: "Classe C 2023",
            prix: "25 000 000",
            type: "vente",
            carburant: "Diesel",
            lieu: "Abidjan, Plateau",
        },
        {
            marque: "BMW",
            modele: "X3 2024",
            prix: "45 000 / jour",
            type: "location",
            carburant: "Essence",
            lieu: "Abidjan, Marcory",
        },
    ]

    const features = [
        {
            icon: ShieldCheck,
            title: "Vehicules verifies",
            desc: "Chaque vehicule est inspecte et verifie avant publication. Historique, etat mecanique, documents — tout est controle.",
            bg: "bg-white",
        },
        {
            icon: HeartHandshake,
            title: "Transactions securisees",
            desc: "Notre plateforme garantit des echanges en toute securite. Messagerie integree, rendez-vous organises, accompagnement complet.",
            bg: "bg-white",
        },
        {
            icon: Zap,
            title: "Rapide et simple",
            desc: "Publiez ou trouvez un vehicule en quelques clics. Interface intuitive, filtres intelligents, notifications en temps reel.",
            bg: "bg-white",
        },
    ]

    const icones = [
        { icon: Shield, value: "100%", label: "Securise" },
        { icon: Clock, value: "24/7", label: "Support" },
        { icon: Users, value: "2,000+", label: "Utilisateurs" },
        { icon: Star, value: "4.9/5", label: "Note moyenne" },
    ]

    return (
        <div className="min-h-screen bg-white">
            <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gray-50" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(234,165,80,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(243,244,246,0.5),transparent_50%)]" />

                <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-200/40 rounded-full blur-3xl" />

                <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-32 pb-20 text-center">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-zinc-900 tracking-tight leading-[0.9] mb-6">
                        Trouvez votre
                        <br />
                        <span className="text-orange-600">vehicule ideal</span>
                    </h1>

                    <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Achetez, louez ou vendez votre voiture en toute confiance.
                        Des centaines de vehicules verifies vous attendent sur Vroom CI.
                    </p>
                    {/* <div className="flex flex-wrap justify-center gap-8 mt-12">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-3xl md:text-4xl font-black text-zinc-900">{stat.value}</p>
                                <p className="text-sm text-zinc-400 font-medium mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div> */}
                </div>
            </section>

            <section className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <Badge className="bg-orange-50 text-orange-600 border-orange-200 rounded-full px-4 py-1 font-semibold mb-4">
                            Nos Services
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900">
                            Une plateforme,
                            <br />
                            <span className="text-orange-600">toutes les solutions</span>
                        </h2>
                        <p className="text-zinc-500 mt-4 max-w-xl mx-auto text-lg">
                            Que vous cherchiez a acheter, louer ou vendre, Vroom CI vous simplifie la vie.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="group rounded-3xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer bg-white">
                            <CardContent className="p-8 flex flex-col h-full min-h-80">
                                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Car className="h-8 w-8 text-orange-600" />
                                </div>
                                <h3 className="text-2xl font-black mb-3 text-zinc-900">Acheter</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed flex-1">
                                    Parcourez des centaines de vehicules verifies. Comparez les prix, consultez les details et trouvez la voiture parfaite pour vous.
                                </p>
                                <div className="flex items-center gap-2 mt-6 font-bold text-sm text-orange-600 group-hover:gap-4 transition-all">
                                    Explorer les vehicules
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="group rounded-3xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer bg-white">
                            <CardContent className="p-8 flex flex-col h-full min-h-80">
                                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <KeyRound className="h-8 w-8 text-gray-500" />
                                </div>
                                <h3 className="text-2xl font-black mb-3 text-zinc-900">Louer</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed flex-1">
                                    Besoin d&apos;un vehicule temporaire ? Louez facilement pour un jour, une semaine ou un mois. Tarifs transparents et vehicules entretenus.
                                </p>
                                <div className="flex items-center gap-2 mt-6 font-bold text-sm text-gray-500 group-hover:gap-4 transition-all">
                                    Voir les locations
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="group rounded-3xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer bg-white">
                            <CardContent className="p-8 flex flex-col h-full min-h-80">
                                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <HandCoins className="h-8 w-8 text-orange-600" />
                                </div>
                                <h3 className="text-2xl font-black mb-3 text-zinc-900">Vendre</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed flex-1">
                                    Publiez votre annonce en quelques minutes. Touchez des milliers d&apos;acheteurs potentiels et vendez au meilleur prix.
                                </p>
                                <div className="flex items-center gap-2 mt-6 font-bold text-sm text-orange-600 group-hover:gap-4 transition-all">
                                    Publier une annonce
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/*Comment ça marche */}
            <section className="py-24 px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <Badge className="bg-orange-50 text-orange-600 border-orange-200 rounded-full px-4 py-1 font-semibold mb-4">
                            Comment ca marche
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900">
                            Simple, rapide,
                            <br />
                            <span className="text-orange-600">efficace</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {howItWorks.map((item) => (
                            <div key={item.step} className="relative group">
                                <div className="text-center">
                                    <div className="relative inline-flex">
                                        <div className={`w-20 h-20 rounded-3xl ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                            <item.icon className="h-9 w-9 text-white" />
                                        </div>
                                        <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-xs font-black text-zinc-700">
                                            {item.step}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black mb-2 text-zinc-900">{item.title}</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Véhicules populaire */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                        <div>
                            <Badge className="bg-orange-50 text-orange-600 border-orange-200 rounded-full px-4 py-1 font-semibold mb-4">
                                Vehicules populaires
                            </Badge>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900">
                                Les plus
                                <span className="text-orange-600"> consultes</span>
                            </h2>
                        </div>
                        <Link href="/vehicles">
                            <Button variant="outline" className="rounded-2xl mt-4 md:mt-0 cursor-pointer font-bold border-gray-200 text-zinc-700 hover:bg-gray-50">
                                Voir tout
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {popularVehicles.map((vehicle) => (
                            <Card
                                key={vehicle.modele}
                                className="group rounded-3xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer bg-white"
                            >
                                <div className="bg-gray-100 h-52 relative flex items-center justify-center">
                                    <Car className="h-16 w-16 text-gray-300" />
                                    <Badge className={`absolute top-4 left-4 rounded-full font-bold ${vehicle.type === "location" ? "bg-gray-500 text-white" : "bg-orange-500 text-white"}`}>
                                        {vehicle.type === "location" ? "Location" : "A vendre"}
                                    </Badge>
                                </div>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">{vehicle.marque}</p>
                                            <h3 className="text-lg font-black text-zinc-900">{vehicle.modele}</h3>
                                        </div>
                                        <p className="text-lg font-black text-orange-600">
                                            {vehicle.prix}
                                            <span className="text-xs text-zinc-400 font-normal ml-1">FCFA</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                                        <span className="flex items-center gap-1">
                                            <Fuel className="h-3.5 w-3.5" />
                                            {vehicle.carburant}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {vehicle.lieu}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/*  */}
            <section className="py-24 px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <Badge className="bg-orange-50 text-orange-600 border-orange-200 rounded-full px-4 py-1 font-semibold mb-4">
                            Pourquoi Vroom CI
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900">
                            La confiance avant tout
                        </h2>
                        <p className="text-zinc-500 mt-4 max-w-xl mx-auto text-lg">
                            Nous mettons tout en oeuvre pour que chaque transaction soit simple, securisee et transparente.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature) => (
                            <Card
                                key={feature.title}
                                className={`rounded-3xl border border-gray-200 ${feature.bg} hover:shadow-xl transition-all duration-300`}
                            >
                                <CardContent className="p-8">
                                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-6">
                                        <feature.icon className="h-7 w-7 text-orange-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-zinc-900 mb-3">{feature.title}</h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                        {icones.map((metric) => (
                            <div key={metric.label} className="text-center p-6 rounded-2xl bg-white border border-gray-200">
                                <metric.icon className="h-6 w-6 text-orange-500 mx-auto mb-3" />
                                <p className="text-2xl font-black text-zinc-900">{metric.value}</p>
                                <p className="text-xs text-zinc-400 font-semibold mt-1">{metric.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== DEVENIR VENDEUR ==================== */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <Badge className="bg-orange-50 text-orange-600 border-orange-200 rounded-full px-4 py-1 font-semibold mb-6">
                                Devenir vendeur
                            </Badge>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 mb-6">
                                Vendez vos vehicules
                                <br />
                                <span className="text-orange-600">facilement</span>
                            </h2>
                            <p className="text-zinc-500 text-lg leading-relaxed mb-8">
                                Rejoignez notre reseau de vendeurs et touchez des milliers d&apos;acheteurs potentiels.
                                Publiez vos annonces, gerez vos rendez-vous et vendez au meilleur prix.
                            </p>

                            <div className="space-y-4 mb-8">
                                {[
                                    "Publication d'annonces illimitee",
                                    "Tableau de bord vendeur complet",
                                    "Messagerie directe avec les acheteurs",
                                    "Statistiques de vos annonces en temps reel",
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                            <BadgeCheck className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <span className="text-sm text-zinc-600">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href="/vendeur/dashboard" className="inline-flex h-12 text-center items-center justify-center px-8 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base cursor-pointer">
                                Devenir vendeur
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Link>
                        </div>

                        <div className="relative">
                            <div className="bg-gray-50 rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-200/30 rounded-full blur-3xl" />
                                <div className="relative space-y-4">
                                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                                <TrendingUp className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-zinc-900">Ventes ce mois</p>
                                                <p className="text-xs text-zinc-400">+12% vs mois dernier</p>
                                            </div>
                                        </div>
                                        <p className="text-3xl font-black text-zinc-900">24 vehicules</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                                            <p className="text-xs text-zinc-400 mb-1">Annonces actives</p>
                                            <p className="text-2xl font-black text-zinc-900">38</p>
                                        </div>
                                        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                                            <p className="text-xs text-zinc-400 mb-1">Messages recus</p>
                                            <p className="text-2xl font-black text-zinc-900">156</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Star className="h-5 w-5 fill-orange-500 text-orange-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">Note moyenne</p>
                                            <p className="text-xs text-zinc-400">4.9 / 5 — 87 avis</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== DEVENIR PARTENAIRE ==================== */}
            <section className="py-24 px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1">
                            <div className="relative rounded-3xl overflow-hidden h-125">
                                <Image
                                    src="/vehicle/img5.jpg"
                                    alt="Partenariat Vroom CI"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                            </div>
                        </div>

                        <div className="order-1 md:order-2">
                            <Badge className="bg-gray-100 text-gray-500 border-gray-200 rounded-full px-4 py-1 font-semibold mb-6">
                                Devenir partenaire
                            </Badge>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 mb-6">
                                Developpez votre
                                <br />
                                <span className="text-orange-600">activite</span> avec nous
                            </h2>
                            <p className="text-zinc-500 text-lg leading-relaxed mb-8">
                                Que vous soyez concessionnaire, assureur, banque ou prestataire automobile,
                                rejoignez l&apos;ecosysteme Vroom CI et accedez a des milliers de clients.
                            </p>

                            <div className="space-y-4 mb-8">
                                {[
                                    "Visibilite aupres de milliers d'utilisateurs",
                                    "Page partenaire dediee sur la plateforme",
                                    "Outils de gestion et reporting",
                                    "Accompagnement personnalise",
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                            <BadgeCheck className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <span className="text-sm text-zinc-600">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <Button onClick={()=> setPartenaireDialog(true)} className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-gray-600 hover:bg-gray-700 text-white font-bold text-base cursor-pointer">
                                <Briefcase className="h-5 w-5 mr-2" />
                                Devenir partenaire
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
                {partenaireDialog &&(
                    <DevenirPartenaire
                    open = {!!partenaireDialog}
                    onClose= {()=> (null)} 
                    />
                )}
            </section>

            <section className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <Badge className="bg-orange-50 text-orange-600 border-orange-200 rounded-full px-4 py-1 font-semibold mb-4">
                            Temoignages
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900">
                            Ils nous font
                            <span className="text-orange-600"> confiance</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {temoignages.map((t) => (
                            <Card
                                key={t.name}
                                className="rounded-3xl border border-gray-200 hover:shadow-xl transition-all duration-300 bg-white"
                            >
                                <CardContent className="p-8">
                                    <div className="flex gap-1 mb-4">
                                        {Array.from({ length: t.rating }).map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-orange-400 text-orange-400" />
                                        ))}
                                    </div>
                                    <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                                        &quot;{t.text}&quot;
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                                            <span className="text-sm font-black text-orange-600">
                                                {t.name.split(" ").map(n => n[0]).join("")}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">{t.name}</p>
                                            <p className="text-xs text-zinc-400">{t.role}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 px-6 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <Card className="rounded-[2rem] overflow-hidden border border-gray-200 bg-white shadow-2xl">
                        <CardContent className="p-12 md:p-16 text-center relative">
                            <div className="relative z-10">
                                <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mx-auto mb-8">
                                    <Car className="h-10 w-10 text-orange-600" />
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight mb-4">
                                    Pret a demarrer ?
                                </h2>
                                <p className="text-zinc-500 text-lg max-w-lg mx-auto mb-8">
                                    Rejoignez des milliers d&apos;utilisateurs qui font confiance a Vroom CI pour leurs transactions automobiles.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/auth">
                                        <Button className="h-14 px-8 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base cursor-pointer shadow-lg">
                                            Inscrivez vous maintenant
                                            <ArrowRight className="h-5 w-5 ml-2" />
                                        </Button>
                                    </Link>

                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* footer*/}
            <footer className="bg-zinc-900 text-white pt-20 pb-8 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                                    <Car className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-black">Vroom CI</span>
                            </div>
                            <p className="text-sm text-white/50 leading-relaxed">
                                La marketplace automobile de reference en Cote d&apos;Ivoire. Achetez, vendez et louez en toute confiance.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-4 text-white/80">Plateforme</h4>
                            <ul className="space-y-3">
                                {["Acheter un vehicule", "Louer un vehicule", "Vendre un vehicule", "Vehicules populaires"].map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-sm text-white/40 hover:text-orange-400 transition-colors">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-4 text-white/80">Entreprise</h4>
                            <ul className="space-y-3">
                                {["A propos", "Comment ca marche", "Conditions d'utilisation", "Politique de confidentialite"].map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-sm text-white/40 hover:text-orange-400 transition-colors">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-4 text-white/80">Contact</h4>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-sm text-white/40">
                                    <MapPin className="h-4 w-4 shrink-0" />
                                    Abidjan, Cote d&apos;Ivoire
                                </li>
                                <li className="flex items-center gap-2 text-sm text-white/40">
                                    <Phone className="h-4 w-4 shrink-0" />
                                    +225 07 00 00 00 00
                                </li>
                                <li className="flex items-center gap-2 text-sm text-white/40">
                                    <Globe className="h-4 w-4 shrink-0" />
                                    contact@vroomci.com
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-white/30">
                            2025 Vroom CI. Tous droits reserves.
                        </p>
                        <div className="flex items-center gap-6">
                            {["Mentions legales", "CGU", "Confidentialite"].map((link) => (
                                <a key={link} href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">
                                    {link}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
