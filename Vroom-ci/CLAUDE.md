# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vroom CI is a vehicle marketplace platform built with Next.js 16, allowing users to buy, rent, and sell vehicles. The application supports two user roles: **clients** (buyers/renters) and **vendeurs** (sellers), with French as the primary interface language.

## Development Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 16.1.5 (App Router)
- **Language**: TypeScript (strict mode, ES2017 target)
- **Styling**: Tailwind CSS v4 with custom oklch color space
- **UI Components**: shadcn/ui (New York style) + Radix UI primitives
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)
- **Fonts**: Geist Sans + Geist Mono (Google Fonts via next/font)
- **Animations**: tw-animate-css

## Architecture

### Directory Structure

```
app/
├── components/         # App-specific components (Header, EditProfil)
├── client/            # Client dashboard routes
│   ├── profile/       # User profile page
│   └── notifications/ # Notifications page
├── landing/           # Landing page
├── layout.tsx         # Root layout with Header and Toaster
├── page.tsx          # Home page (renders all pages currently)
└── globals.css       # Global styles with theme variables

components/ui/         # Reusable shadcn/ui components
hooks/                # Custom React hooks
lib/                  # Utilities (utils.ts with clsx/tailwind-merge)
public/               # Static assets
```

### Key Patterns

**Path Aliases**: `@/*` resolves to project root (e.g., `@/components/ui/button`)

**Client Components**: Interactive components use `"use client"` directive (Header, profile, dialogs)

**User Roles**:
- Role differentiation via badge colors: orange (client) vs green (vendeur)
- Conditional UI based on `user.role`

**Theming**:
- CSS variables defined in `app/globals.css` using oklch color space
- Dark mode support via `.dark` class
- Custom radius scale (sm to 4xl) based on `--radius: 0.625rem`

**Component Composition**:
- shadcn/ui components are in `components/ui/` (Avatar, Badge, Button, Card, Dialog, Input, Label, Menubar, Separator, Sheet, Sidebar, Skeleton, Sonner, Tabs, Tooltip)
- App components use these primitives for consistent styling
- Forms use Radix UI Label + Input combinations

**Toast Notifications**:
- Toaster configured in root layout with `position="top-center"`
- Success toasts use green color class
- Loading states with `toast.loading()` / `toast.dismiss()`

### Current Implementation Notes

**Navigation**: The main `page.tsx` currently renders all pages simultaneously (LandingPage, ProfilePage, Notifications). This should likely be refactored to use Next.js routing properly.

**State Management**: Currently using React useState with mock data. No backend integration yet.

**Form Handling**: EditProfil component shows pattern for dialog-based forms with controlled open state.

**Loading States**: Profile page demonstrates loading skeleton pattern with 2-second mock delay.

## Component Library Configuration

shadcn/ui configured via `components.json`:
- Style: "new-york"
- Base color: zinc
- CSS variables: enabled
- Icon library: lucide
- RSC (React Server Components): enabled

To add new shadcn components, use the shadcn CLI (not included in dependencies, install globally if needed).

## Styling Guidelines

**Color System**: Use semantic color variables from globals.css:
- `primary` / `primary-foreground`
- `secondary` / `secondary-foreground`
- `muted` / `muted-foreground`
- `accent` / `accent-foreground`
- `destructive`
- `border` / `input` / `ring`
- Role-specific: orange-500 (client), green-500 (vendeur)

**Radius**: Use Tailwind's `rounded-{size}` with custom scale (sm/md/lg/xl/2xl/3xl/4xl)

**Animations**: Apply `animate-in`, `fade-in`, `slide-in-from-{direction}` classes from tw-animate-css

## TypeScript Configuration

- Strict mode enabled
- JSX transform: react-jsx (no React import needed)
- Module resolution: bundler
- Path mapping: `@/*` → `./*`
