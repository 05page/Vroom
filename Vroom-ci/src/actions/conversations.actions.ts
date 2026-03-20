import { api } from "@/src/lib/api"
import type { Conversation, ConversationsResponse, Message, MessagesResponse } from "@/src/types"

/**
 * Récupère toutes les conversations de l'utilisateur connecté.
 * Chaque conversation inclut : other_participant, vehicule, last_message, unread_count.
 */
export const getConversations = () =>
  api.get<ConversationsResponse>("/conversations")

/**
 * Trouve ou crée une conversation entre l'user connecté et un autre user pour un véhicule donné.
 * Idempotent : si la conversation existe déjà, la retourne sans créer de doublon.
 * Appelé depuis la page véhicule quand le client clique sur "Contacter".
 */
export const findOrCreateConversation = (data: {
  vehicule_id: string
  other_user_id: string
}) => api.post<{ conversation: Conversation }>("/conversations", data)

/**
 * Récupère les messages d'une conversation.
 * Marque automatiquement les messages reçus non-lus comme lus côté backend.
 */
export const getMessages = (conversationId: string) =>
  api.get<MessagesResponse>(`/conversations/${conversationId}/messages`)

/**
 * Envoie un message texte dans une conversation.
 * Le backend broadcast le message via Reverb aux autres participants en temps réel.
 */
export const sendMessage = (conversationId: string, content: string) =>
  api.post<{ message: Message }>(`/conversations/${conversationId}/messages`, { content })

/** Marque tous les messages non-lus d'une conversation comme lus. */
export const markConversationAsRead = (conversationId: string) =>
  api.post<void>(`/conversations/${conversationId}/read`, {})

/** Supprime un message (seul l'expéditeur peut le faire). */
export const deleteMessage = (conversationId: string, messageId: string) =>
  api.delete<void>(`/conversations/${conversationId}/messages/${messageId}`)
