# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 14+ (App Router), React, Tailwind CSS, Lucide Icons, Framer Motion, TypeScript, Neon DB (PostgreSQL) / Drizzle ORM ready (with robust local mock/state fallback when `DATABASE_URL` is unconfigured).

## Users

1. **Visitors**: Audience members arriving on the single bio page to view links, videos, products, social networks, and call-to-action cards.
2. **Owner / Admin**: The project owner accessing `/admin` to view live click metrics, analytics breakdowns, and manage link/media placements. *Nota de Escopo*: Não existe nem deve existir cadastro ou criação de usuários (sign-up/register terminantemente proibido); o acesso administrativo é pré-existente no Firebase Console.

## Product Purpose

`covilink` is a high-converting, visually striking single-page Link-in-Bio ("Linkme" style) with built-in click analytics and a clean admin dashboard. It replaces boring, plain link lists with rich visual cards, hero media, and interactive call-to-actions while tracking user clicks for actionable insights.

## Positioning

Unlike complex SaaS link aggregators, `covilink` is a lightweight, self-hostable single-instance link portal. It blends rich visual grid layouts inspired by Linkme with instant analytics and seamless Neon Postgres database readiness.

## Operating Context

- Mobile-first bio link viewed directly from social media profiles (Instagram, TikTok, Twitter, YouTube).
- Fast load times, responsive layout, smooth click tracking without delaying redirect/user experience.
- Admin dashboard (`/admin`) for analytics monitoring and real-time link/media layout management.

## Capabilities and Constraints

- **No User Creation / Sign-up (Constraint)**: Strictly single-owner instance. No user creation, sign-up, or self-registration flows exist or will be added; authentication is exclusively restricted to pre-existing credentials managed in Firebase Console.
- **Click Analytics**: Tracks every click on links, social icons, CTA buttons, and visual grid cards (timestamp, link target, category, device type).
- **Visual Card Layout**: Rich hero banner, social icon row, primary CTA button, 2x2 and full-width visual grid cards with thumbnails, titles, badges, and contact cards.
- **Admin Dashboard (`/admin`)**: Real-time metrics overview (total clicks, top performing links, conversion rate, device breakdown, activity feed, and live link configuration).
- **Database Readiness**: Neon PostgreSQL connection ready. In prototype mode (when `DATABASE_URL` is missing), state persists smoothly via server state / local storage.
- **Static Asset Management**: Media and photos are stored in local code/`public` directory as requested.

## Brand Commitments

- Inspiration: Modern Linkme visual grid aesthetic (`linkme.webp`).
- UI/UX Direction: Simple, elegant, high-impact, high-converting, dark-mode polished with vibrant accents.

## Evidence on Hand

- Reference visual inspiration photos in repo (`linkme.webp`, `linkalgumacoisa.avif`, `linkseila.webp`, `linktree.png`).

## Product Principles

1. **Visual-First Impact**: Move beyond sad long text link lists into engaging visual grid cards with media preview thumbnails and badges.
2. **Frictionless Tracking**: Capture click metrics instantly without compromising navigation speed or user trust.
3. **Intuitive Simplicity**: Simple to navigate for visitors, effortless to monitor for the owner.
