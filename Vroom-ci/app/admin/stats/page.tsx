import { BarChart3 } from "lucide-react"

export default function AdminStatsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
            <div className="p-4 rounded-full bg-secondary">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Statistiques</h1>
            <p className="text-muted-foreground max-w-sm">
                Cette fonctionnalité est en cours de développement. Elle sera disponible prochainement.
            </p>
        </div>
    )
}
