/**
 * PDFDownloadButton
 * Wrapper qui regroupe PDFDownloadLink + FicheVehiculePDF.
 * Ce fichier doit TOUJOURS être chargé via dynamic({ ssr: false })
 * car @react-pdf/renderer embarque sa propre copie de React.
 * Un import statique de ce fichier (ou de FicheVehiculePDF) casse tous les hooks.
 */
import { PDFDownloadLink } from "@react-pdf/renderer"
import { FicheVehiculePDF } from "./FicheVehiculePDF"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { vehicule } from "@/src/types"

interface Props {
    vehicule: vehicule
    backendUrl: string
}

export default function PDFDownloadButton({ vehicule, backendUrl }: Props) {
    const fileName = `vroom-${vehicule.description?.marque ?? "vehicule"}-${vehicule.description?.modele ?? ""}-${vehicule.id.slice(0, 8)}.pdf`.toLowerCase()

    return (
        <PDFDownloadLink
            document={<FicheVehiculePDF vehicule={vehicule} backendUrl={backendUrl} />}
            fileName={fileName}
        >
            {({ loading }: { loading: boolean }) => (
                <Button
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    className="gap-2 cursor-pointer"
                >
                    <Download className="h-4 w-4" />
                    {loading ? "Génération…" : "Télécharger la fiche PDF"}
                </Button>
            )}
        </PDFDownloadLink>
    )
}
