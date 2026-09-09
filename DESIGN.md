# Design System & Visual Foundations

<!-- impeccable:design-schema 1 -->

## Visual Identity & World

`covilink` implements a modern, high-converting, dark-mode visual grid system inspired by **Linkme** (`linkme.webp`).

- **Theme**: Ultra-dark glassmorphism (`#08090d` background, `#12141c` glass cards).
- **Color Palette**:
  - **Brand Pink**: `#ff3b94` (Primary highlight, verified badges, action glows)
  - **Brand Purple**: `#9d4edf` (Subtle gradients, background aura, shadow glows)
  - **Brand Cyan**: `#00f2fe` (Accent indicators, stats highlights)
  - **Neutrals**: `#0b0c10`, `#1a1d29`, `#f3f4f6`
- **Typography**: Inter (Variable font), clean sans-serif with bold weight hierarchy for instant legibility on mobile viewports.
- **Card System**:
  - Hero Cover Header with profile picture and verified badge.
  - Social Icon Pill Row with smooth micro-interactions.
  - Featured Full-Width Hero Card with thumbnail image, category badge, overlay text, and link icon.
  - 2x2 Grid Visual Cards with dark gradient overlays, hover zoom, and click tracking triggers.
  - Contact Email Card with quick copy-to-clipboard feedback.

## Admin Dashboard (`/admin`)

- Real-time Analytics overview (Total Clicks, Estimated Unique Visitors, Top Link, Engagement Rate).
- Detailed Link Breakdown Table with visual progress bars.
- Origin by Device breakdown (Mobile, Desktop, Tablet).
- Real-time Click Activity Stream.
- Visual Link Manager with live active/hidden toggle status.
- Database Connection Readiness Banner for Neon PostgreSQL integration.
