import { useState, useEffect, useRef } from 'react';
import {
  Section,
  VStack,
  HStack,
  Stack,
  Heading,
  Text,
  Link,
  Button,
  AspectRatio,
} from '@astryxdesign/core';
import {
  IDENTITY,
  FEATURED_PROJECTS,
  CONTACTS,
} from '../data/curatedData';
import { TelemetryBackground } from './TelemetryBackground';
import {
  DesktopStage,
  DesktopWindow,
  AppPreview,
  type AppPreviewRef,
} from './desktop';

interface LivreaPortfolioProps {
  onCopyEmail?: () => void;
  emailCopied?: boolean;
}

const PANELS = [
  { id: 'panel-1', num: '01', title: 'CHASSIS' },
  { id: 'panel-2', num: '02', title: 'PODIUM' },
  { id: 'panel-3', num: '03', title: 'OXIDE' },
  { id: 'panel-4', num: '04', title: 'SYNCFORGE' },
  { id: 'panel-5', num: '05', title: 'SCROBBL' },
  { id: 'panel-6', num: '06', title: 'EMBEDDED' },
  { id: 'panel-7', num: '07', title: 'MACHINERY' },
  { id: 'panel-8', num: '08', title: 'GRID' },
  { id: 'panel-9', num: '09', title: 'CONTACT' },
];

export function LivreaPortfolio({ onCopyEmail, emailCopied }: LivreaPortfolioProps) {
  const [activePanel, setActivePanel] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const oxidePreviewRef = useRef<AppPreviewRef | null>(null);

  const handleCopy = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onCopyEmail) {
      onCopyEmail();
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(CONTACTS.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isCopied = emailCopied ?? copied;

  const scrollToPanel = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const container = document.querySelector('.livrea-snap-container');
      if (container) {
        const docHeight = container.scrollHeight - container.clientHeight;
        if (docHeight > 0) {
          const progress = Math.min(100, Math.max(0, (container.scrollTop / docHeight) * 100));
          setScrollProgress(progress);
        }
      } else {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          const progress = Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100));
          setScrollProgress(progress);
        }
      }
    };

    const container = document.querySelector('.livrea-snap-container');
    const scrollTarget = container || window;
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // IntersectionObserver to detect active panel
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const panelId = entry.target.id;
            const match = panelId.match(/panel-(\d+)/);
            if (match) {
              setActivePanel(parseInt(match[1], 10));
            }
          }
        });
      },
      { threshold: 0.45 }
    );

    document.querySelectorAll('.livrea-panel').forEach((el) => observer.observe(el));

    // Keyboard navigation (ArrowUp/ArrowDown, PageUp/PageDown)
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (!activeEl) return;
      const activeTag = (activeEl.tagName || '').toLowerCase();
      if (
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeTag === 'iframe' ||
        activeEl.closest('.livrea-desktop-window') ||
        activeEl.closest('.livrea-desktop-stage') ||
        activeEl.closest('.livrea-os-window')
      ) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (activePanel < 8) {
          e.preventDefault();
          scrollToPanel(`panel-${activePanel + 1}`);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (activePanel > 1) {
          e.preventDefault();
          scrollToPanel(`panel-${activePanel - 1}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
    };
  }, [activePanel]);

  const oxideProj = FEATURED_PROJECTS.find((p) => p.id === 'oxide')!;
  const syncforgeProj = FEATURED_PROJECTS.find((p) => p.id === 'syncforge')!;
  const gardaProj = FEATURED_PROJECTS.find((p) => p.id === 'garda-chiese')!;
  const stm32Proj = FEATURED_PROJECTS.find((p) => p.id === 'stm32')!;
  const scrobblProj = FEATURED_PROJECTS.find((p) => p.id === 'scrobbl')!;

  return (
    <Section
      variant="transparent"
      paddingBlock={0}
      paddingInline={0}
      className="livrea-snap-container"
    >
      {/* Dynamic Lightweight Telemetry Background Animation */}
      <TelemetryBackground />

      {/* 1. Thin Red Lap Progress Bar at Top */}
      <HStack className="livrea-progress-track" aria-hidden="true">
        <Text as="span" className="livrea-progress-bar" style={{ width: `${scrollProgress}%` }}>
          {'\u00A0'}
        </Text>
      </HStack>

      {/* 2. Floating Quick-Jump Checkpoints on Right Margin (Desktop) */}
      <VStack gap={1} className="livrea-quick-nav" aria-label="Circuit checkpoint navigation">
        {PANELS.map((p, idx) => {
          const isActive = activePanel === idx + 1;
          return (
            <Link
              key={p.id}
              href={`#${p.id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToPanel(p.id);
              }}
              color={isActive ? 'accent' : 'secondary'}
              className={`livrea-nav-dot ${isActive ? 'is-active' : ''}`}
            >
              <HStack align="center" gap={1}>
                <Text type="code" size="sm" color={isActive ? 'accent' : 'secondary'}>
                  {p.num}
                </Text>
              </HStack>
            </Link>
          );
        })}
      </VStack>

      {/* ========================================================================= */}
      {/* 01 — IDENTIFICATION & CHASSIS SPEC (01) */}
      {/* ========================================================================= */}
      <VStack as="section" id="panel-1" className="livrea-panel livrea-panel-01">
        <VStack justify="between" height="100%" width="100%" className="livrea-panel-inner">
          {/* Top Bar */}
          <HStack justify="between" align="center" width="100%" className="livrea-telemetry-header">
            <HStack align="center" gap={2}>
              <Text as="span" className="livrea-red-indicator">{'\u00A0'}</Text>
              <Text weight="bold" color="secondary" size="sm" className="livrea-kicker">
                BENASSIMATTEO.DEV // MONOPOSTO SPEC 2026
              </Text>
            </HStack>
            <HStack align="center" gap={3}>
              <Text type="code" color="accent" size="sm" weight="bold">
                STATUS: RUNNING
              </Text>
            </HStack>
          </HStack>

          {/* Hero Content Block */}
          <VStack gap={4} width="100%" className="livrea-hero-center">
            {/* Massive Typographic Livery Name */}
            <VStack gap={0} width="100%" className="livrea-title-group">
              <Heading level={1} className="livrea-huge-name">
                MATTEO
              </Heading>
              <Heading level={1} className="livrea-huge-name">
                BENASSI
              </Heading>
            </VStack>

            {/* Technical Subtitle Bar */}
            <HStack align="center" gap={3} wrap="wrap" className="livrea-role-strip">
              <Text type="code" color="accent" weight="bold">
                COMPUTER ENGINEERING @ UNIMORE
              </Text>
              <Text color="secondary">·</Text>
              <Text type="code" color="primary">
                SOFTWARE &amp; SYSTEMS ENGINEER
              </Text>
              <Text color="secondary">·</Text>
              <Text type="code" color="secondary">
                MANTOVA, ITALY
              </Text>
            </HStack>

            {/* Manifesto Box with Red Racing Stripe */}
            <VStack gap={2} className="livrea-manifesto-card">
              <Text as="p" type="large" color="primary" className="livrea-manifesto-text">
                "{IDENTITY.manifesto}"
              </Text>
              <Text type="supporting" color="secondary">
                {IDENTITY.bio}
              </Text>
            </VStack>

            {/* Telemetry KPI Readout (3 Columns) */}
            <HStack justify="between" align="stretch" gap={3} width="100%" className="livrea-kpi-grid">
              <VStack gap={1} className="livrea-kpi-box">
                <Text type="code" color="secondary" size="sm">
                  KPI 01 // COMPETITION
                </Text>
                <Heading level={3} color="accent" weight="bold">
                  3x Podiums
                </Heading>
                <Text type="body" color="secondary">
                  1st Hack4Water 2026 · 2x SCIoTeM 2026 &amp; 2025
                </Text>
              </VStack>

              <VStack gap={1} className="livrea-kpi-box">
                <Text type="code" color="secondary" size="sm">
                  KPI 02 // ACADEMICS
                </Text>
                <Heading level={3} color="primary" weight="bold">
                  27.3 / 30 avg
                </Heading>
                <Text type="body" color="secondary">
                  125/180 ECTS · 100/100 High-School Diploma
                </Text>
              </VStack>

              <VStack gap={1} className="livrea-kpi-box">
                <Text type="code" color="secondary" size="sm">
                  KPI 03 // AVAILABILITY
                </Text>
                <Heading level={3} color="accent" weight="bold">
                  2026 / 27
                </Heading>
                <Text type="body" color="secondary">
                  {IDENTITY.availability}
                </Text>
              </VStack>
            </HStack>
          </VStack>

          {/* Bottom Bar */}
          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip">
            <HStack align="center" gap={3} wrap="wrap">
              <Link href={`mailto:${CONTACTS.email}`} onClick={handleCopy} color="accent" weight="bold">
                {isCopied ? 'EMAIL COPIED ✓' : CONTACTS.email}
              </Link>
              <Text color="secondary">·</Text>
              <Link href={CONTACTS.github} target="_blank" rel="noopener noreferrer" color="secondary">
                GitHub ↗
              </Link>
              <Text color="secondary">·</Text>
              <Link href={CONTACTS.linkedin} target="_blank" rel="noopener noreferrer" color="secondary">
                LinkedIn ↗
              </Link>
              <Text color="secondary">·</Text>
              <Link href={CONTACTS.cvEn} target="_blank" rel="noopener noreferrer" color="secondary">
                CV (EN)
              </Link>
              <Text color="secondary">/</Text>
              <Link href={CONTACTS.cvIt} target="_blank" rel="noopener noreferrer" color="secondary">
                (IT)
              </Link>
            </HStack>
            <HStack align="center" gap={2}>
              <Text type="code" color="accent" weight="bold" className="livrea-scroll-hint">
                SCROLL TO TELEMETRY ↓
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </VStack>

      {/* ========================================================================= */}
      {/* 02 — THE PODIUM: 3 HACKATHON PODIUMS (02) */}
      {/* ========================================================================= */}
      <VStack as="section" id="panel-2" className="livrea-panel livrea-panel-02">
        <VStack justify="between" height="100%" width="100%" className="livrea-panel-inner">
          <HStack justify="between" align="center" width="100%" className="livrea-telemetry-header">
            <HStack align="center" gap={2}>
              <Text as="span" className="livrea-red-indicator">{'\u00A0'}</Text>
              <Text weight="bold" color="secondary" size="sm" className="livrea-kicker">
                SECTOR 02 // COMPETITIVE PODIUM RECORD
              </Text>
            </HStack>
            <Text type="code" color="accent" size="sm" weight="bold">
              3/3 PODIUMS
            </Text>
          </HStack>

          <VStack gap={4} width="100%" className="livrea-podium-container">
            <VStack gap={1}>
              <Heading level={2} className="livrea-section-head">
                THE PODIUM
              </Heading>
              <Text type="large" color="secondary">
                3 competitions entered, 3 consecutive podiums in systems architecture, GIS engineering, and applied AI.
              </Text>
            </VStack>

            {/* 3 Detailed Podium Finish Cards */}
            <HStack justify="between" align="stretch" gap={4} width="100%" className="livrea-podium-cards">
              {/* P1 — Hack4Water 2026 */}
              <VStack gap={2} className="livrea-podium-card livrea-podium-p1">
                <HStack justify="between" align="center">
                  <Text className="livrea-podium-rank" color="accent">
                    P1
                  </Text>
                  <Text type="code" color="accent" weight="bold" size="sm">
                    1ST PLACE · 2026
                  </Text>
                </HStack>

                <Heading level={3} weight="bold" color="primary">
                  Hack4Water 2026
                </Heading>
                <Text type="large" color="accent" weight="bold">
                  Garda Chiese Alert
                </Text>

                <Text as="p" type="body" color="secondary">
                  Citizen incident reporting platform for a 76,645-hectare water basin across 33 municipalities, built in 72 hours.
                </Text>

                <VStack gap={1} className="livrea-card-specs">
                  <Text type="code" color="primary" size="sm">
                    SPECS: Django REST · PostGIS GIST · React · Gemini AI
                  </Text>
                  <Text type="supporting" color="secondary">
                    Sub-millisecond PostGIS polygon checks &amp; automated Gemini multimodal voice triage.
                  </Text>
                </VStack>

                <Link
                  href="https://github.com/cavallinilorenzo/alert-app-garda-chiese"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="accent"
                  weight="bold"
                >
                  GitHub Repository ↗
                </Link>
              </VStack>

              {/* P2 — SCIoTeM 2026 */}
              <VStack gap={2} className="livrea-podium-card">
                <HStack justify="between" align="center">
                  <Text className="livrea-podium-rank" color="primary">
                    P2
                  </Text>
                  <Text type="code" color="secondary" weight="bold" size="sm">
                    2ND PLACE · 2026
                  </Text>
                </HStack>

                <Heading level={3} weight="bold" color="primary">
                  SCIoTeM 2026
                </Heading>
                <Text type="large" color="primary" weight="bold">
                  Smart Beam
                </Text>

                <Text as="p" type="body" color="secondary">
                  Predictive maintenance engine for municipal streetlights, shifting repairs from reactive to scheduled proactive intervention.
                </Text>

                <VStack gap={1} className="livrea-card-specs">
                  <Text type="code" color="primary" size="sm">
                    SPECS: Python · scikit-learn · Cox Proportional Hazards · XGBoost
                  </Text>
                  <Text type="supporting" color="secondary">
                    Survival analysis computing failure hazard curves for luminaire fleets with automated technician dispatch.
                  </Text>
                </VStack>

                <Link
                  href="https://github.com/cavallinilorenzo/street-lighting-predictive-maintenance"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="accent"
                  weight="bold"
                >
                  GitHub Repository ↗
                </Link>
              </VStack>

              {/* P2 — SCIoTeM 2025 */}
              <VStack gap={2} className="livrea-podium-card">
                <HStack justify="between" align="center">
                  <Text className="livrea-podium-rank" color="primary">
                    P2
                  </Text>
                  <Text type="code" color="secondary" weight="bold" size="sm">
                    2ND PLACE · 2025
                  </Text>
                </HStack>

                <Heading level={3} weight="bold" color="primary">
                  SCIoTeM 2025
                </Heading>
                <Text type="large" color="primary" weight="bold">
                  P7M AI Summarizer
                </Text>

                <Text as="p" type="body" color="secondary">
                  Legal tech ingestion pipeline unwrapping cryptographically signed PKCS#7 envelopes and synthesizing legal digests.
                </Text>

                <VStack gap={1} className="livrea-card-specs">
                  <Text type="code" color="primary" size="sm">
                    SPECS: Python · PKCS#7 Cryptography · Google Gemini LLM
                  </Text>
                  <Text type="supporting" color="secondary">
                    Automated digital envelope verification, embedded content extraction, and structured Italian legal summary.
                  </Text>
                </VStack>

                <Link
                  href="https://github.com/itsmrma/hackathon-p7m-ai-summarizer"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="accent"
                  weight="bold"
                >
                  GitHub Repository ↗
                </Link>
              </VStack>
            </HStack>
          </VStack>

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip">
            <Text type="code" color="secondary" size="sm">
              TELEMETRY: 100% PODIUM CONVERSION (3/3)
            </Text>
            <Text type="code" color="secondary" size="sm">
              UNIMORE TEAM
            </Text>
          </HStack>
        </VStack>
      </VStack>

      {/* ========================================================================= */}
      {/* 03 — OXIDE: FLAGSHIP WORKTREE ORCHESTRATION WITH SCREENSHOT & LOGO (03) */}
      {/* ========================================================================= */}
      <VStack as="section" id="panel-3" className="livrea-panel livrea-panel-03">
        <VStack justify="between" height="100%" width="100%" className="livrea-panel-inner">
          <HStack justify="between" align="center" width="100%" className="livrea-telemetry-header">
            <HStack align="center" gap={2}>
              <Text as="span" className="livrea-red-indicator">{'\u00A0'}</Text>
              <Text weight="bold" color="secondary" size="sm" className="livrea-kicker">
                SECTOR 03 // MULTI-AGENT WORKTREE ARCHITECTURE
              </Text>
            </HStack>
            <HStack align="center" gap={2}>
              <Text type="code" color="accent" size="sm" weight="bold" className="livrea-in-progress-tag">
                ACTIVE DEVELOPMENT
              </Text>
              <Text type="code" color="accent" size="sm" weight="bold" className="livrea-in-progress-tag">
                PRE-RELEASE
              </Text>
            </HStack>
          </HStack>

          {/* Oxide Full-Panel Stage: allows window to float, move and resize over the entire layout including the text */}
          <DesktopStage className="livrea-oxide-full-stage" height="min(72svh, 590px)">
            <HStack justify="between" align="center" gap={6} width="100%" className="livrea-project-split-layout livrea-oxide-underlay">
              {/* Left Column: Details & Pillars (interactive underlay) */}
              <VStack gap={2} className="livrea-split-left-col">
                <VStack gap={1}>
                  {/* Oxide Logo + Massive Title */}
                  <HStack align="center" gap={3}>
                    <img
                      src="/oxide-icon.svg"
                      alt="Oxide Logo"
                      className="livrea-project-logo"
                    />
                    <Heading level={2} className="livrea-massive-title">
                      {oxideProj.title.toUpperCase()}
                    </Heading>
                  </HStack>

                  <HStack align="center" gap={2} paddingBlockStart={1} wrap="wrap">
                    <Text type="code" color="accent" weight="bold" className="livrea-in-progress-tag">
                      CO-FOUNDER
                    </Text>
                    <Text type="code" color="accent" weight="bold" className="livrea-in-progress-tag">
                      ACTIVE DEVELOPMENT
                    </Text>
                    <Text type="code" color="accent" weight="bold" className="livrea-in-progress-tag">
                      PRE-RELEASE
                    </Text>
                  </HStack>

                  <Text as="p" type="large" color="primary" className="livrea-project-lead">
                    {oxideProj.description}
                  </Text>
                  <Text type="code" color="accent" weight="bold" size="sm">
                    STACK: {oxideProj.stack} · Git Worktrees · Status: Active Development (Pre-Release)
                  </Text>
                </VStack>

                {/* 3 Architecture Pillars */}
                <VStack gap={1} width="100%" className="livrea-pillars-list">
                  <HStack align="start" gap={3} className="livrea-pillar-item">
                    <Text type="code" color="accent" weight="bold">
                      01.
                    </Text>
                    <VStack gap={0.5}>
                      <Text weight="bold" color="primary">
                        Isolated Git Worktrees Concurrency
                      </Text>
                      <Text type="body" color="secondary">
                        Spawns Claude Code, Codex, and Antigravity into independent worktrees so parallel turns never overwrite files.
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack align="start" gap={3} className="livrea-pillar-item">
                    <Text type="code" color="accent" weight="bold">
                      02.
                    </Text>
                    <VStack gap={0.5}>
                      <Text weight="bold" color="primary">
                        Pre-Merge Verification Gate
                      </Text>
                      <Text type="body" color="secondary">
                        Runs typechecking and test suites on every agent turn before reconciling into the primary branch.
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack align="start" gap={3} className="livrea-pillar-item">
                    <Text type="code" color="accent" weight="bold">
                      03.
                    </Text>
                    <VStack gap={0.5}>
                      <Text weight="bold" color="primary">
                        Rust &amp; Tauri 2 Native Performance
                      </Text>
                      <Text type="body" color="secondary">
                        Low-memory backend executing async subagent channels with native OS performance.
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>

                <HStack paddingBlockStart={1} gap={2} wrap="wrap">
                  <Button
                    label="Inspect on GitHub ↗"
                    variant="primary"
                    href={oxideProj.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="livrea-primary-action-btn"
                  />
                  {oxideProj.website && (
                    <Button
                      label="Website ↗"
                      variant="secondary"
                      href={oxideProj.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  )}
                </HStack>
              </VStack>

              {/* Right Column: Slot / Caption */}
              <VStack gap={2} className="livrea-split-right-col livrea-stage-right-slot">
                <HStack justify="between" align="center" width="100%" className="livrea-stage-caption">
                  <Text type="supporting" color="secondary" size="sm">
                    Live demo of the real Oxide UI · sample data
                  </Text>
                  <Text type="code" color="accent" size="sm">
                    TAURI 2
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            {/* Real Oxide Interactive Live Demo: starts on the right, but free to move and resize over the text! */}
            <DesktopWindow
              title="Oxide"
              tag="TAURI 2"
              initialPlacement="right"
              onReset={() => oxidePreviewRef.current?.reset()}
            >
              <AppPreview
                ref={oxidePreviewRef}
                src="/demos/oxide/index.html"
                poster="/oxide-thread.png"
                title="Oxide Live Demo"
                logicalMinW={1140}
                logicalMinH={720}
              />
            </DesktopWindow>
          </DesktopStage>

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip">
            <Text type="code" color="secondary" size="sm">
              ENGINEERING: SYSTEMS PROGRAMMING &amp; AGENT ORCHESTRATION
            </Text>
            <Text type="code" color="secondary" size="sm">
              2026 · ONGOING
            </Text>
          </HStack>
        </VStack>
      </VStack>

      {/* ========================================================================= */}
      {/* 04 — SYNCFORGE: AUDIO/SUBTITLE DSP WITH LOGO & PREVIEW (04) */}
      {/* ========================================================================= */}
      <VStack as="section" id="panel-4" className="livrea-panel livrea-panel-04">
        <VStack justify="between" height="100%" width="100%" className="livrea-panel-inner">
          <HStack justify="between" align="center" width="100%" className="livrea-telemetry-header">
            <HStack align="center" gap={2}>
              <Text as="span" className="livrea-red-indicator">{'\u00A0'}</Text>
              <Text weight="bold" color="secondary" size="sm" className="livrea-kicker">
                SECTOR 04 // DIGITAL SIGNAL PROCESSING &amp; MCP
              </Text>
            </HStack>
            <Text type="code" color="accent" size="sm" weight="bold">
              RUST FFT + TAURI 2
            </Text>
          </HStack>

          {/* Two-Column Layout: Technical Specs on Left, Interactive App on Right */}
          <HStack justify="between" align="center" gap={6} width="100%" className="livrea-project-split-layout">
            {/* Left Column: Details & Pillars */}
            <VStack gap={2} className="livrea-split-left-col">
              <VStack gap={1}>
                {/* SyncForge Logo + Massive Title */}
                <HStack align="center" gap={3}>
                  <img
                    src="/syncforge-icon.svg"
                    alt="SyncForge Logo"
                    className="livrea-project-logo"
                  />
                  <Heading level={2} className="livrea-massive-title">
                    {syncforgeProj.title.toUpperCase()}
                  </Heading>
                </HStack>

                <HStack align="center" gap={2} paddingBlockStart={1}>
                  <Text type="code" color="accent" weight="bold" className="livrea-in-progress-tag">
                    DSP ENGINE · TAURI 2 + CLI + MCP
                  </Text>
                </HStack>

                <Text as="p" type="large" color="primary" className="livrea-project-lead">
                  {syncforgeProj.description}
                </Text>
                <Text type="code" color="accent" weight="bold" size="sm">
                  STACK: {syncforgeProj.stack} · MCP Server
                </Text>
              </VStack>

              {/* 3 Architecture Pillars */}
              <VStack gap={1} width="100%" className="livrea-pillars-list">
                <HStack align="start" gap={3} className="livrea-pillar-item">
                  <Text type="code" color="accent" weight="bold">
                    01.
                  </Text>
                  <VStack gap={0.5}>
                    <Text weight="bold" color="primary">
                      FFT Waveform Cross-Correlation
                    </Text>
                    <Text type="body" color="secondary">
                      Computes sub-millisecond audio stream offsets natively in Rust without external audio dependencies.
                    </Text>
                  </VStack>
                </HStack>

                <HStack align="start" gap={3} className="livrea-pillar-item">
                  <Text type="code" color="accent" weight="bold">
                    02.
                  </Text>
                  <VStack gap={0.5}>
                    <Text weight="bold" color="primary">
                      Lossless MKV Stream Pipeline
                    </Text>
                    <Text type="body" color="secondary">
                      Extracts and shifts subtitle/audio tracks without any lossy video re-encoding or generational degradation.
                    </Text>
                  </VStack>
                </HStack>

                <HStack align="start" gap={3} className="livrea-pillar-item">
                  <Text type="code" color="accent" weight="bold">
                    03.
                  </Text>
                  <VStack gap={0.5}>
                    <Text weight="bold" color="primary">
                      Model Context Protocol (MCP) Server
                    </Text>
                    <Text type="body" color="secondary">
                      Ships with an embedded MCP server exposing 20 autonomous media tools to Claude Code and Cursor.
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              <HStack paddingBlockStart={1}>
                <Button
                  label="Inspect SyncForge on GitHub ↗"
                  variant="primary"
                  href={syncforgeProj.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="livrea-primary-action-btn"
                />
              </HStack>
            </VStack>

            {/* Right Column: Framed Real Desktop App Animated Preview */}
            <VStack gap={2} width="100%" className="livrea-split-right-col">
              <VStack width="100%" className="livrea-mockup-frame">
                {/* Desktop Window Title Bar */}
                <HStack
                  justify="between"
                  align="center"
                  width="100%"
                  className="livrea-mockup-titlebar"
                >
                  <HStack align="center" gap={3}>
                    <HStack align="center" gap={1.5} className="livrea-win-controls">
                      <span className="livrea-win-dot dot-reset" aria-hidden="true" />
                      <span className="livrea-win-dot dot-compact" aria-hidden="true" />
                      <span className="livrea-win-dot dot-fill" aria-hidden="true" />
                    </HStack>
                    <Text type="code" size="sm" className="livrea-win-title-text">
                      SyncForge // Batch Processing &amp; Waveform Analysis
                    </Text>
                  </HStack>

                  <Text type="code" size="xsm" className="livrea-win-tag-badge">
                    RUST FFT
                  </Text>
                </HStack>

                {/* Real Preview */}
                <AspectRatio ratio={16 / 9} fit="cover">
                  <img
                    src="/syncforge-preview.gif"
                    alt="SyncForge desktop preview and waveform analysis"
                    className="livrea-app-screenshot"
                  />
                </AspectRatio>
              </VStack>

              <HStack justify="between" align="center" width="100%" className="livrea-stage-caption">
                <Text type="supporting" color="secondary" size="sm">
                  Official SyncForge application interface: batch tracks alignment &amp; metadata editing
                </Text>
                <Text type="code" color="accent" size="sm">
                  FFMPEG + RUST
                </Text>
              </HStack>
            </VStack>
          </HStack>

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip">
            <Text type="code" color="secondary" size="sm">
              DSP PIPELINE: FREQUENCY-DOMAIN CROSS-CORRELATION
            </Text>
            <Text type="code" color="secondary" size="sm">
              2026 · RUST / TAURI 2
            </Text>
          </HStack>
        </VStack>
      </VStack>

      {/* ========================================================================= */}
      {/* 05 — SCROBBL.RS: SELF-HOSTED LISTENING ARCHIVE & DAEMON (05) */}
      {/* ========================================================================= */}
      <VStack as="section" id="panel-5" className="livrea-panel livrea-panel-05">
        <VStack justify="between" height="100%" width="100%" className="livrea-panel-inner">
          <HStack justify="between" align="center" width="100%" className="livrea-telemetry-header">
            <HStack align="center" gap={2}>
              <Text as="span" className="livrea-red-indicator">{'\u00A0'}</Text>
              <Text weight="bold" color="secondary" size="sm" className="livrea-kicker">
                SECTOR 05 // SELF-HOSTED ARCHIVE &amp; SYSTEMS DAEMON
              </Text>
            </HStack>
            <HStack align="center" gap={2}>
              <Text type="code" color="accent" size="sm" weight="bold" className="livrea-in-progress-tag">
                ACTIVE DEVELOPMENT
              </Text>
              <Text type="code" color="accent" size="sm" weight="bold" className="livrea-in-progress-tag">
                PRE-RELEASE
              </Text>
            </HStack>
          </HStack>

          {/* Two-Column Layout: Technical Specs on Left, Interactive App on Right */}
          <HStack justify="between" align="center" gap={6} width="100%" className="livrea-project-split-layout">
            {/* Left Column: Details & Pillars */}
            <VStack gap={2} className="livrea-split-left-col">
              <VStack gap={1}>
                {/* scrobbl Logo + Massive Title */}
                <HStack align="center" gap={3}>
                  <img
                    src="/scrobbl-icon.svg"
                    alt="scrobbl.rs Logo"
                    className="livrea-project-logo"
                  />
                  <Heading level={2} className="livrea-massive-title">
                    SCROBBL.RS
                  </Heading>
                </HStack>

                <HStack align="center" gap={2} paddingBlockStart={1} wrap="wrap">
                  <Text type="code" color="accent" weight="bold" className="livrea-in-progress-tag">
                    CREATOR
                  </Text>
                  <Text type="code" color="accent" weight="bold" className="livrea-in-progress-tag">
                    ACTIVE DEVELOPMENT
                  </Text>
                  <Text type="code" color="accent" weight="bold" className="livrea-in-progress-tag">
                    PRE-RELEASE
                  </Text>
                </HStack>

                <Text as="p" type="large" color="primary" className="livrea-project-lead">
                  {scrobblProj.description}
                </Text>
                <Text type="code" color="accent" weight="bold" size="sm">
                  STACK: {scrobblProj.stack} · Spotify Web API · Status: Active Development (Pre-Release)
                </Text>
              </VStack>

              {/* 3 Architecture Pillars */}
              <VStack gap={1} width="100%" className="livrea-pillars-list">
                <HStack align="start" gap={3} className="livrea-pillar-item">
                  <Text type="code" color="accent" weight="bold">
                    01.
                  </Text>
                  <VStack gap={0.5}>
                    <Text weight="bold" color="primary">
                      Background Collection &amp; Ingestion
                    </Text>
                    <Text type="body" color="secondary">
                      Adaptive Spotify polling with duplicate reconciliation and multi-year JSON archive ingestion.
                    </Text>
                  </VStack>
                </HStack>

                <HStack align="start" gap={3} className="livrea-pillar-item">
                  <Text type="code" color="accent" weight="bold">
                    02.
                  </Text>
                  <VStack gap={0.5}>
                    <Text weight="bold" color="primary">
                      Dual SQLite Architecture &amp; WAL Mode
                    </Text>
                    <Text type="body" color="secondary">
                      Isolates listening analytics (archive.db) from auth tokens (auth.db), querying 50,000+ tracks in &lt; 5ms.
                    </Text>
                  </VStack>
                </HStack>

                <HStack align="start" gap={3} className="livrea-pillar-item">
                  <Text type="code" color="accent" weight="bold">
                    03.
                  </Text>
                  <VStack gap={0.5}>
                    <Text weight="bold" color="primary">
                      Single-Binary Embedded Distribution
                    </Text>
                    <Text type="body" color="secondary">
                      Compiles React and TypeScript assets directly into the standalone Rust binary with bundled SQLite.
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              <HStack paddingBlockStart={1}>
                <Button
                  label="Inspect scrobbl.rs on GitHub ↗"
                  variant="primary"
                  href={scrobblProj.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="livrea-primary-action-btn"
                />
              </HStack>
            </VStack>

            {/* Right Column: Framed Real Desktop App Tour GIF */}
            <VStack gap={2} width="100%" className="livrea-split-right-col">
              <VStack width="100%" className="livrea-mockup-frame">
                {/* Desktop Window Title Bar */}
                <HStack
                  justify="between"
                  align="center"
                  width="100%"
                  className="livrea-mockup-titlebar"
                >
                  <HStack align="center" gap={3}>
                    <HStack align="center" gap={1.5} className="livrea-win-controls">
                      <span className="livrea-win-dot dot-reset" aria-hidden="true" />
                      <span className="livrea-win-dot dot-compact" aria-hidden="true" />
                      <span className="livrea-win-dot dot-fill" aria-hidden="true" />
                    </HStack>
                    <Text type="code" size="sm" className="livrea-win-title-text">
                      scrobbl.rs // Dashboard: Listening Archive &amp; Charts
                    </Text>
                  </HStack>

                  <Text type="code" size="xsm" className="livrea-win-tag-badge">
                    RUST + SQLITE
                  </Text>
                </HStack>

                {/* Real Tour Preview */}
                <AspectRatio ratio={16 / 9} fit="cover">
                  <img
                    src="/scrobbl-preview.gif"
                    alt="scrobbl.rs dashboard showing real-time listening history, statistics charts, and personal rankings"
                    className="livrea-app-screenshot"
                  />
                </AspectRatio>
              </VStack>

              <HStack justify="between" align="center" width="100%" className="livrea-stage-caption">
                <Text type="supporting" color="secondary" size="sm">
                  Official scrobbl.rs interface: listening dashboard, history query engine &amp; rankings
                </Text>
                <Text type="code" color="accent" size="sm">
                  GPL-3.0
                </Text>
              </HStack>
            </VStack>
          </HStack>

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip">
            <Text type="code" color="secondary" size="sm">
              SYSTEMS: ASYNC RUST DAEMON + EMBEDDED SQLITE WAL
            </Text>
            <Text type="code" color="secondary" size="sm">
              2026 · ACTIVE
            </Text>
          </HStack>
        </VStack>
      </VStack>

      {/* ========================================================================= */}
      {/* 06 — EMBEDDED & GIS ARCHITECTURES (06) */}
      {/* ========================================================================= */}
      <VStack as="section" id="panel-6" className="livrea-panel livrea-panel-06">
        <VStack justify="between" height="100%" width="100%" className="livrea-panel-inner">
          <HStack justify="between" align="center" width="100%" className="livrea-telemetry-header">
            <HStack align="center" gap={2}>
              <Text as="span" className="livrea-red-indicator">{'\u00A0'}</Text>
              <Text weight="bold" color="secondary" size="sm" className="livrea-kicker">
                SECTOR 06 // LOW-LEVEL EMBEDDED &amp; DISTRIBUTED GIS
              </Text>
            </HStack>
            <Text type="code" color="accent" size="sm" weight="bold">
              C + POSTGIS
            </Text>
          </HStack>

          <VStack gap={4} width="100%" className="livrea-detail-block">
            <VStack gap={1}>
              <Heading level={2} className="livrea-section-head">
                EMBEDDED HARDWARE &amp; SPATIAL PLATFORMS
              </Heading>
              <Text type="large" color="secondary">
                From microcontrollers running bare-metal C in under 16 KB SRAM, to regional GIS backends processing thousands of spatial polygons.
              </Text>
            </VStack>

            {/* Two Deep Architecture Columns */}
            <HStack justify="between" align="stretch" gap={4} width="100%" className="livrea-split-engineering">
              {/* Left Column: Garda Chiese Alert with Logo */}
              <VStack gap={3} className="livrea-system-split-box">
                <HStack justify="between" align="center">
                  <HStack align="center" gap={2}>
                    <img
                      src="/garda-chiese-logo.png"
                      alt="Garda Chiese Logo"
                      className="livrea-garda-logo"
                    />
                    <Text type="code" color="accent" weight="bold">
                      SPATIAL PLATFORM
                    </Text>
                  </HStack>
                  <Text type="code" color="accent" size="sm">
                    1ST PLACE HACK4WATER
                  </Text>
                </HStack>

                <Heading level={3} weight="bold" color="primary">
                  {gardaProj.title}
                </Heading>
                <Text as="p" type="body" color="secondary">
                  {gardaProj.description}
                </Text>

                <VStack gap={1} className="livrea-card-specs">
                  <Text type="code" color="primary" size="sm">
                    ARCHITECTURE: PostGIS GIST Spatial Indices + Gemini
                  </Text>
                  <Text type="supporting" color="secondary">
                    Sub-millisecond containment verification over 76,645 hectares across 33 municipal canal boundaries without user registration friction.
                  </Text>
                  <Text type="code" color="secondary" size="sm">
                    STACK: {gardaProj.stack}
                  </Text>
                </VStack>

                <Button
                  label="View Basin Platform Repo ↗"
                  variant="secondary"
                  href={gardaProj.href}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              </VStack>

              {/* Right Column: STM32 Smart Garden */}
              <VStack gap={3} className="livrea-system-split-box">
                <HStack justify="between" align="center">
                  <Text type="code" color="accent" weight="bold">
                    SYSTEM B // BARE-METAL FIRMWARE
                  </Text>
                  <Text type="code" color="secondary" size="sm">
                    ARM CORTEX-M4
                  </Text>
                </HStack>

                <Heading level={3} weight="bold" color="primary">
                  {stm32Proj.title}
                </Heading>
                <Text as="p" type="body" color="secondary">
                  {stm32Proj.description}
                </Text>

                <VStack gap={1} className="livrea-card-specs">
                  <Text type="code" color="primary" size="sm">
                    ARCHITECTURE: Zero OS Bare-Metal C Under 16 KB SRAM
                  </Text>
                  <Text type="supporting" color="secondary">
                    Direct register manipulation on ARM Cortex-M4, non-blocking state machine, Wi-Fi TCP/IP socket polling rain forecasts before valve duty cycles.
                  </Text>
                  <Text type="code" color="secondary" size="sm">
                    STACK: {stm32Proj.stack}
                  </Text>
                </VStack>

                <Button
                  label="View Firmware Code ↗"
                  variant="secondary"
                  href={stm32Proj.href}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              </VStack>
            </HStack>
          </VStack>

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip">
            <Text type="code" color="secondary" size="sm">
              ENGINEERING DISCIPLINES: C FIRMWARE + POSTGRESQL/POSTGIS
            </Text>
            <Text type="code" color="secondary" size="sm">
              2026 ARCHITECTURES
            </Text>
          </HStack>
        </VStack>
      </VStack>

      {/* ========================================================================= */}
      {/* 07 — AUXILIARY MACHINERY & LAB (07) */}
      {/* ========================================================================= */}
      <VStack as="section" id="panel-7" className="livrea-panel livrea-panel-07">
        <VStack justify="between" height="100%" width="100%" className="livrea-panel-inner">
          <HStack justify="between" align="center" width="100%" className="livrea-telemetry-header">
            <HStack align="center" gap={2}>
              <Text as="span" className="livrea-red-indicator">{'\u00A0'}</Text>
              <Text weight="bold" color="secondary" size="sm" className="livrea-kicker">
                SECTOR 07 // AUXILIARY MACHINERY &amp; HOME LAB
              </Text>
            </HStack>
            <Text type="code" color="accent" size="sm" weight="bold">
              SYSTEMS &amp; INFRASTRUCTURE
            </Text>
          </HStack>

          <VStack gap={3} width="100%" className="livrea-detail-block">
            <VStack gap={1}>
              <Heading level={2} className="livrea-section-head">
                MORE MACHINERY
              </Heading>
              <Text type="large" color="secondary">
                Specialized tools, systems daemons, infrastructure experiments, and home lab systems.
              </Text>
            </VStack>

            {/* Symmetrical 2-Column Precision Grid with Equal-Height Rows */}
            <VStack width="100%" className="livrea-machinery-grid">
              {/* Row 1, Col 1: AMD Fan Control */}
              <VStack gap={2} className="livrea-machinery-card">
                <HStack justify="between" align="center">
                  <Heading level={3} weight="bold" color="primary">
                    AMD Fan Control
                  </Heading>
                  <Text type="code" color="secondary" size="sm">
                    RUST FFI
                  </Text>
                </HStack>
                <Text type="body" color="secondary">
                  Low-level GPU fan curve utility built with Rust FFI binding to Linux sysfs hardware sensor monitors.
                </Text>
                <Link href="https://github.com/itsmrma/amd-fan-control" target="_blank" rel="noopener noreferrer" color="accent" size="sm" weight="bold">
                  GitHub Repository ↗
                </Link>
              </VStack>

              {/* Row 1, Col 2: TrueNAS Home Lab */}
              <VStack gap={2} className="livrea-machinery-card">
                <HStack justify="between" align="center">
                  <Heading level={3} weight="bold" color="primary">
                    TrueNAS Home Lab
                  </Heading>
                  <Text type="code" color="secondary" size="sm">
                    ZFS / LINUX
                  </Text>
                </HStack>
                <Text type="body" color="secondary">
                  Dedicated home lab with ZFS RAIDZ storage pools, automated snapshot replication, Docker microservices, and network monitoring.
                </Text>
                <Text type="code" color="secondary" size="sm">
                  PRIVATE ON-PREM INFRASTRUCTURE
                </Text>
              </VStack>

              {/* Row 2, Col 1: Viessmann Dashboard */}
              <VStack gap={2} className="livrea-machinery-card">
                <HStack justify="between" align="center">
                  <Heading level={3} weight="bold" color="primary">
                    Viessmann Dashboard
                  </Heading>
                  <Text type="code" color="secondary" size="sm">
                    HOME ASSISTANT
                  </Text>
                </HStack>
                <Text type="body" color="secondary">
                  Custom Home Assistant telemetry integration for monitoring heat pump COP modulation and energy efficiency curves.
                </Text>
                <Link href="https://github.com/itsmrma/viesmann-dashboard-hass" target="_blank" rel="noopener noreferrer" color="accent" size="sm" weight="bold">
                  GitHub Repository ↗
                </Link>
              </VStack>

              {/* Row 2, Col 2: UNIMORE Music Library */}
              <VStack gap={2} className="livrea-machinery-card">
                <HStack justify="between" align="center">
                  <Heading level={3} weight="bold" color="primary">
                    UNIMORE Music Library
                  </Heading>
                  <Text type="code" color="accent" size="sm">
                    PYTHON / UV
                  </Text>
                </HStack>
                <Text type="body" color="secondary">
                  Academic music archive catalog service built with Python, Django, uv dependency management, and MusicBrainz API integration.
                </Text>
                <Link href="https://github.com/itsmrma/uni-musiclib-project" target="_blank" rel="noopener noreferrer" color="accent" size="sm" weight="bold">
                  GitHub Repository ↗
                </Link>
              </VStack>

              {/* Row 3, Col 1: Music History Analyzer */}
              <VStack gap={2} className="livrea-machinery-card">
                <HStack justify="between" align="center">
                  <Heading level={3} weight="bold" color="primary">
                    Music History Analyzer
                  </Heading>
                  <Text type="code" color="accent" size="sm">
                    LIVE APP
                  </Text>
                </HStack>
                <Text type="body" color="secondary">
                  Interactive streaming history explorer importing multiple years of Spotify account JSON archives.
                </Text>
                <HStack gap={3} wrap="wrap">
                  <Link href="https://spotify-history-analyzer.benassimatteo.dev" target="_blank" rel="noopener noreferrer" color="accent" size="sm" weight="bold">
                    Live Web Application ↗
                  </Link>
                  <Link href="https://github.com/itsmrma/spotify-history-analyzer" target="_blank" rel="noopener noreferrer" color="secondary" size="sm">
                    GitHub Repo ↗
                  </Link>
                </HStack>
              </VStack>

              {/* Row 3, Col 2: Language Credentials */}
              <VStack gap={2} className="livrea-machinery-card">
                <HStack justify="between" align="center">
                  <Heading level={3} weight="bold" color="primary">
                    Cambridge B2 First
                  </Heading>
                  <Text type="code" color="accent" size="sm">
                    PROFICIENCY
                  </Text>
                </HStack>
                <Text type="body" color="secondary">
                  Professional working English proficiency · Native Italian speaker.
                </Text>
                <Text type="code" color="secondary" size="sm">
                  Technical documentation &amp; international team communication.
                </Text>
              </VStack>
            </VStack>
          </VStack>

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip">
            <Text type="code" color="secondary" size="sm">
              SYSTEMS: RUST, C, PYTHON, POSTGIS, LINUX, ZFS, DOCKER
            </Text>
            <Text type="code" color="secondary" size="sm">
              ALL SOURCE ON GITHUB
            </Text>
          </HStack>
        </VStack>
      </VStack>

      {/* ========================================================================= */}
      {/* 08 — STARTING GRID: THE TRAJECTORY (08) */}
      {/* ========================================================================= */}
      <VStack as="section" id="panel-8" className="livrea-panel livrea-panel-08">
        <VStack justify="between" height="100%" width="100%" className="livrea-panel-inner">
          <HStack justify="between" align="center" width="100%" className="livrea-telemetry-header">
            <HStack align="center" gap={2}>
              <Text as="span" className="livrea-red-indicator">{'\u00A0'}</Text>
              <Text weight="bold" color="secondary" size="sm" className="livrea-kicker">
                SECTOR 08 // ACADEMIC &amp; SYSTEMS TRAJECTORY
              </Text>
            </HStack>
            <Text type="code" color="accent" size="sm" weight="bold">
              2019 → 2027
            </Text>
          </HStack>

          <VStack gap={4} width="100%" className="livrea-detail-block">
            <VStack gap={1}>
              <Heading level={2} className="livrea-section-head">
                STARTING GRID
              </Heading>
              <Text type="large" color="secondary">
                Rigorous computer science foundations, enterprise infrastructure experience, and ongoing engineering honours.
              </Text>
            </VStack>

            {/* 4 Starting Grid Rows */}
            <VStack gap={3} width="100%" className="livrea-grid-rows">
              {/* P01 */}
              <HStack align="center" gap={4} className="livrea-grid-row">
                <Text className="livrea-grid-pos" color="accent">
                  P01
                </Text>
                <Stack width={140}>
                  <Text type="code" color="primary" weight="bold">
                    2024 – PRESENT
                  </Text>
                </Stack>
                <VStack gap={0.5} width="100%">
                  <Heading level={3} weight="bold" color="primary">
                    B.Sc. Computer Engineering — UNIMORE (Mantova Campus)
                  </Heading>
                  <Text type="body" color="secondary">
                    Weighted academic average: <Text color="accent" weight="bold">27.3 / 30</Text> · 125 / 180 ECTS completed · Expected graduation: 2027.
                  </Text>
                </VStack>
              </HStack>

              {/* P02 */}
              <HStack align="center" gap={4} className="livrea-grid-row">
                <Text className="livrea-grid-pos" color="primary">
                  P02
                </Text>
                <Stack width={140}>
                  <Text type="code" color="primary" weight="bold">
                    2023
                  </Text>
                </Stack>
                <VStack gap={0.5} width="100%">
                  <Heading level={3} weight="bold" color="primary">
                    IT Systems Internship — Novellini S.p.A.
                  </Heading>
                  <Text type="body" color="secondary">
                    Corporate enterprise network infrastructure diagnostics, hardware maintenance, and workstation support.
                  </Text>
                </VStack>
              </HStack>

              {/* P03 */}
              <HStack align="center" gap={4} className="livrea-grid-row">
                <Text className="livrea-grid-pos" color="primary">
                  P03
                </Text>
                <Stack width={140}>
                  <Text type="code" color="primary" weight="bold">
                    2019 – 2024
                  </Text>
                </Stack>
                <VStack gap={0.5} width="100%">
                  <Heading level={3} weight="bold" color="primary">
                    Diploma in Computer Science — ITIS "E. Fermi" Mantova
                  </Heading>
                  <Text type="body" color="secondary">
                    Graduated with top marks: <Text color="primary" weight="bold">100 / 100</Text>. Foundational C programming, network protocols, algorithms.
                  </Text>
                </VStack>
              </HStack>

              {/* P04 */}
              <HStack align="center" gap={4} className="livrea-grid-row">
                <Text className="livrea-grid-pos" color="secondary">
                  P04
                </Text>
                <Stack width={140}>
                  <Text type="code" color="primary" weight="bold">
                    CERTIFICATIONS
                  </Text>
                </Stack>
                <VStack gap={0.5} width="100%">
                  <Heading level={3} weight="bold" color="primary">
                    Cambridge B2 First &amp; Language Competencies
                  </Heading>
                  <Text type="body" color="secondary">
                    Professional working proficiency in English · Native Italian speaker.
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </VStack>

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip">
            <Text type="code" color="secondary" size="sm">
              ACADEMIC VERIFICATION: UNIMORE MANTOVA CAMPUS
            </Text>
            <Text type="code" color="secondary" size="sm">
              MANTOVA, ITALY
            </Text>
          </HStack>
        </VStack>
      </VStack>

      {/* ========================================================================= */}
      {/* 09 — REDESIGNED CONTACT & PIT WALL SECTION (09) */}
      {/* ========================================================================= */}
      <VStack as="section" id="panel-9" className="livrea-panel livrea-panel-09">
        <VStack justify="between" height="100%" width="100%" className="livrea-panel-inner">
          <HStack justify="between" align="center" width="100%" className="livrea-telemetry-header">
            <HStack align="center" gap={2}>
              <Text as="span" className="livrea-red-indicator">{'\u00A0'}</Text>
              <Text weight="bold" color="secondary" size="sm" className="livrea-kicker">
                SECTOR 09 // PIT WALL &amp; CONTACT TRANSMISSION
              </Text>
            </HStack>
            <Text type="code" color="accent" size="sm" weight="bold">
              OPEN TO CONNECT
            </Text>
          </HStack>

          <VStack gap={4} width="100%" className="livrea-contact-center">
            <VStack gap={1}>
              <Heading level={2} className="livrea-massive-title">
                LET'S BUILD TOGETHER.
              </Heading>
              <HStack align="center" gap={2} paddingBlockStart={1}>
                <Text type="code" color="accent" weight="bold" className="livrea-in-progress-tag">
                  {IDENTITY.availability.toUpperCase()}
                </Text>
              </HStack>
            </VStack>

            <Text as="p" type="large" color="primary" className="livrea-contact-lead">
              I build fast, reliable software across the full systems stack — from multi-agent desktop apps and distributed services to bare-metal C on ARM Cortex-M4. If you're engineering high-throughput software, telemetry pipelines, or systems infrastructure, I'd love to connect.
            </Text>

            {/* 4 High-Contrast Structured Contact Cards */}
            <HStack justify="between" align="stretch" gap={3} width="100%" className="livrea-contact-cards-grid">
              {/* Card 1: Direct Email */}
              <VStack gap={2} className="livrea-contact-card is-primary-action">
                <Text type="code" color="accent" size="sm">
                  CHANNEL 01 // EMAIL
                </Text>
                <Heading level={4} weight="bold" color="primary">
                  Direct Inquiries
                </Heading>
                <Text type="body" color="secondary">
                  Fastest response channel for project discussions, internships, and technical questions.
                </Text>
                <Button
                  label={isCopied ? 'EMAIL COPIED ✓' : `COPY: ${CONTACTS.email}`}
                  variant="primary"
                  onClick={handleCopy}
                  className="livrea-primary-action-btn"
                />
              </VStack>

              {/* Card 2: GitHub Profile */}
              <VStack gap={2} className="livrea-contact-card">
                <Text type="code" color="secondary" size="sm">
                  CHANNEL 02 // CODE
                </Text>
                <Heading level={4} weight="bold" color="primary">
                  GitHub Profile
                </Heading>
                <Text type="body" color="secondary">
                  Open source contributions, Oxide work, repositories, commits, and telemetry experiments.
                </Text>
                <Button
                  label="Visit @itsmrma on GitHub ↗"
                  variant="secondary"
                  href={CONTACTS.github}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              </VStack>

              {/* Card 3: Curriculum Vitae */}
              <VStack gap={2} className="livrea-contact-card">
                <Text type="code" color="secondary" size="sm">
                  CHANNEL 03 // RESUME
                </Text>
                <Heading level={4} weight="bold" color="primary">
                  Download CV
                </Heading>
                <Text type="body" color="secondary">
                  Complete academic trajectory, hackathon credentials, technical skills, and experience.
                </Text>
                <HStack gap={2}>
                  <Button
                    label="CV (English PDF) ↗"
                    variant="secondary"
                    href={CONTACTS.cvEn}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                  <Button
                    label="CV (Italian PDF) ↗"
                    variant="secondary"
                    href={CONTACTS.cvIt}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                </HStack>
              </VStack>

              {/* Card 4: LinkedIn & Network */}
              <VStack gap={2} className="livrea-contact-card">
                <Text type="code" color="secondary" size="sm">
                  CHANNEL 04 // NETWORK
                </Text>
                <Heading level={4} weight="bold" color="primary">
                  LinkedIn Profile
                </Heading>
                <Text type="body" color="secondary">
                  Based in Mantova (UNIMORE). Open to high-performance motorsport and systems software opportunities.
                </Text>
                <Button
                  label="Connect on LinkedIn ↗"
                  variant="secondary"
                  href={CONTACTS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              </VStack>
            </HStack>
          </VStack>

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip">
            <HStack align="center" gap={3} wrap="wrap">
              <Text type="code" color="secondary" size="sm">
                MATTEO BENASSI · COMPUTER ENGINEERING @ UNIMORE
              </Text>
              <Text color="secondary">·</Text>
              <Link href={CONTACTS.linkedin} target="_blank" rel="noopener noreferrer" color="accent">
                LinkedIn ↗
              </Link>
              <Text color="secondary">·</Text>
              <Link href={CONTACTS.github} target="_blank" rel="noopener noreferrer" color="secondary">
                GitHub ↗
              </Link>
            </HStack>
            <Text type="code" color="secondary" size="sm">
              MANTOVA, ITALY · 2026
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </Section>
  );
}
