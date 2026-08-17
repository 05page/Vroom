"use client";

import { CheckCheck, Clock } from "lucide-react";

import { cn, formaterHeure } from "@/lib/utils";
import type { MessageChat } from "@/types";


export type BulleMessageProps = {
  message: MessageChat;
  /** Vrai quand `sender_id` est l'utilisateur courant : aligne à droite et passe en gold. */
  deMoi: boolean;
  /**
   * Message poussé en optimiste, pas encore confirmé par le serveur.
   * Le parent le déduit de l'id (`temp-…`), il n'a pas d'état dédié pour ça.
   */
  enAttente?: boolean;
};

export default function BulleMessage({
  message,
  deMoi,
  enAttente = false,
}: BulleMessageProps) {
  return (
    <div className={cn("flex", deMoi ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-md border px-4 py-2.5 sm:max-w-[75%]",
          deMoi
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card",
          // l'opacité est le seul signal d'attente : pas de spinner, le texte reste lisible
          enAttente && "opacity-60"
        )}
      >
        {/* whitespace-pre-wrap : les retours à la ligne de Maj+Entrée sont conservés */}
        <p className="whitespace-pre-wrap wrap-break-word text-sm">
          {message.content}
        </p>

        <p
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[0.6875rem] tabular-nums",
            deMoi ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {enAttente ? (
            <>
              <Clock className="size-3" />
              Envoi…
            </>
          ) : (
            <>
              {formaterHeure(message.created_at)}
              {/* l'accusé de lecture n'a de sens que sur MES messages */}
              {deMoi && message.is_read && <CheckCheck className="size-3.5" />}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
