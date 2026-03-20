"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

// global-error remplace le root layout — il faut inclure <html> et <body>
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("[GlobalError]", error)
    }, [error])

    return (
        <html lang="fr">
            <body>
                <div style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "1.5rem",
                    padding: "1.5rem",
                    textAlign: "center",
                    fontFamily: "system-ui, sans-serif",
                }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: "50%",
                        background: "#fee2e2",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <AlertTriangle style={{ width: 32, height: 32, color: "#dc2626" }} />
                    </div>

                    <div style={{ maxWidth: 360 }}>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem" }}>
                            Une erreur critique est survenue
                        </h1>
                        <p style={{ color: "#6b7280", margin: 0 }}>
                            L&apos;application a rencontré un problème inattendu.
                            Veuillez réessayer ou recharger la page.
                        </p>
                    </div>

                    <button
                        onClick={reset}
                        style={{
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            padding: "0.5rem 1.25rem", borderRadius: 8,
                            border: "1px solid #d1d5db", background: "white",
                            cursor: "pointer", fontSize: "0.875rem", fontWeight: 500,
                        }}
                    >
                        <RefreshCw style={{ width: 16, height: 16 }} />
                        Réessayer
                    </button>
                </div>
            </body>
        </html>
    )
}
