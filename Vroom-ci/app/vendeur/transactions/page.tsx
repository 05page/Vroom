"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/src/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Wallet, Clock, CheckCircle2,
    Tag, Key, Download,
    Calendar, User, FileText, XCircle,
} from "lucide-react"

interface Transaction {
    id: number
    type: "vente" | "location"
    vehicule: string
    client: string
    clientPhone: string
    montant: string
    montantNum: number
    date: string
    statut: "confirmé" | "en_attente" | "terminé" | "annulé"
    methode: string
    reference: string
}

const CARD = "rounded-2xl md:rounded-3xl shadow-xl border border-border/40 overflow-hidden bg-card/50 backdrop-blur-sm"

const transactions: Transaction[] = [
    { id: 1, type: "vente", vehicule: "Toyota RAV4 2024", client: "Diallo Amadou", clientPhone: "+225 07 12 34 56", montant: "18 500 000", montantNum: 18500000, date: "28 Jan 2025", statut: "confirmé", methode: "Virement bancaire", reference: "TXN-2025-001" },
    { id: 2, type: "location", vehicule: "BMW X3 2023", client: "Traore Fatou", clientPhone: "+225 05 98 76 54", montant: "315 000", montantNum: 315000, date: "26 Jan 2025", statut: "en_attente", methode: "Mobile Money", reference: "TXN-2025-002" },
    { id: 3, type: "vente", vehicule: "Mercedes Classe C", client: "Konan Yves", clientPhone: "+225 01 23 45 67", montant: "25 000 000", montantNum: 25000000, date: "24 Jan 2025", statut: "terminé", methode: "Virement bancaire", reference: "TXN-2025-003" },
    { id: 4, type: "location", vehicule: "Peugeot 3008 2024", client: "Bamba Issa", clientPhone: "+225 07 65 43 21", montant: "245 000", montantNum: 245000, date: "22 Jan 2025", statut: "confirmé", methode: "Mobile Money", reference: "TXN-2025-004" },
    { id: 5, type: "vente", vehicule: "Hyundai Tucson 2023", client: "Coulibaly Marie", clientPhone: "+225 05 11 22 33", montant: "16 000 000", montantNum: 16000000, date: "20 Jan 2025", statut: "terminé", methode: "Chèque certifié", reference: "TXN-2025-005" },
    { id: 6, type: "location", vehicule: "Audi Q5 2022", client: "Koffi Jean", clientPhone: "+225 07 44 55 66", montant: "385 000", montantNum: 385000, date: "18 Jan 2025", statut: "annulé", methode: "Mobile Money", reference: "TXN-2025-006" },
    { id: 7, type: "vente", vehicule: "Volkswagen Golf 2023", client: "Soro Ibrahim", clientPhone: "+225 01 77 88 99", montant: "14 000 000", montantNum: 14000000, date: "15 Jan 2025", statut: "terminé", methode: "Virement bancaire", reference: "TXN-2025-007" },
    { id: 8, type: "location", vehicule: "Toyota Corolla 2024", client: "Ouattara Awa", clientPhone: "+225 05 33 22 11", montant: "175 000", montantNum: 175000, date: "12 Jan 2025", statut: "terminé", methode: "Espèces", reference: "TXN-2025-008" },
]

export default function TransactionsPage() {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const toastId = toast.loading("Chargement des transactions...")
        const load = async () => {
            await new Promise(r => setTimeout(r, 1500))
            setIsLoading(false)
            toast.dismiss(toastId)
        }
        load()
    }, [])

    const totalRevenus = transactions.filter(t => t.statut !== "annulé").reduce((sum, t) => sum + t.montantNum, 0)
    const revenusVentes = transactions.filter(t => t.type === "vente" && t.statut !== "annulé").reduce((sum, t) => sum + t.montantNum, 0)
    const revenusLocations = transactions.filter(t => t.type === "location" && t.statut !== "annulé").reduce((sum, t) => sum + t.montantNum, 0)

    const formatMontant = (n: number) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
        if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
        return n.toString()
    }

    const getStatutColor = (statut: string) => {
        switch (statut) {
            case "confirmé": return "bg-zinc-900/10 text-zinc-700 border-zinc-900/20"
            case "en_attente": return "bg-amber-500/10 text-amber-600 border-amber-500/20"
            case "terminé": return "bg-blue-500/10 text-blue-600 border-blue-500/20"
            case "annulé": return "bg-red-500/10 text-red-600 border-red-500/20"
            default: return "bg-muted text-muted-foreground"
        }
    }

    const getStatutLabel = (statut: string) => {
        switch (statut) {
            case "confirmé": return "Confirmé"
            case "en_attente": return "En attente"
            case "terminé": return "Terminé"
            case "annulé": return "Annulé"
            default: return statut
        }
    }

    const getStatutIcon = (statut: string) => {
        switch (statut) {
            case "confirmé": return <CheckCircle2 className="h-4 w-4" />
            case "en_attente": return <Clock className="h-4 w-4" />
            case "terminé": return <CheckCircle2 className="h-4 w-4" />
            case "annulé": return <XCircle className="h-4 w-4" />
            default: return null
        }
    }

    const stats = [
        { label: "Revenus totaux", value: `${formatMontant(totalRevenus)} FCFA`, icon: Wallet, color: "bg-zinc-900/10 text-zinc-700", trend: "+12.5%", up: true },
        { label: "Ventes", value: `${formatMontant(revenusVentes)} FCFA`, icon: Tag, color: "bg-zinc-900/10 text-zinc-700", trend: "+8.2%", up: true },
        { label: "Locations", value: `${formatMontant(revenusLocations)} FCFA`, icon: Key, color: "bg-blue-500/10 text-blue-600", trend: "+15.1%", up: true },
        { label: "Transactions", value: transactions.length.toString(), icon: FileText, color: "bg-purple-500/10 text-purple-600", trend: `${transactions.filter(t => t.statut === "en_attente").length} en attente`, up: true },
    ]

    const filterTransactions = (tab: string) => {
        if (tab === "ventes") return transactions.filter(t => t.type === "vente")
        if (tab === "locations") return transactions.filter(t => t.type === "location")
        return transactions
    }

    if (isLoading) {
        return (
            <div className="min-h-screen pt-20 px-4 md:px-6 pb-12">
                <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
                    <Skeleton className="h-10 w-64" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                    </div>
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-20 px-4 md:px-6 pb-12">
            <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-in fade-in slide-in-from-left duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900/10 flex items-center justify-center">
                            <Wallet className="h-6 w-6 text-zinc-700" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Transactions</h1>
                            <p className="text-muted-foreground text-sm">Historique de vos ventes et locations</p>
                        </div>
                    </div>
                    <Button variant="outline" className="gap-2 cursor-pointer rounded-xl">
                        <Download className="h-4 w-4" /> Exporter
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom duration-500">
                    {stats.map((s, i) => (
                        <Card key={i} className={cn(CARD, "hover:shadow-lg transition-all duration-300")}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.color)}>
                                        <s.icon className="h-5 w-5" />
                                    </div>
                                </div>
                                <p className="text-xl font-bold">{s.value}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                    <span className={cn("text-xs font-medium", s.up ? "text-zinc-700" : "text-red-500")}>
                                        {s.trend}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Transactions List */}
                <Tabs defaultValue="toutes" className="animate-in fade-in slide-in-from-bottom duration-500 delay-200">
                    <TabsList className="bg-muted/50 rounded-xl p-1 mb-4">
                        <TabsTrigger value="toutes" className="rounded-lg cursor-pointer data-[state=active]:bg-zinc-900 data-[state=active]:text-white">Toutes</TabsTrigger>
                        <TabsTrigger value="ventes" className="rounded-lg cursor-pointer data-[state=active]:bg-zinc-900 data-[state=active]:text-white">Ventes</TabsTrigger>
                        <TabsTrigger value="locations" className="rounded-lg cursor-pointer data-[state=active]:bg-blue-500 data-[state=active]:text-white">Locations</TabsTrigger>
                    </TabsList>

                    {["toutes", "ventes", "locations"].map(tab => (
                        <TabsContent key={tab} value={tab} className="space-y-3">
                            {filterTransactions(tab).map(t => (
                                <Card key={t.id} className={cn(CARD, "hover:shadow-lg transition-all duration-300")}>
                                    <CardContent className="p-4">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            {/* Icon + Type */}
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                t.type === "vente" ? "bg-zinc-900/10 text-zinc-700" : "bg-blue-500/10 text-blue-600"
                                            )}>
                                                {t.type === "vente" ? <Tag className="h-5 w-5" /> : <Key className="h-5 w-5" />}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-bold text-sm">{t.vehicule}</h3>
                                                    <Badge className={cn("rounded-full text-[10px]", getStatutColor(t.statut))}>
                                                        {getStatutIcon(t.statut)}
                                                        <span className="ml-1">{getStatutLabel(t.statut)}</span>
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                                                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {t.client}</span>
                                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {t.date}</span>
                                                    <span>{t.methode}</span>
                                                </div>
                                            </div>

                                            {/* Montant */}
                                            <div className="text-right shrink-0">
                                                <p className={cn("text-lg font-bold", t.statut === "annulé" ? "text-muted-foreground line-through" : "text-zinc-700")}>
                                                    {t.montant} <span className="text-xs font-normal">FCFA</span>
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">{t.reference}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    )
}
