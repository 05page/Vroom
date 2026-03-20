"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function VehiclesError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error("[Vehicles] Erreur page :", error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
                <AlertCircle className="w-8 h-8 text-destructive" />
            </div>

            <div className="space-y-1">
                <h2 className="text-xl font-semibold">Impossible de charger les véhicules</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                    {error.message || "Une erreur est survenue lors du chargement. Veuillez réessayer."}
                </p>
            </div>

            <Button onClick={reset} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Réessayer
            </Button>
        </div>
    )
}
