import Link from "next/link"
import { Car, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">
            {/* Icône */}
            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-muted">
                <Car className="w-12 h-12 text-muted-foreground" />
            </div>

            {/* Texte */}
            <div className="space-y-2 max-w-sm">
                <p className="text-6xl font-bold tracking-tight">404</p>
                <h1 className="text-2xl font-semibold">Page introuvable</h1>
                <p className="text-muted-foreground">
                    Cette page n&apos;existe pas ou a été déplacée.
                </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                    <Link href="/">
                        <Home className="w-4 h-4 mr-2" />
                        Accueil
                    </Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/vehicles">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voir les véhicules
                    </Link>
                </Button>
            </div>
        </div>
    )
}
