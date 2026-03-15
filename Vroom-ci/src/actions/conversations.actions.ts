import { api } from "@/src/lib/api"
import type { Conversation, ConversationsResponse, Message, MessagesResponse } from "@/src/types"

/** Récupère toutes les conversations de l'utilisateur connecté. */
export const getConversations = () =>
  api.get<ConversationsResponse>("/conversations")

/**
 * Crée une nouvelle conversation ou retourne celle qui existe déjà
 * entre l'utilisateur connecté et un autre utilisateur pour un véhicule donné.
 * À appeler quand un client clique sur "Contacter le vendeur".
 */
export const getOrCreateConversation = (data: {
  other_user_id: string
  vehicule_id: string
}) => api.post<Conversation>("/conversations", data)

/** Récupère tous les messages d'une conversation. */
export const getMessages = (conversationId: string) =>
  api.get<MessagesResponse>(`/conversations/${conversationId}/messages`)

/** Envoie un message dans une conversation. */
export const sendMessage = (conversationId: string, content: string) =>
  api.post<Message>(`/conversations/${conversationId}/messages`, { content })

/** Marque tous les messages non lus d'une conversation comme lus. */
export const markConversationAsRead = (conversationId: string) =>
  api.post<unknown>(`/conversations/${conversationId}/read`, {})
