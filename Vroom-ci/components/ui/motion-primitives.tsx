"use client"

/**
 * motion-primitives.tsx
 *
 * Composants d'animation réutilisables basés sur motion/react.
 * Toutes les animations sont légères : opacity 0→1 + y 20→0, durée ≤ 0.4s.
 * Aucun layout shift : on n'utilise pas position absolute.
 *
 * Usage :
 *   <FadeIn delay={0.1}>...</FadeIn>
 *   <StaggerList><StaggerItem>...</StaggerItem></StaggerList>
 *   <SlideIn direction="left">...</SlideIn>
 */

import { motion, type Variants, type HTMLMotionProps } from "motion/react"

// ─── Variants exportés ────────────────────────────────────────────────────────
// Exportés pour permettre un usage avancé (ex: contrôler les animations depuis
// un parent avec `animate="visible"` / `animate="hidden"`).

/** Fade + slide up — pour les pages, sections, headers */
export const fadeInVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, delay, ease: "easeOut" },
    }),
}

/** Container stagger — chaque enfant s'anime avec un décalage automatique */
export const staggerContainerVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            // Délai entre chaque enfant (secondes)
            staggerChildren: 0.07,
        },
    },
}

/** Item individuel dans un stagger — fade + slide up */
export const staggerItemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: "easeOut" },
    },
}

/** Slide depuis une direction — pour les headers de page */
export const slideInVariants: Variants = {
    hidden: (direction: SlideDirection) => ({
        opacity: 0,
        x: direction === "left" ? -24 : direction === "right" ? 24 : 0,
        y: direction === "up" ? 24 : 0,
    }),
    visible: (delay: number = 0) => ({
        opacity: 1,
        x: 0,
        y: 0,
        transition: { duration: 0.4, delay, ease: "easeOut" },
    }),
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SlideDirection = "left" | "right" | "up"

interface FadeInProps extends Omit<HTMLMotionProps<"div">, "initial" | "animate" | "variants"> {
    /** Délai avant le début de l'animation, en secondes */
    delay?: number
    /** Durée de l'animation, en secondes (défaut : 0.4) */
    duration?: number
    className?: string
    children: React.ReactNode
}

interface StaggerListProps extends Omit<HTMLMotionProps<"div">, "initial" | "animate" | "variants"> {
    className?: string
    children: React.ReactNode
}

interface StaggerItemProps extends Omit<HTMLMotionProps<"div">, "initial" | "animate" | "variants"> {
    className?: string
    children: React.ReactNode
}

interface SlideInProps extends Omit<HTMLMotionProps<"div">, "initial" | "animate" | "variants" | "custom"> {
    /** Direction depuis laquelle le composant entre à l'écran */
    direction?: SlideDirection
    /** Délai avant le début de l'animation, en secondes */
    delay?: number
    className?: string
    children: React.ReactNode
}

// ─── Composants ───────────────────────────────────────────────────────────────

/**
 * FadeIn
 * Anime l'apparition d'un bloc avec fade + slide-up au montage.
 * Idéal pour les pages entières, sections, cards.
 *
 * @param delay    - délai en secondes avant le départ de l'animation
 * @param duration - durée de l'animation (défaut 0.4s)
 */
export function FadeIn({ delay = 0, duration = 0.4, className, children, ...props }: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay, ease: "easeOut" }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/**
 * StaggerList
 * Container qui anime ses enfants StaggerItem avec un délai décalé automatique.
 * Utilise `variants` + `staggerChildren` de Framer Motion.
 *
 * @example
 * <StaggerList className="grid grid-cols-3 gap-4">
 *   {items.map(item => <StaggerItem key={item.id}><Card .../></StaggerItem>)}
 * </StaggerList>
 */
export function StaggerList({ className, children, ...props }: StaggerListProps) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainerVariants}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/**
 * StaggerItem
 * Enfant direct de StaggerList. S'anime avec fade + slide-up,
 * avec un délai calculé automatiquement par le container parent.
 */
export function StaggerItem({ className, children, ...props }: StaggerItemProps) {
    return (
        <motion.div
            variants={staggerItemVariants}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/**
 * SlideIn
 * Anime l'entrée depuis une direction (gauche, droite, ou bas).
 * Idéal pour les headers de page.
 *
 * @param direction - "left" | "right" | "up" (défaut : "left")
 * @param delay     - délai en secondes
 */
export function SlideIn({ direction = "left", delay = 0, className, children, ...props }: SlideInProps) {
    const initial = {
        opacity: 0,
        x: direction === "left" ? -24 : direction === "right" ? 24 : 0,
        y: direction === "up" ? 24 : 0,
    }

    return (
        <motion.div
            initial={initial}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.4, delay, ease: "easeOut" }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}
