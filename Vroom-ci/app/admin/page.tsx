import { redirect } from "next/navigation"

// Redirige automatiquement vers le dashboard admin
export default function AdminPage() {
    redirect("/admin/dashboard")
}
