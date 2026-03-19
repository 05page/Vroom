import AbonnementsContent from "@/app/components/AbonnementsContent"

const AbonnementsPage = () => {
    return (
        <div className="space-y-6">
            <div className="px-6 pt-6">
                <h1 className="text-2xl font-bold tracking-tight">Abonnements</h1>
                <p className="text-muted-foreground">
                    Gérez votre plan et débloquez plus de fonctionnalités.
                </p>
            </div>
            <AbonnementsContent />
        </div>
    )
}

export default AbonnementsPage
