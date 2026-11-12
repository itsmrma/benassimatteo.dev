# benassimatteo.dev

> **Personal engineering portfolio & interactive desktop showcase of Matteo Benassi**  
> Computer Engineering student at UNIMORE (Mantova), Rust & Systems Developer, 3x Hackathon Winner, and Aspiring Motorsport & High-Performance Software Engineer.

[![Live Site](https://img.shields.io/badge/live-benassimatteo.dev-4f46e5?style=flat-square&logo=cloudflare)](https://benassimatteo.dev)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Astryx Design](https://img.shields.io/badge/Design_System-Astryx_0.7-10b981?style=flat-square)](https://astryx.design)
[![Cloudflare Pages](https://img.shields.io/badge/Hosted_on-Cloudflare_Pages-f38020?style=flat-square&logo=cloudflare)](https://pages.cloudflare.com/)

---

## Overview

**benassimatteo.dev** is a high-performance, single-page engineering portfolio designed around the **Livrea** aesthetic: a technical, telemetry-inspired motorsport poster combining dense engineering metrics with interactive live software previews.

Rather than displaying static screenshots or artificial mockups, the portfolio features an **interactive macOS-style desktop stage** hosting live, runnable application builds (such as [Oxide](https://github.com/getoxide/oxide) running with deterministic IPC mock fixtures directly in-browser).

### Highlights

- **Interactive Desktop Window Stage**: Custom-built window manager supporting 8-directional edge/corner resizing, multi-touch drag, pointer capture, stage boundaries, and preset transitions (maximize, default, restore).
- **Live In-Browser App Previews**: Embedded live frontend of Oxide inside a sandboxed iframe with deterministic IPC mock fixtures, alongside interactive showcases for SyncForge and scrobbl.rs.
- **Motorsport Telemetry Canvas**: Procedural canvas-rendered background simulating racing telemetry data channels and time-series telemetry plots.
- **Astryx Design System**: Fully built on `@astryxdesign/core` layout primitives and semantic design tokens, strictly avoiding unstyled `<div>` / `<span>` primitives.
- **Responsive Snap Scroll**: 9 distinct telemetry panels (Chassis, Podium, Oxide, SyncForge, Scrobbl, Embedded, Machinery, Grid, Contact) with smooth keyboard and scroll navigation.

---

## Featured Work & Showcases

| Project | Role / Recognition | Stack | Description |
|---|---|---|---|
| **[Oxide](https://github.com/getoxide/oxide)** · [Website](https://oxide.cavallinilorenzo.com) | Co-founder (Pre-release) | Rust · Tauri 2 · React | Desktop orchestrator running Claude Code, Codex, and Antigravity in isolated Git worktrees with turn-by-turn verification. Conceived and co-founded with Lorenzo Cavallini. |
| **[SyncForge](https://github.com/itsmrma/SyncForge)** | Author | Rust · Tauri 2 · FFmpeg | Audio and subtitle alignment via FFT cross-correlation and lossless MKV remuxing, including an MCP server. |
| **[Garda Chiese Alert](https://github.com/cavallinilorenzo/alert-app-garda-chiese)** | 1st Place · Hack4Water 2026 | Django · PostGIS · React · Gemini | Citizen reporting platform covering a 76,645-hectare river basin with geospatial and multi-modal AI triage. |
| **[SCIoTeM Smart City](https://github.com/itsmrma)** | 2nd Place · SCIoTeM 2026 & 2025 | Embedded C · STM32 · LoRaWAN | Urban IoT sensing node with ultra-low power telemetry and bare-metal STM32 firmware. |
| **[scrobbl.rs](https://github.com/itsmrma/scrobbl-rs)** | Author | Rust · SQLite WAL · Axum · React | Self-hosted music listening archive and analytics daemon. Background Spotify collection, multi-year archive ingestion, and personal rankings in a single binary. |

---

## Architecture & Components

```
benassimatteo.dev/
├── public/
│   ├── _headers            # Cloudflare Pages security & framing rules
│   ├── demos/oxide/        # Pre-built interactive web demo of Oxide with mock IPC
│   ├── oxide-thread.png    # High-resolution Oxide fallback asset
│   ├── syncforge-preview.* # Preview assets for SyncForge
│   └── scrobbl-preview.*   # Preview assets for scrobbl.rs
├── src/
│   ├── components/
│   │   ├── desktop/        # Interactive macOS window stage engine
│   │   │   ├── AppPreview.tsx       # Live iframe / media demo router
│   │   │   ├── DesktopStage.tsx     # Bounded desktop viewport stage
│   │   │   ├── DesktopWindow.tsx    # Draggable/resizable window frame with controls
│   │   │   ├── geometry.ts          # Pure window constraint & drag math engine
│   │   │   └── useWindowDrag.ts     # Pointer capture and gesture hook
│   │   ├── LivreaPortfolio.tsx      # Main 9-panel snap scroll portfolio layout
│   │   └── TelemetryBackground.tsx  # Procedural HTML5 canvas telemetry renderer
│   ├── data/
│   │   └── curatedData.ts  # Centralized portfolio data (records, stats, projects)
│   ├── themes.ts           # Astryx custom theme tokens (Livrea slate/indigo palette)
│   ├── App.tsx             # Root React application entry
│   └── main.tsx            # DOM mount with Astryx core stylesheet setup
├── scripts/
│   ├── sync-demos.mjs      # Syncs prebuilt app demo assets into public/demos/
│   └── test-geometry.mjs   # Unit test runner for window geometry calculations
└── wrangler.jsonc          # Cloudflare Pages / Workers deployment config
```

### Window Stage Geometry Engine (`src/components/desktop/geometry.ts`)

The desktop window engine solves common web window resizing artifacts (page jumping, layout reflow, boundary loss):
- **Stage Isolation**: The window is positioned absolutely inside an explicit bounding stage, preventing window resize actions from perturbing the page scroll height or triggering snap resets.
- **Pure Vector Math**: Directional resizing (N, S, E, W, NE, NW, SE, SW) recalculates both size and position clamped strictly to stage boundaries (`clampToStage`).
- **Pointer Capture & Shield**: Active pointer capture via `setPointerCapture` and an invisible drag overlay prevent iframe events from stealing cursor focus during fast gestures.
- **Unit Tested**: Fully verified by Node's test runner (`npm run test:geometry`).

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/itsmrma/benassimatteo.dev.git
cd benassimatteo.dev
npm install
```

### Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Starts Vite local development server at `http://localhost:5173` |
| `npm run build` | Builds optimized production assets to `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run typecheck` | Runs TypeScript compiler verification (`tsc --noEmit`) |
| `npm run test:geometry` | Executes the unit tests for the window geometry engine |
| `npm run sync:demos` | Synchronizes pre-built interactive demos into `public/demos/` |
| `npm run pages:deploy` | Builds and deploys directly to Cloudflare Pages via Wrangler |

---

## Design System & Guidelines

This project strictly follows the **Astryx Design System** (`@astryxdesign/core`):

- **No Raw Containers**: Layouts are composed using semantic Astryx primitives (`VStack`, `HStack`, `Section`, `Card`, `Grid`, `Table`, `List`, `Text`, `Heading`, `Button`).
- **Tokenized Theming**: Colors and spacing strictly leverage theme tokens (`var(--color-*)`, `var(--spacing-*)`), preventing raw hex or pixel values in component code.
- **Documentation**: See [DESIGN.md](DESIGN.md) for design philosophy and [AGENTS.md](AGENTS.md) for coding agent guidelines.

---

## Deployment

The portfolio is deployed to **Cloudflare Pages**:

```bash
# Build and deploy to production
npm run pages:deploy
```

Configuration is defined in `wrangler.jsonc`. Security headers (allowing same-origin iframe embedding for local demo previews) are managed in `public/_headers`.

---

## Contact

- **Matteo Benassi** — Computer Engineering, UNIMORE (Mantova Campus)
- **Email**: [info@benassimatteo.dev](mailto:info@benassimatteo.dev)
- **Website**: [benassimatteo.dev](https://benassimatteo.dev)
- **GitHub**: [@itsmrma](https://github.com/itsmrma)
- **LinkedIn**: [linkedin.com/in/matteo-benassi-bb47b02b0](https://www.linkedin.com/in/matteo-benassi-bb47b02b0/)

---

## License

Personal portfolio content & code &copy; 2026 Matteo Benassi. All rights reserved.
Individual featured open-source projects are licensed under their respective repositories.
