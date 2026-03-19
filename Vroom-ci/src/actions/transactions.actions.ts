import { api } from "@/src/lib/api"
import type { TransactionConclue } from "@/src/types"

/** Client — liste ses transactions en attente/confirmées. */
export const getMesDemandes = () =>
  api.get<TransactionConclue[]>("/transactions-conclues/mes-demandes")

/** Vendeur — liste ses transactions. */
export const getMesTransactions = () =>
  api.get<TransactionConclue[]>("/transactions-conclues/mes-transactions")

/** Vendeur — renseigne les infos du deal et confirme avec le code. */
export const confirmerVendeur = (
  id: string,
  data: {
    code: string
    type: "vente" | "location"
    prix_final: number
    date_debut_location?: string
    date_fin_location?: string
  }
) => api.post<TransactionConclue>(`/transactions-conclues/${id}/confirmer-vendeur`, data)

/** Client — confirme avec le code reçu par notification. */
export const confirmerClient = (id: string, code: string) =>
  api.post<TransactionConclue>(`/transactions-conclues/${id}/confirmer-client`, { code })

/** Client — refuse la transaction. */
export const refuserTransaction = (id: string) =>
  api.post<void>(`/transactions-conclues/${id}/refuser`, {})
