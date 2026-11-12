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
  isMobileViewport,
  calculateScrollProgress,
  getActiveSectorFromDOM,
  SECTOR_WAYPOINTS,
  getHeroTelemetryMetrics,
  getAuxiliaryMachineryProjects,
  getMachineryGridConfig,
  getContactDeckActions,
} from '../utils/mobileAdaptation';
import { MobileWaypointHud } from './MobileWaypointHud';

interface LivreaPortfolioProps {
  onCopyEmail?: () => void;
  emailCopied?: boolean;
}

const PANELS = SECTOR_WAYPOINTS;

export function LivreaPortfolio({ onCopyEmail, emailCopied }: LivreaPortfolioProps) {
  const [activePanel, setActivePanel] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

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
  const heroMetrics = getHeroTelemetryMetrics();
  const machineryProjects = getAuxiliaryMachineryProjects();
  const machineryGridConfig = getMachineryGridConfig(typeof window !== 'undefined' ? isMobileViewport() : false);
  const contactDeckActions = getContactDeckActions(isCopied);
  const activePanelRef = useRef(activePanel);
  activePanelRef.current = activePanel;

  const scrollToPanel = (id: string) => {
    if (id === 'panel-1' && typeof window !== 'undefined') {
      const container = document.querySelector<HTMLElement>('.livrea-snap-container');
      const isMobile = isMobileViewport();
      if (isMobile) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } else if (container && container.scrollHeight > container.clientHeight) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let rafId: number | null = null;

    const updateMetrics = () => {
      const isMobile = isMobileViewport();
      const container = document.querySelector<HTMLElement>('.livrea-snap-container');

      let scrollTop = 0;
      let scrollHeight = 0;
      let clientHeight = 0;

      if (!isMobile && container && container.scrollHeight > container.clientHeight) {
        scrollTop = container.scrollTop;
        scrollHeight = container.scrollHeight;
        clientHeight = container.clientHeight;
      } else {
        scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
        scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
        clientHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      }

      const progress = calculateScrollProgress(scrollTop, scrollHeight, clientHeight);
      setScrollProgress(progress);

      const activeSectorNum = getActiveSectorFromDOM(clientHeight, {
        scrollTop,
        scrollHeight,
      });
      setActivePanel(activeSectorNum);
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        updateMetrics();
        rafId = null;
      });
    };

    const container = document.querySelector<HTMLElement>('.livrea-snap-container');

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Initial calculation
    updateMetrics();

    // Multi-threshold IntersectionObserver for active sector tracking across tall & short panels
    const observer = new IntersectionObserver(
      () => {
        updateMetrics();
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
      }
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

      const current = activePanelRef.current;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (current < PANELS.length) {
          e.preventDefault();
          scrollToPanel(`panel-${current + 1}`);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (current > 1) {
          e.preventDefault();
          scrollToPanel(`panel-${current - 1}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
    };
  }, []);

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

      {/* 2. Sticky Mobile Telemetry Waypoint HUD & Quick-Jump Navigation (Mobile) */}
      <MobileWaypointHud
        activeSector={activePanel}
        onScrollToSector={scrollToPanel}
        scrollProgress={scrollProgress}
      />

      {/* 3. Floating Quick-Jump Checkpoints on Right Margin (Desktop) */}
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
            <HStack align="center" gap={2} className="livrea-telemetry-left">
              <Text as="span" className="livrea-red-indicator">{'\u00A0'}</Text>
              <Text weight="bold" color="secondary" size="sm" className="livrea-kicker">
                BENASSIMATTEO.DEV // <Text as="span" className="livrea-text-cyan">MONOPOSTO SPEC 2026</Text>
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
              <Text type="code" weight="bold" className="livrea-text-cyan">
                COMPUTER ENGINEERING @ UNIMORE
              </Text>
              <Text color="secondary" className="livrea-role-separator">·</Text>
              <Text type="code" color="primary">
                SOFTWARE &amp; SYSTEMS ENGINEER
              </Text>
              <Text color="secondary" className="livrea-role-separator">·</Text>
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

            {/* Telemetry KPI Readout (3 Columns / Compact Mobile HUD Ribbon) */}
            <HStack justify="between" align="stretch" gap={3} width="100%" className="livrea-kpi-grid">
              {heroMetrics.map((kpi) => {
                const isPodium = kpi.id === 'kpi-podiums';
                const isAcademic = kpi.id === 'kpi-academics';
                const valClass = isPodium
                  ? 'livrea-kpi-val-podium'
                  : isAcademic
                    ? 'livrea-kpi-val-academic'
                    : 'livrea-kpi-val-status';
                return (
                  <VStack key={kpi.id} gap={1} className="livrea-kpi-box">
                    <Text type="code" color="secondary" size="sm" className="livrea-kpi-desktop">
                      {kpi.label}
                    </Text>
                    <Text type="code" color="secondary" size="sm" className="livrea-kpi-mobile livrea-kpi-mobile-label">
                      {kpi.shortLabel}
                    </Text>
                    <Heading
                      level={3}
                      color={isPodium ? 'accent' : 'primary'}
                      weight="bold"
                      className={`livrea-kpi-desktop ${isAcademic ? 'livrea-text-cyan' : ''}`}
                    >
                      {kpi.desktopValue || kpi.value}
                    </Heading>
                    <Text
                      color={isPodium ? 'accent' : 'primary'}
                      className={`livrea-kpi-mobile livrea-kpi-mobile-val ${valClass}`}
                    >
                      {kpi.value}
                    </Text>
                    {kpi.detail && (
                      <Text type="body" color="secondary" className="livrea-kpi-desktop">
                        {kpi.detail}
                      </Text>
                    )}
                  </VStack>
                );
              })}
            </HStack>
          </VStack>

          {/* Bottom Bar */}
          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip livrea-hero-strip">
            <HStack align="center" gap={2} wrap="wrap" className="livrea-hero-links">
              <Link href={`mailto:${CONTACTS.email}`} onClick={handleCopy} color="primary" weight="bold" className="livrea-email-link">
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
            <HStack align="center" gap={2} className="livrea-scroll-hint-wrap">
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
            <HStack align="center" gap={2} className="livrea-telemetry-left">
              <Text as="span" className="livrea-red-indicator">{'\u00A0'}</Text>
              <Text weight="bold" color="secondary" size="sm" className="livrea-kicker">
                SECTOR 02 // COMPETITIVE PODIUM RECORD
              </Text>
            </HStack>
            <Text type="code" className="livrea-telemetry-badge" size="sm">
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

              {/* P2 — SCIoTeM 2026 (Compact Summary on Mobile) */}
              <VStack gap={2} className="livrea-podium-card livrea-podium-summary">
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

                {/* Desktop narrative & specs */}
                <VStack gap={2} className="livrea-podium-full-details">
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
                </VStack>

                {/* Mobile streamlined summary line */}
                <VStack gap={1} className="livrea-podium-mobile-summary">
                  <Text type="code" color="secondary" size="sm">
                    SPECS: Python · Cox Hazards · XGBoost
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

              {/* P2 (Finisher 3) — SCIoTeM 2025 (Compact Summary on Mobile) */}
              <VStack gap={2} className="livrea-podium-card livrea-podium-summary">
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

                {/* Desktop narrative & specs */}
                <VStack gap={2} className="livrea-podium-full-details">
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
                </VStack>

                {/* Mobile streamlined summary line */}
                <VStack gap={1} className="livrea-podium-mobile-summary">
                  <Text type="code" color="secondary" size="sm">
                    SPECS: Python · PKCS#7 · Gemini LLM
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

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip livrea-intermediate-strip">
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
            <HStack align="center" gap={2} className="livrea-telemetry-left">
              <Text as="span" className="livrea-red-indicator">{'\u00A0'}</Text>
              <Text weight="bold" color="secondary" size="sm" className="livrea-kicker">
                SECTOR 03 // MULTI-AGENT WORKTREE ARCHITECTURE
              </Text>
            </HStack>
            <Text type="code" className="livrea-telemetry-badge" size="sm">
              TAURI 2 · RUST
            </Text>
          </HStack>

          {/* Two-Column Layout: Technical Specs on Left, Framed App Tour on Right */}
          <HStack justify="between" align="center" gap={6} width="100%" className="livrea-project-split-layout">
            {/* Left Column: Details & Pillars */}
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
                  <Text type="code" className="livrea-role-badge">
                    CO-FOUNDER
                  </Text>
                  <Text type="code" color="secondary" size="sm">
                    Pre-Release · Active Development
                  </Text>
                </HStack>

                <Text as="p" type="large" color="primary" className="livrea-project-lead">
                  {oxideProj.description}
                </Text>
                <Text type="code" color="secondary" size="sm">
                  STACK: <Text as="span" color="primary">{oxideProj.stack} · Git Worktrees</Text>
                </Text>
              </VStack>

              {/* 3 Architecture Pillars */}
              <VStack gap={1} width="100%" className="livrea-pillars-list">
                <HStack align="start" gap={3} className="livrea-pillar-item">
                  <Text type="code" className="livrea-text-cyan" weight="bold">
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
                  <Text type="code" className="livrea-text-cyan" weight="bold">
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
                  <Text type="code" className="livrea-text-cyan" weight="bold">
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

            {/* Right Column: Framed Real Desktop App Tour */}
            <VStack gap={2} className="livrea-split-right-col">
              <VStack width="100%" className="livrea-mockup-frame">
                {/* Desktop Window Title Bar */}
                <HStack
                  justify="between"
                  align="center"
                  width="100%"
                  className="livrea-mockup-titlebar"
                >
                  <HStack align="center" gap={2}>
                    <HStack align="center" gap={1.5} className="livrea-win-controls">
                      <Text as="span" className="livrea-win-dot dot-reset" aria-hidden="true">{'\u00A0'}</Text>
                      <Text as="span" className="livrea-win-dot dot-compact" aria-hidden="true">{'\u00A0'}</Text>
                      <Text as="span" className="livrea-win-dot dot-fill" aria-hidden="true">{'\u00A0'}</Text>
                    </HStack>
                    <Text type="code" size="sm" className="livrea-win-title-text">
                      Oxide // Worktree Workspace
                    </Text>
                  </HStack>

                  <Text type="code" size="xsm" className="livrea-win-tag-badge">
                    TAURI 2
                  </Text>
                </HStack>

                {/* Real Preview Screenshot */}
                <AspectRatio ratio={16 / 10} fit="cover">
                  <img
                    src="/oxide-thread.png"
                    alt="Oxide desktop interface with Claude Code thread in the center and pre-merge diff surface on the right"
                    className="livrea-app-screenshot"
                  />
                </AspectRatio>
              </VStack>

              <HStack justify="between" align="center" width="100%" className="livrea-stage-caption">
                <Text type="supporting" color="secondary" size="sm">
                  Official Oxide interface: parallel worktree threads &amp; pre-merge verification
                </Text>
                <Text type="code" className="livrea-text-cyan" size="sm">
                  TAURI 2
                </Text>
              </HStack>
            </VStack>
          </HStack>

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip livrea-intermediate-strip">
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
            <HStack align="center" gap={2} className="livrea-telemetry-left">
              <Text as="span" className="livrea-red-indicator">{'\u00A0'}</Text>
              <Text weight="bold" color="secondary" size="sm" className="livrea-kicker">
                SECTOR 04 // DIGITAL SIGNAL PROCESSING &amp; MCP
              </Text>
            </HStack>
            <Text type="code" className="livrea-telemetry-badge" size="sm">
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
                  <Text type="code" className="livrea-role-badge">
                    DSP ENGINE · TAURI 2 + CLI + MCP
                  </Text>
                </HStack>

                <Text as="p" type="large" color="primary" className="livrea-project-lead">
                  {syncforgeProj.description}
                </Text>
                <Text type="code" color="secondary" size="sm">
                  STACK: <Text as="span" color="primary">{syncforgeProj.stack} · MCP Server</Text>
                </Text>
              </VStack>

              {/* 3 Architecture Pillars */}
              <VStack gap={1} width="100%" className="livrea-pillars-list">
                <HStack align="start" gap={3} className="livrea-pillar-item">
                  <Text type="code" className="livrea-text-cyan" weight="bold">
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
                  <Text type="code" className="livrea-text-cyan" weight="bold">
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
                  <Text type="code" className="livrea-text-cyan" weight="bold">
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
                  <HStack align="center" gap={2}>
                    <HStack align="center" gap={1.5} className="livrea-win-controls">
                      <Text as="span" className="livrea-win-dot dot-reset" aria-hidden="true">{'\u00A0'}</Text>
                      <Text as="span" className="livrea-win-dot dot-compact" aria-hidden="true">{'\u00A0'}</Text>
                      <Text as="span" className="livrea-win-dot dot-fill" aria-hidden="true">{'\u00A0'}</Text>
                    </HStack>
                    <Text type="code" size="sm" className="livrea-win-title-text">
                      SyncForge // Waveform &amp; Audio DSP
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

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip livrea-intermediate-strip">
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
            <HStack align="center" gap={2} className="livrea-telemetry-left">
              <Text as="span" className="livrea-red-indicator">{'\u00A0'}</Text>
              <Text weight="bold" color="secondary" size="sm" className="livrea-kicker">
                SECTOR 05 // SELF-HOSTED ARCHIVE &amp; SYSTEMS DAEMON
              </Text>
            </HStack>
            <Text type="code" className="livrea-telemetry-badge" size="sm">
              RUST + SQLITE
            </Text>
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
                  <Text type="code" className="livrea-role-badge">
                    CREATOR
                  </Text>
                  <Text type="code" color="secondary" size="sm">
                    Active Development (Pre-Release)
                  </Text>
                </HStack>

                <Text as="p" type="large" color="primary" className="livrea-project-lead">
                  {scrobblProj.description}
                </Text>
                <Text type="code" color="secondary" size="sm">
                  STACK: <Text as="span" color="primary">{scrobblProj.stack} · Spotify Web API</Text>
                </Text>
              </VStack>

              {/* 3 Architecture Pillars */}
              <VStack gap={1} width="100%" className="livrea-pillars-list">
                <HStack align="start" gap={3} className="livrea-pillar-item">
                  <Text type="code" className="livrea-text-cyan" weight="bold">
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
                  <Text type="code" className="livrea-text-cyan" weight="bold">
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
                  <Text type="code" className="livrea-text-cyan" weight="bold">
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
                  <HStack align="center" gap={2}>
                    <HStack align="center" gap={1.5} className="livrea-win-controls">
                      <Text as="span" className="livrea-win-dot dot-reset" aria-hidden="true">{'\u00A0'}</Text>
                      <Text as="span" className="livrea-win-dot dot-compact" aria-hidden="true">{'\u00A0'}</Text>
                      <Text as="span" className="livrea-win-dot dot-fill" aria-hidden="true">{'\u00A0'}</Text>
                    </HStack>
                    <Text type="code" size="sm" className="livrea-win-title-text">
                      scrobbl.rs // Dashboard &amp; History
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

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip livrea-intermediate-strip">
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
            <HStack align="center" gap={2} className="livrea-telemetry-left">
              <Text as="span" className="livrea-red-indicator">{'\u00A0'}</Text>
              <Text weight="bold" color="secondary" size="sm" className="livrea-kicker">
                SECTOR 06 // LOW-LEVEL EMBEDDED &amp; DISTRIBUTED GIS
              </Text>
            </HStack>
            <Text type="code" className="livrea-telemetry-badge" size="sm">
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
                <HStack justify="between" align="center" wrap="wrap" gap={2}>
                  <HStack align="center" gap={2}>
                    <img
                      src="/garda-chiese-logo.png"
                      alt="Garda Chiese Logo"
                      className="livrea-garda-logo"
                    />
                    <Text type="code" className="livrea-text-cyan" weight="bold">
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
                <HStack justify="between" align="center" wrap="wrap" gap={2}>
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

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip livrea-intermediate-strip">
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
            <HStack align="center" gap={2} className="livrea-telemetry-left">
              <Text as="span" className="livrea-red-indicator">{'\u00A0'}</Text>
              <Text weight="bold" color="secondary" size="sm" className="livrea-kicker">
                SECTOR 07 // AUXILIARY MACHINERY &amp; HOME LAB
              </Text>
            </HStack>
            <Text type="code" className="livrea-telemetry-badge" size="sm">
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

            {/* Symmetrical Precision Grid with Equal-Height Rows */}
            <VStack
              width="100%"
              className="livrea-machinery-grid"
              data-columns={machineryGridConfig.columns}
              data-compact={machineryGridConfig.isCompact}
            >
              {machineryProjects.map((item) => (
                <VStack key={item.id} gap={2} className="livrea-machinery-card">
                  <HStack justify="between" align="center">
                    <Heading level={3} weight="bold" color="primary">
                      {item.title}
                    </Heading>
                    <Text
                      type="code"
                      color="secondary"
                      size="sm"
                    >
                      {item.tech}
                    </Text>
                  </HStack>
                  <Text type="body" color="secondary" className="livrea-machinery-desc">
                    {item.description}
                  </Text>
                  {item.statusNote && (
                    <Text type="code" color="secondary" size="sm" className="livrea-card-status-note">
                      {item.statusNote}
                    </Text>
                  )}
                  {(item.liveUrl || item.githubUrl) && (
                    <HStack gap={3} wrap="wrap">
                      {item.liveUrl && (
                        <Link
                          href={item.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          color="accent"
                          size="sm"
                          weight="bold"
                          className="livrea-card-action-btn"
                        >
                          Live Web Application ↗
                        </Link>
                      )}
                      {item.githubUrl && (
                        <Link
                          href={item.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          color={item.liveUrl ? 'secondary' : 'accent'}
                          size="sm"
                          weight={item.liveUrl ? undefined : 'bold'}
                          className="livrea-card-action-btn"
                        >
                          {item.liveUrl ? 'GitHub Repo ↗' : 'GitHub Repository ↗'}
                        </Link>
                      )}
                    </HStack>
                  )}
                </VStack>
              ))}
            </VStack>
          </VStack>

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip livrea-intermediate-strip">
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
            <HStack align="center" gap={2} className="livrea-telemetry-left">
              <Text as="span" className="livrea-red-indicator">{'\u00A0'}</Text>
              <Text weight="bold" color="secondary" size="sm" className="livrea-kicker">
                SECTOR 08 // ACADEMIC &amp; SYSTEMS TRAJECTORY
              </Text>
            </HStack>
            <Text type="code" className="livrea-telemetry-badge" size="sm">
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

            {/* 4 Starting Grid Chronological Timeline Nodes */}
            <VStack gap={3} width="100%" className="livrea-grid-rows livrea-grid-timeline">
              {/* P01 */}
              <HStack align="center" gap={4} className="livrea-grid-row livrea-timeline-node is-active-node">
                <HStack align="center" gap={2} className="livrea-grid-node-header">
                  <Text className="livrea-grid-pos" color="accent">
                    P01
                  </Text>
                  <Text type="code" color="primary" weight="bold">
                    2024 – PRESENT
                  </Text>
                </HStack>
                <VStack gap={0.5} width="100%" className="livrea-grid-node-body">
                  <Heading level={3} weight="bold" color="primary">
                    B.Sc. Computer Engineering — UNIMORE (Mantova Campus)
                  </Heading>
                  <Text type="body" color="secondary">
                    Weighted academic average: <Text className="livrea-text-cyan" weight="bold">27.3 / 30</Text> · 125 / 180 ECTS completed · Expected graduation: 2027.
                  </Text>
                </VStack>
              </HStack>

              {/* P02 */}
              <HStack align="center" gap={4} className="livrea-grid-row livrea-timeline-node">
                <HStack align="center" gap={2} className="livrea-grid-node-header">
                  <Text className="livrea-grid-pos" color="primary">
                    P02
                  </Text>
                  <Text type="code" color="primary" weight="bold">
                    2023
                  </Text>
                </HStack>
                <VStack gap={0.5} width="100%" className="livrea-grid-node-body">
                  <Heading level={3} weight="bold" color="primary">
                    IT Systems Internship — Novellini S.p.A.
                  </Heading>
                  <Text type="body" color="secondary">
                    Corporate enterprise network infrastructure diagnostics, hardware maintenance, and workstation support.
                  </Text>
                </VStack>
              </HStack>

              {/* P03 */}
              <HStack align="center" gap={4} className="livrea-grid-row livrea-timeline-node">
                <HStack align="center" gap={2} className="livrea-grid-node-header">
                  <Text className="livrea-grid-pos" color="primary">
                    P03
                  </Text>
                  <Text type="code" color="primary" weight="bold">
                    2019 – 2024
                  </Text>
                </HStack>
                <VStack gap={0.5} width="100%" className="livrea-grid-node-body">
                  <Heading level={3} weight="bold" color="primary">
                    Diploma in Computer Science — ITIS "E. Fermi" Mantova
                  </Heading>
                  <Text type="body" color="secondary">
                    Graduated with top marks: <Text color="primary" weight="bold">100 / 100</Text>. Foundational C programming, network protocols, algorithms.
                  </Text>
                </VStack>
              </HStack>

              {/* P04 */}
              <HStack align="center" gap={4} className="livrea-grid-row livrea-timeline-node">
                <HStack align="center" gap={2} className="livrea-grid-node-header">
                  <Text className="livrea-grid-pos" color="secondary">
                    P04
                  </Text>
                  <Text type="code" color="primary" weight="bold">
                    CERTIFICATIONS
                  </Text>
                </HStack>
                <VStack gap={0.5} width="100%" className="livrea-grid-node-body">
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

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip livrea-intermediate-strip">
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
            <HStack align="center" gap={2} className="livrea-telemetry-left">
              <Text as="span" className="livrea-red-indicator">{'\u00A0'}</Text>
              <Text weight="bold" color="secondary" size="sm" className="livrea-kicker">
                SECTOR 09 // PIT WALL &amp; CONTACT TRANSMISSION
              </Text>
            </HStack>
            <Text type="code" className="livrea-telemetry-badge" size="sm">
              OPEN TO CONNECT
            </Text>
          </HStack>

          <VStack gap={4} width="100%" className="livrea-contact-center">
            <VStack gap={1}>
              <Heading level={2} className="livrea-massive-title">
                LET'S BUILD TOGETHER.
              </Heading>
              <HStack align="center" gap={2} paddingBlockStart={1}>
                <Text type="code" className="livrea-role-badge">
                  {IDENTITY.availability.toUpperCase()}
                </Text>
              </HStack>
            </VStack>

            <Text as="p" type="large" color="primary" className="livrea-contact-lead">
              I build fast, reliable software across the modern stack — from web and desktop applications to systems engineering and developer tooling. If you're building ambitious products or engineering solid software, I'd love to connect.
            </Text>

            {/* Desktop: 4 High-Contrast Structured Contact Cards */}
            <HStack justify="between" align="stretch" gap={3} width="100%" className="livrea-contact-cards-grid livrea-contact-cards-desktop">
              {/* Card 1: Direct Email */}
              <VStack gap={2} className="livrea-contact-card is-primary-action">
                <Text type="code" color="accent" size="sm">
                  CHANNEL 01 // DIRECT
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

              {/* Card 3: LinkedIn & Network */}
              <VStack gap={2} className="livrea-contact-card">
                <Text type="code" color="secondary" size="sm">
                  CHANNEL 03 // NETWORK
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

              {/* Card 4: Curriculum Vitae */}
              <VStack gap={2} className="livrea-contact-card">
                <Text type="code" color="secondary" size="sm">
                  CHANNEL 04 // CREDENTIALS
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
            </HStack>

            {/* Mobile: Dedicated Ergonomic Contact Action Deck */}
            <VStack gap={2} width="100%" className="livrea-contact-action-deck">
              {contactDeckActions.map((action) => {
                if (action.action === 'email') {
                  return (
                    <VStack key={action.id} className="livrea-contact-deck-item">
                      <Link
                        href={`mailto:${CONTACTS.email}`}
                        onClick={handleCopy}
                        className="livrea-contact-deck-btn is-primary-deck-action"
                      >
                        <HStack justify="between" align="center" width="100%">
                          <VStack gap={1} align="start">
                            <HStack align="center" gap={2}>
                              <Text type="code" color="accent" size="sm" weight="bold">
                                {action.channelLabel}
                              </Text>
                              {isCopied && (
                                <Text as="span" className="livrea-contact-toast">
                                  COPIED ✓
                                </Text>
                              )}
                            </HStack>
                            <Text weight="bold" color="primary">
                              {action.label}
                            </Text>
                            <Text type="code" color="secondary" size="sm">
                              {action.subtitle}
                            </Text>
                          </VStack>
                          <Text type="code" color="accent" size="lg" weight="bold">
                            {isCopied ? '✓' : 'COPY'}
                          </Text>
                        </HStack>
                      </Link>
                    </VStack>
                  );
                }

                if (action.action === 'cv') {
                  return (
                    <VStack key={action.id} className="livrea-contact-deck-item">
                      <HStack gap={2} width="100%">
                        <Link
                          href={CONTACTS.cvEn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="livrea-contact-deck-btn"
                          style={{ flex: 1 }}
                        >
                          <HStack justify="between" align="center" width="100%">
                            <VStack gap={1} align="start">
                              <Text type="code" color="secondary" size="sm">
                                {action.channelLabel}
                              </Text>
                              <Text weight="bold" color="primary">
                                CV (English PDF)
                              </Text>
                            </VStack>
                            <Text type="code" color="secondary" size="lg" weight="bold">
                              ↗
                            </Text>
                          </HStack>
                        </Link>

                        <Link
                          href={CONTACTS.cvIt}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="livrea-contact-deck-btn"
                          style={{ flex: 1 }}
                        >
                          <HStack justify="between" align="center" width="100%">
                            <VStack gap={1} align="start">
                              <Text type="code" color="secondary" size="sm">
                                {action.channelLabel}
                              </Text>
                              <Text weight="bold" color="primary">
                                CV (Italian PDF)
                              </Text>
                            </VStack>
                            <Text type="code" color="secondary" size="lg" weight="bold">
                              ↗
                            </Text>
                          </HStack>
                        </Link>
                      </HStack>
                    </VStack>
                  );
                }

                return (
                  <VStack key={action.id} className="livrea-contact-deck-item">
                    <Link
                      href={action.href ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="livrea-contact-deck-btn"
                    >
                      <HStack justify="between" align="center" width="100%">
                        <VStack gap={1} align="start">
                          <Text type="code" color="secondary" size="sm">
                            {action.channelLabel}
                          </Text>
                          <Text weight="bold" color="primary">
                            {action.label}
                          </Text>
                          <Text type="code" color="secondary" size="sm">
                            {action.subtitle}
                          </Text>
                        </VStack>
                        <Text type="code" color="secondary" size="lg" weight="bold">
                          ↗
                        </Text>
                      </HStack>
                    </Link>
                  </VStack>
                );
              })}
            </VStack>
          </VStack>

          <HStack justify="center" align="center" width="100%" className="livrea-bottom-strip livrea-finish-strip">
            <Text type="code" color="secondary" size="sm">
              © 2026 MATTEO BENASSI // MANTOVA, ITALY
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </Section>
  );
}
