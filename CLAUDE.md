# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

SkillForge is a mobile e-learning platform built with Expo (SDK 56) targeting iOS, Android, and web. The backend is Supabase (Postgres + Auth + Storage). No tests are currently configured.

## Commands

```bash
# Start dev server (choose platform interactively)
npx expo start

# Target a specific platform
npx expo start --android
npx expo start --ios
npx expo start --web
```

## Environment Setup

Copy `.env.example` to `.env` and fill in:
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anon/public key
- `YOUTUBE_API_KEY` — YouTube Data API v3 key

## Key Dependencies

| Package | Purpose |
|---|---|
| `@supabase/supabase-js` | Auth, database, storage |
| `@react-navigation/native` + `bottom-tabs` + `stack` | Navigation |
| `expo-notifications` | Push notifications |
| `expo-print` + `expo-sharing` | PDF export/share |
| `expo-keep-awake` | Prevent sleep during lessons |
| `react-native-webview` + `react-native-youtube-iframe` | Embedded video content |
| `lucide-react-native` | Icons |
| `@react-native-async-storage/async-storage` | Local persistence |

## Design System (from DESIGN.md)

### Colors
- **Primary**: `#0050cb` (Electric Blue) — CTAs, progress indicators
- **Primary container**: `#0066ff` — floating elements
- **Accent/Tertiary**: `#a33200` / `#cc4204` (Orange) — badges, streaks, motivation
- **Background**: `#f7f9fc` (soft gray canvas)
- **Surface/Cards**: `#ffffff` with 1px `#e0e3e6` border
- Always pair text with its corresponding `on-*` token (e.g., `on-primary: #ffffff`)

### Typography
- Font: **Inter** throughout (no other typefaces)
- `headline-lg`: 30px / 700 weight / -0.02em tracking
- `body-md`: 16px / 400 weight / 24px line-height
- `label-md`: 12px / 600 weight / 0.05em tracking (metadata chips)

### Spacing (4px base unit)
- Side margin: `20px`; gutter: `16px`
- Stack sm/md/lg/xl: `8px` / `16px` / `24px` / `40px`

### Shape
- Major components (cards, primary buttons): `16px` radius
- Small elements (chips, icons): `8px` radius

### Components
- **Primary button**: 56px height, Electric Blue bg, bold white Inter, `16px` radius
- **Course cards**: white, `16px` radius, `1px` soft gray border, thumbnail with `12px` inner radius
- **Progress bars**: 4–6px height, gray track → Electric Blue fill → orange on complete
- **Input fields**: `12px` radius, gray bg, 2px Electric Blue border on focus
- **Bottom nav**: Deep Navy icons, Electric Blue tint + 4px dot for active state

### Elevation
- Background: `#f7f9fc`
- Cards: `box-shadow: 0px 4px 12px rgba(0,0,0,0.05)`
- Floating/modals: `box-shadow: 0px 8px 20px rgba(0,102,255,0.15)`
- Sticky headers use semi-transparent backdrop blur

## Architecture Notes

- **Entry**: `index.ts` → `registerRootComponent(App)` → `App.tsx`
- TypeScript strict mode is enabled (`tsconfig.json` extends `expo/tsconfig.base`)
- No path aliases are configured yet; use relative imports
- Supabase client should be initialized once and exported as a singleton (use `react-native-url-polyfill` before initializing — already in dependencies)
- `expo-notifications` requires device registration; the notification permissions flow must be handled at app startup
