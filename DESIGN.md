# DESIGN.md — benassimatteo.dev

## 1. Grounding & Identity
- **Subject**: Matteo Benassi — Computer Engineering B.Sc. student at UNIMORE (Mantova Campus), Rust & Systems developer, 3x Hackathon winner, aspiring Motorsport & High-Performance Software Engineer.
- **Audience**: Engineering recruiters, technical leads, motorsport teams (Formula 1 / GT / Hypercar telemetry & software), academic evaluators, and open-source contributors.
- **Primary Job**: Instantly communicate technical depth, engineering rigor, and real-world accomplishments (Oxide, SyncForge, Garda Chiese 1st place, STM32 embedded C, GIS) without distracting gimmicks or navigation friction.

---

## 2. Direction Brief: Minimal Systems & Engineering Craft
- **Layout**: Single continuous page with smooth anchor navigation in a sticky top bar. Linear narrative: Hero Identity → Academic & Key Signals → Featured Projects (deep dive) → Other Systems & Open Source → Academic Record & Timeline → Technical Stack → Direct Contact.
- **Typography**:
  - Headings: `Space Grotesk`, sans-serif (structural, modern, technical).
  - Body: `Inter`, sans-serif (crisp, readable, high legibility across densities).
  - Code / Monospace: `JetBrains Mono`, monospace (reserved for technical tags, commit hashes, metrics, and code snippets).
- **Color & Palette**:
  - Dark Mode Default: Deep slate `#090d16` canvas, `#0f172a` surface cards, `#1e293b` subtle borders.
  - Light Mode: Clean crisp `#f8fafc` canvas, `#ffffff` surface, `#e2e8f0` borders.
  - Accent: Electric Indigo (`#4f46e5` in light, `#6366f1` in dark) for focused actions.
  - Restraint: Avoid rainbow badge palettes. Use subtle, purposeful semantic colors only (green for podium awards, purple for UNIMORE/academic, indigo for systems).
- **Density**:
  - High information density for records and timeline (compact Astryx lists and tabular rows, avoiding bloated card nests).
  - Comfortable padding (`paddingBlock={3}` / `gap={3}`) between top-level sections.
- **Motion**:
  - Snappy, responsive transitions on hover (`transform: translateY(-2px)` on interactive buttons/cards).
  - Zero decorative canvas particles or artificial terminal blink loops.
- **Characteristic Moment**:
  - The "Featured Engineering" section: deep-dive cards showcasing real technical challenges, architecture flow, and live repository links for Oxide (Rust/Tauri 2) and Garda Chiese Alert (1st Place Hack4Water).

---

## 3. Astryx Design Rules & Constraints
- **Strictly No `<div>` or `<span>`**: All layout is composed of Astryx primitives (`VStack`, `HStack`, `StackItem`, `Center`, `Section`, `Card`, `Grid`, `Table`, `List`, `Item`, `Text`, `Heading`, `Button`, `Token`, `Divider`).
- **No Raw Hex/Px in Components**: Always use component props (`padding`, `gap`, `size`, `variant`) and theme CSS variables (`var(--color-*)`).
- **Data Density**: Lists and tables for academic milestones and coursework; cards only for standalone featured projects.
