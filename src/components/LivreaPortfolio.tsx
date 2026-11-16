import { useState, useEffect, useRef, type ReactNode } from 'react';
import {
  Section,
  VStack,
  HStack,
  Heading,
  Text,
  Link,
  Button,
  AspectRatio,
} from '@astryxdesign/core';
import { Icon } from '@astryxdesign/core/Icon';
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

const external = { target: '_blank', rel: 'noopener noreferrer' } as const;
const extIcon = <Icon icon="externalLink" size="sm" />;

/** Section header: livery tick, sector number, section name, quiet meta on the right. */
function SectorHeader({ num, label, meta }: { num: string; label: string; meta?: ReactNode }) {
  return (
    <HStack justify="between" align="center" width="100%" className="livrea-telemetry-header">
      <HStack align="center" gap={2} className="livrea-telemetry-left">
        <Text as="span" className="livrea-red-indicator" aria-hidden="true">
          {' '}
        </Text>
        <Text type="code" size="sm" color="primary" className="livrea-kicker-num">
          {num}
        </Text>
        <Text size="sm" color="secondary" className="livrea-kicker">
          {label}
        </Text>
      </HStack>
      {meta && (
        <Text type="code" size="sm" className="livrea-telemetry-badge">
          {meta}
        </Text>
      )}
    </HStack>
  );
}

/** Numbered architecture point used by the three flagship projects. */
function Pillar({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <HStack align="start" gap={3} className="livrea-pillar-item">
      <Text type="code" size="sm" color="secondary" className="livrea-pillar-num">
        {n}
      </Text>
      <VStack gap={0.5}>
        <Text weight="medium" color="primary">
          {title}
        </Text>
        <Text type="body" color="secondary">
          {children}
        </Text>
      </VStack>
    </HStack>
  );
}

/** Window frame around a real product capture. */
function ProductWindow({
  title,
  src,
  alt,
  ratio,
  caption,
  meta,
}: {
  title: string;
  src: string;
  alt: string;
  ratio: number;
  caption: string;
  meta: string;
}) {
  return (
    <VStack gap={2} width="100%" className="livrea-split-right-col">
      <VStack width="100%" className="livrea-mockup-frame">
        <HStack align="center" gap={3} width="100%" className="livrea-mockup-titlebar">
          <HStack align="center" gap={1.5} className="livrea-win-controls" aria-hidden="true">
            <Text as="span" className="livrea-win-dot">{' '}</Text>
            <Text as="span" className="livrea-win-dot">{' '}</Text>
            <Text as="span" className="livrea-win-dot">{' '}</Text>
          </HStack>
          <Text type="code" size="sm" color="secondary" className="livrea-win-title-text">
            {title}
          </Text>
        </HStack>
        <AspectRatio ratio={ratio} fit="cover">
          <img src={src} alt={alt} className="livrea-app-screenshot" loading="lazy" />
        </AspectRatio>
      </VStack>
      <HStack justify="between" align="start" gap={3} width="100%" className="livrea-stage-caption">
        <Text size="sm" color="secondary" className="livrea-stage-caption-text">
          {caption}
        </Text>
        <Text type="code" size="sm" color="secondary" className="livrea-stage-caption-meta">
          {meta}
        </Text>
      </HStack>
    </VStack>
  );
}

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

    updateMetrics();

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
        activeEl.closest('dialog') ||
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

  const availability = IDENTITY.availability.replace(/\.$/, '');

  return (
    <Section
      variant="transparent"
      paddingBlock={0}
      paddingInline={0}
      className="livrea-snap-container"
    >
      <TelemetryBackground />

      {/* Scroll progress: the one live livery line */}
      <HStack className="livrea-progress-track" aria-hidden="true">
        <Text as="span" className="livrea-progress-bar" style={{ width: `${scrollProgress}%` }}>
          {' '}
        </Text>
      </HStack>

      {/* Mobile: section bar + bottom sheet picker */}
      <MobileWaypointHud
        activeSector={activePanel}
        onScrollToSector={scrollToPanel}
        scrollProgress={scrollProgress}
      />

      {/* Desktop: section rail */}
      <VStack as="nav" gap={0} className="livrea-quick-nav" aria-label="Page sections">
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
              color={isActive ? 'primary' : 'secondary'}
              aria-current={isActive ? 'location' : undefined}
              aria-label={`${p.num} ${p.title}`}
              className={`livrea-nav-dot ${isActive ? 'is-active' : ''}`}
            >
              <Text type="code" size="sm" color="inherit">
                {p.num}
              </Text>
              <Text size="sm" color="inherit" className="livrea-nav-label">
                {p.title}
              </Text>
            </Link>
          );
        })}
      </VStack>

      {/* 01 — About */}
      <VStack as="section" id="panel-1" className="livrea-panel livrea-panel-01">
        <VStack justify="between" height="100%" width="100%" className="livrea-panel-inner">
          <SectorHeader num="01" label="About" meta={`Updated ${IDENTITY.lastUpdated}`} />

          <VStack gap={6} width="100%" className="livrea-hero-center">
            <VStack gap={3} width="100%">
              <Heading level={1} className="livrea-huge-name">
                Matteo
                <br />
                Benassi
              </Heading>
              <HStack align="center" gap={2} wrap="wrap" className="livrea-role-strip">
                <Text color="primary">Computer Engineering at UNIMORE</Text>
                <Text color="secondary" className="livrea-role-separator" aria-hidden="true">·</Text>
                <Text color="secondary">Software &amp; systems engineer</Text>
                <Text color="secondary" className="livrea-role-separator" aria-hidden="true">·</Text>
                <Text color="secondary">Mantova, Italy</Text>
              </HStack>
            </VStack>

            <VStack gap={2} className="livrea-manifesto-card">
              <Text as="p" color="primary" className="livrea-manifesto-text">
                {IDENTITY.manifesto}
              </Text>
              <Text as="p" color="secondary" className="livrea-manifesto-bio">
                {IDENTITY.bio}
              </Text>
            </VStack>

            <HStack align="stretch" gap={0} width="100%" className="livrea-kpi-grid">
              {heroMetrics.map((kpi) => (
                <VStack key={kpi.id} gap={1} className="livrea-kpi-box">
                  <Text size="sm" color="secondary">
                    {kpi.label}
                  </Text>
                  <Text color="primary" className="livrea-kpi-value">
                    {kpi.desktopValue || kpi.value}
                  </Text>
                  {kpi.detail && (
                    <Text size="sm" color="secondary">
                      {kpi.detail}
                    </Text>
                  )}
                </VStack>
              ))}
            </HStack>
          </VStack>

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip livrea-hero-strip">
            <HStack align="center" gap={1} wrap="wrap" className="livrea-hero-links">
              <Link href={`mailto:${CONTACTS.email}`} onClick={handleCopy} color="primary" className="livrea-email-link">
                {isCopied ? 'Email copied' : CONTACTS.email}
              </Link>
              <Link href={CONTACTS.github} {...external} color="secondary">GitHub</Link>
              <Link href={CONTACTS.linkedin} {...external} color="secondary">LinkedIn</Link>
              <Link href={CONTACTS.cvEn} {...external} color="secondary">CV (EN)</Link>
              <Link href={CONTACTS.cvIt} {...external} color="secondary">CV (IT)</Link>
            </HStack>
            <Text type="code" size="sm" color="secondary" className="livrea-scroll-hint">
              Scroll ↓
            </Text>
          </HStack>
        </VStack>
      </VStack>

      {/* 02 — Hackathons */}
      <VStack as="section" id="panel-2" className="livrea-panel livrea-panel-02">
        <VStack justify="between" height="100%" width="100%" className="livrea-panel-inner">
          <SectorHeader num="02" label="Hackathons" meta="3 entries · 3 podiums" />

          <VStack gap={6} width="100%" className="livrea-podium-container">
            <VStack gap={2}>
              <Heading level={2} className="livrea-section-head">
                Three hackathons, three podiums
              </Heading>
              <Text color="secondary" className="livrea-section-lead">
                Systems architecture, GIS engineering and applied AI, built with the UNIMORE team.
              </Text>
            </VStack>

            <HStack justify="between" align="stretch" gap={3} width="100%" className="livrea-podium-cards">
              <VStack gap={3} className="livrea-podium-card livrea-podium-p1">
                <HStack justify="between" align="center">
                  <Text className="livrea-podium-rank is-winner">P1</Text>
                  <Text type="code" size="sm" color="secondary">1st place · 2026</Text>
                </HStack>
                <VStack gap={0.5}>
                  <Heading level={3} className="livrea-card-title">Garda Chiese Alert</Heading>
                  <Text size="sm" color="secondary">Hack4Water 2026</Text>
                </VStack>
                <Text as="p" type="body" color="secondary">
                  Citizen incident reporting platform for a 76,645-hectare water basin across 33 municipalities, built in 72 hours.
                </Text>
                <VStack gap={1} className="livrea-card-specs">
                  <Text type="code" size="sm" color="primary">Django REST · PostGIS GIST · React · Gemini AI</Text>
                  <Text size="sm" color="secondary">
                    Sub-millisecond PostGIS polygon checks and automated Gemini multimodal voice triage.
                  </Text>
                </VStack>
                <Link href="https://github.com/cavallinilorenzo/alert-app-garda-chiese" {...external} color="primary" className="livrea-card-link">
                  View on GitHub ↗
                </Link>
              </VStack>

              <VStack gap={3} className="livrea-podium-card">
                <HStack justify="between" align="center">
                  <Text className="livrea-podium-rank">P2</Text>
                  <Text type="code" size="sm" color="secondary">2nd place · 2026</Text>
                </HStack>
                <VStack gap={0.5}>
                  <Heading level={3} className="livrea-card-title">Smart Beam</Heading>
                  <Text size="sm" color="secondary">SCIoTeM 2026</Text>
                </VStack>
                <Text as="p" type="body" color="secondary">
                  Predictive maintenance engine for municipal streetlights, shifting repairs from reactive to scheduled intervention.
                </Text>
                <VStack gap={1} className="livrea-card-specs">
                  <Text type="code" size="sm" color="primary">Python · scikit-learn · Cox proportional hazards · XGBoost</Text>
                  <Text size="sm" color="secondary">
                    Survival analysis computing failure hazard curves for luminaire fleets, with automated technician dispatch.
                  </Text>
                </VStack>
                <Link href="https://github.com/cavallinilorenzo/street-lighting-predictive-maintenance" {...external} color="primary" className="livrea-card-link">
                  View on GitHub ↗
                </Link>
              </VStack>

              <VStack gap={3} className="livrea-podium-card">
                <HStack justify="between" align="center">
                  <Text className="livrea-podium-rank">P2</Text>
                  <Text type="code" size="sm" color="secondary">2nd place · 2025</Text>
                </HStack>
                <VStack gap={0.5}>
                  <Heading level={3} className="livrea-card-title">P7M AI Summarizer</Heading>
                  <Text size="sm" color="secondary">SCIoTeM 2025</Text>
                </VStack>
                <Text as="p" type="body" color="secondary">
                  Legal tech ingestion pipeline unwrapping cryptographically signed PKCS#7 envelopes and producing legal digests.
                </Text>
                <VStack gap={1} className="livrea-card-specs">
                  <Text type="code" size="sm" color="primary">Python · PKCS#7 · Google Gemini</Text>
                  <Text size="sm" color="secondary">
                    Envelope verification, embedded content extraction and structured Italian legal summaries.
                  </Text>
                </VStack>
                <Link href="https://github.com/itsmrma/hackathon-p7m-ai-summarizer" {...external} color="primary" className="livrea-card-link">
                  View on GitHub ↗
                </Link>
              </VStack>
            </HStack>
          </VStack>

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip livrea-intermediate-strip">
            <Text type="code" size="sm" color="secondary">Hack4Water · SCIoTeM</Text>
            <Text type="code" size="sm" color="secondary">2025 – 2026</Text>
          </HStack>
        </VStack>
      </VStack>

      {/* 03 — Oxide */}
      <VStack as="section" id="panel-3" className="livrea-panel livrea-panel-03">
        <VStack justify="between" height="100%" width="100%" className="livrea-panel-inner">
          <SectorHeader num="03" label="Oxide" meta="Tauri 2 · Rust" />

          <HStack justify="between" align="center" gap={6} width="100%" className="livrea-project-split-layout">
            <VStack gap={5} className="livrea-split-left-col">
              <VStack gap={3}>
                <HStack align="center" gap={3}>
                  <img src="/oxide-icon.svg" alt="" className="livrea-project-logo" />
                  <Heading level={2} className="livrea-massive-title">{oxideProj.title}</Heading>
                </HStack>
                <HStack align="center" gap={2} wrap="wrap">
                  <Text type="code" size="sm" className="livrea-role-badge">Co-founder</Text>
                  <Text size="sm" color="secondary">Pre-release · in active development</Text>
                </HStack>
                <Text as="p" color="primary" className="livrea-project-lead">{oxideProj.description}</Text>
                <Text type="code" size="sm" color="secondary">{oxideProj.stack} · Git worktrees</Text>
              </VStack>

              <VStack gap={0} width="100%" className="livrea-pillars-list">
                <Pillar n="01" title="Isolated Git worktrees">
                  Spawns Claude Code, Codex and Antigravity into independent worktrees so parallel turns never overwrite files.
                </Pillar>
                <Pillar n="02" title="Pre-merge verification gate">
                  Runs typechecking and test suites on every agent turn before reconciling into the primary branch.
                </Pillar>
                <Pillar n="03" title="Native Rust and Tauri 2 backend">
                  Low-memory backend executing async subagent channels with native OS performance.
                </Pillar>
              </VStack>

              <HStack gap={2} wrap="wrap">
                <Button label="View on GitHub" variant="primary" href={oxideProj.href} {...external} endContent={extIcon} />
                {oxideProj.website && (
                  <Button label="Website" variant="secondary" href={oxideProj.website} {...external} endContent={extIcon} />
                )}
              </HStack>
            </VStack>

            <ProductWindow
              title="Oxide — worktree workspace"
              src="/oxide-thread.png"
              alt="Oxide desktop interface with a Claude Code thread in the center and the pre-merge diff surface on the right"
              ratio={16 / 10}
              caption="Parallel worktree threads and pre-merge verification"
              meta="Pre-release"
            />
          </HStack>

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip livrea-intermediate-strip">
            <Text type="code" size="sm" color="secondary">Systems programming · agent orchestration</Text>
            <Text type="code" size="sm" color="secondary">2026 · ongoing</Text>
          </HStack>
        </VStack>
      </VStack>

      {/* 04 — SyncForge */}
      <VStack as="section" id="panel-4" className="livrea-panel livrea-panel-04">
        <VStack justify="between" height="100%" width="100%" className="livrea-panel-inner">
          <SectorHeader num="04" label="SyncForge" meta="Rust FFT · Tauri 2" />

          <HStack justify="between" align="center" gap={6} width="100%" className="livrea-project-split-layout">
            <VStack gap={5} className="livrea-split-left-col">
              <VStack gap={3}>
                <HStack align="center" gap={3}>
                  <img src="/syncforge-icon.svg" alt="" className="livrea-project-logo" />
                  <Heading level={2} className="livrea-massive-title">{syncforgeProj.title}</Heading>
                </HStack>
                <HStack align="center" gap={2} wrap="wrap">
                  <Text type="code" size="sm" className="livrea-role-badge">Creator</Text>
                  <Text size="sm" color="secondary">Desktop app, CLI and MCP server</Text>
                </HStack>
                <Text as="p" color="primary" className="livrea-project-lead">{syncforgeProj.description}</Text>
                <Text type="code" size="sm" color="secondary">{syncforgeProj.stack} · MCP server</Text>
              </VStack>

              <VStack gap={0} width="100%" className="livrea-pillars-list">
                <Pillar n="01" title="FFT waveform cross-correlation">
                  Computes sub-millisecond audio stream offsets natively in Rust without external audio dependencies.
                </Pillar>
                <Pillar n="02" title="Lossless MKV stream pipeline">
                  Extracts and shifts subtitle and audio tracks without lossy video re-encoding.
                </Pillar>
                <Pillar n="03" title="Model Context Protocol server">
                  Ships with an embedded MCP server exposing 20 media tools to Claude Code and Cursor.
                </Pillar>
              </VStack>

              <HStack gap={2} wrap="wrap">
                <Button label="View on GitHub" variant="primary" href={syncforgeProj.href} {...external} endContent={extIcon} />
              </HStack>
            </VStack>

            <ProductWindow
              title="SyncForge — waveform and audio DSP"
              src="/syncforge-preview.gif"
              alt="SyncForge desktop preview with waveform analysis"
              ratio={16 / 9}
              caption="Batch track alignment and metadata editing"
              meta="FFmpeg + Rust"
            />
          </HStack>

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip livrea-intermediate-strip">
            <Text type="code" size="sm" color="secondary">Frequency-domain cross-correlation</Text>
            <Text type="code" size="sm" color="secondary">2026 · Rust / Tauri 2</Text>
          </HStack>
        </VStack>
      </VStack>

      {/* 05 — scrobbl.rs */}
      <VStack as="section" id="panel-5" className="livrea-panel livrea-panel-05">
        <VStack justify="between" height="100%" width="100%" className="livrea-panel-inner">
          <SectorHeader num="05" label="scrobbl.rs" meta="Rust · SQLite" />

          <HStack justify="between" align="center" gap={6} width="100%" className="livrea-project-split-layout">
            <VStack gap={5} className="livrea-split-left-col">
              <VStack gap={3}>
                <HStack align="center" gap={3}>
                  <img src="/scrobbl-icon.svg" alt="" className="livrea-project-logo" />
                  <Heading level={2} className="livrea-massive-title">scrobbl.rs</Heading>
                </HStack>
                <HStack align="center" gap={2} wrap="wrap">
                  <Text type="code" size="sm" className="livrea-role-badge">Creator</Text>
                  <Text size="sm" color="secondary">Pre-release · in active development</Text>
                </HStack>
                <Text as="p" color="primary" className="livrea-project-lead">{scrobblProj.description}</Text>
                <Text type="code" size="sm" color="secondary">{scrobblProj.stack} · Spotify Web API</Text>
              </VStack>

              <VStack gap={0} width="100%" className="livrea-pillars-list">
                <Pillar n="01" title="Background collection and ingestion">
                  Adaptive Spotify polling with duplicate reconciliation and multi-year JSON archive ingestion.
                </Pillar>
                <Pillar n="02" title="Dual SQLite databases in WAL mode">
                  Keeps listening analytics (archive.db) apart from auth tokens (auth.db), querying 50,000+ tracks in under 5 ms.
                </Pillar>
                <Pillar n="03" title="Single-binary distribution">
                  Compiles the React and TypeScript frontend into the standalone Rust binary with bundled SQLite.
                </Pillar>
              </VStack>

              <HStack gap={2} wrap="wrap">
                <Button label="View on GitHub" variant="primary" href={scrobblProj.href} {...external} endContent={extIcon} />
              </HStack>
            </VStack>

            <ProductWindow
              title="scrobbl.rs — dashboard and history"
              src="/scrobbl-preview.gif"
              alt="scrobbl.rs dashboard with listening history, statistics charts and personal rankings"
              ratio={16 / 9}
              caption="Listening dashboard, history queries and rankings"
              meta="GPL-3.0"
            />
          </HStack>

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip livrea-intermediate-strip">
            <Text type="code" size="sm" color="secondary">Async Rust daemon · embedded SQLite WAL</Text>
            <Text type="code" size="sm" color="secondary">2026 · active</Text>
          </HStack>
        </VStack>
      </VStack>

      {/* 06 — Embedded & GIS */}
      <VStack as="section" id="panel-6" className="livrea-panel livrea-panel-06">
        <VStack justify="between" height="100%" width="100%" className="livrea-panel-inner">
          <SectorHeader num="06" label="Embedded & GIS" meta="C · PostGIS" />

          <VStack gap={6} width="100%" className="livrea-detail-block">
            <VStack gap={2}>
              <Heading level={2} className="livrea-section-head">
                Embedded firmware and spatial platforms
              </Heading>
              <Text color="secondary" className="livrea-section-lead">
                From bare-metal C running in under 16 KB of SRAM to a regional GIS backend checking thousands of spatial polygons.
              </Text>
            </VStack>

            <HStack justify="between" align="stretch" gap={3} width="100%" className="livrea-split-engineering">
              <VStack gap={3} className="livrea-system-split-box">
                <HStack justify="between" align="center" wrap="wrap" gap={2}>
                  <HStack align="center" gap={2}>
                    <img src="/garda-chiese-logo.png" alt="" className="livrea-garda-logo" />
                    <Text type="code" size="sm" color="secondary">Spatial platform</Text>
                  </HStack>
                  <Text type="code" size="sm" color="secondary">1st place · Hack4Water</Text>
                </HStack>
                <Heading level={3} className="livrea-card-title">{gardaProj.title}</Heading>
                <Text as="p" type="body" color="secondary">{gardaProj.description}</Text>
                <VStack gap={1} className="livrea-card-specs">
                  <Text type="code" size="sm" color="primary">PostGIS GIST spatial indices · Gemini</Text>
                  <Text size="sm" color="secondary">
                    Sub-millisecond containment checks over 76,645 hectares across 33 municipal canal boundaries, with no sign-up required.
                  </Text>
                  <Text type="code" size="sm" color="secondary">{gardaProj.stack}</Text>
                </VStack>
                <HStack>
                  <Button label="View on GitHub" variant="secondary" href={gardaProj.href} {...external} endContent={extIcon} />
                </HStack>
              </VStack>

              <VStack gap={3} className="livrea-system-split-box">
                <HStack justify="between" align="center" wrap="wrap" gap={2}>
                  <Text type="code" size="sm" color="secondary">Bare-metal firmware</Text>
                  <Text type="code" size="sm" color="secondary">ARM Cortex-M4</Text>
                </HStack>
                <Heading level={3} className="livrea-card-title">{stm32Proj.title}</Heading>
                <Text as="p" type="body" color="secondary">{stm32Proj.description}</Text>
                <VStack gap={1} className="livrea-card-specs">
                  <Text type="code" size="sm" color="primary">No OS · bare-metal C · under 16 KB SRAM</Text>
                  <Text size="sm" color="secondary">
                    Direct register access on ARM Cortex-M4, a non-blocking state machine and Wi-Fi TCP/IP polling of rain forecasts before each valve cycle.
                  </Text>
                  <Text type="code" size="sm" color="secondary">{stm32Proj.stack}</Text>
                </VStack>
                <HStack>
                  <Button label="View on GitHub" variant="secondary" href={stm32Proj.href} {...external} endContent={extIcon} />
                </HStack>
              </VStack>
            </HStack>
          </VStack>

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip livrea-intermediate-strip">
            <Text type="code" size="sm" color="secondary">C firmware · PostgreSQL / PostGIS</Text>
            <Text type="code" size="sm" color="secondary">2026</Text>
          </HStack>
        </VStack>
      </VStack>

      {/* 07 — More projects */}
      <VStack as="section" id="panel-7" className="livrea-panel livrea-panel-07">
        <VStack justify="between" height="100%" width="100%" className="livrea-panel-inner">
          <SectorHeader num="07" label="More projects" meta="Systems & infrastructure" />

          <VStack gap={6} width="100%" className="livrea-detail-block">
            <VStack gap={2}>
              <Heading level={2} className="livrea-section-head">More projects</Heading>
              <Text color="secondary" className="livrea-section-lead">
                Smaller tools, system daemons, infrastructure experiments and a home lab.
              </Text>
            </VStack>

            <VStack
              width="100%"
              className="livrea-machinery-grid"
              data-columns={machineryGridConfig.columns}
              data-compact={machineryGridConfig.isCompact}
            >
              {machineryProjects.map((item) => (
                <VStack key={item.id} gap={2} className="livrea-machinery-card">
                  <HStack justify="between" align="center" gap={3}>
                    <Heading level={3} className="livrea-card-title">{item.title}</Heading>
                    <Text type="code" size="sm" color="secondary" className="livrea-machinery-tech">{item.tech}</Text>
                  </HStack>
                  <Text type="body" color="secondary" className="livrea-machinery-desc">{item.description}</Text>
                  {item.statusNote && (
                    <Text size="sm" color="secondary" className="livrea-card-status-note">{item.statusNote}</Text>
                  )}
                  {(item.liveUrl || item.githubUrl) && (
                    <HStack gap={4} wrap="wrap" className="livrea-card-actions">
                      {item.liveUrl && (
                        <Link href={item.liveUrl} {...external} color="primary" className="livrea-card-link">
                          Open live app ↗
                        </Link>
                      )}
                      {item.githubUrl && (
                        <Link href={item.githubUrl} {...external} color={item.liveUrl ? 'secondary' : 'primary'} className="livrea-card-link">
                          View on GitHub ↗
                        </Link>
                      )}
                    </HStack>
                  )}
                </VStack>
              ))}
            </VStack>
          </VStack>

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip livrea-intermediate-strip">
            <Text type="code" size="sm" color="secondary">Rust · C · Python · PostGIS · Linux · ZFS · Docker</Text>
            <Text type="code" size="sm" color="secondary">Source on GitHub</Text>
          </HStack>
        </VStack>
      </VStack>

      {/* 08 — Education */}
      <VStack as="section" id="panel-8" className="livrea-panel livrea-panel-08">
        <VStack justify="between" height="100%" width="100%" className="livrea-panel-inner">
          <SectorHeader num="08" label="Education" meta="2019 – 2027" />

          <VStack gap={6} width="100%" className="livrea-detail-block">
            <VStack gap={2}>
              <Heading level={2} className="livrea-section-head">Education and experience</Heading>
              <Text color="secondary" className="livrea-section-lead">
                Computer science foundations, enterprise infrastructure experience and an engineering degree in progress.
              </Text>
            </VStack>

            <VStack gap={0} width="100%" className="livrea-grid-rows">
              <HStack align="start" gap={6} className="livrea-grid-row is-active-node">
                <HStack align="center" gap={3} className="livrea-grid-node-header">
                  <Text type="code" size="sm" className="livrea-grid-pos is-current">P01</Text>
                  <Text type="code" size="sm" color="primary">2024 – present</Text>
                </HStack>
                <VStack gap={1} width="100%">
                  <Heading level={3} className="livrea-card-title">B.Sc. Computer Engineering — UNIMORE, Mantova campus</Heading>
                  <Text type="body" color="secondary">
                    Weighted average <Text as="span" color="primary" weight="medium">27.3 / 30</Text> · 125 / 180 ECTS completed · expected graduation 2027
                  </Text>
                </VStack>
              </HStack>

              <HStack align="start" gap={6} className="livrea-grid-row">
                <HStack align="center" gap={3} className="livrea-grid-node-header">
                  <Text type="code" size="sm" color="secondary" className="livrea-grid-pos">P02</Text>
                  <Text type="code" size="sm" color="primary">2023</Text>
                </HStack>
                <VStack gap={1} width="100%">
                  <Heading level={3} className="livrea-card-title">IT systems internship — Novellini S.p.A.</Heading>
                  <Text type="body" color="secondary">
                    Enterprise network infrastructure diagnostics, hardware maintenance and workstation support.
                  </Text>
                </VStack>
              </HStack>

              <HStack align="start" gap={6} className="livrea-grid-row">
                <HStack align="center" gap={3} className="livrea-grid-node-header">
                  <Text type="code" size="sm" color="secondary" className="livrea-grid-pos">P03</Text>
                  <Text type="code" size="sm" color="primary">2019 – 2024</Text>
                </HStack>
                <VStack gap={1} width="100%">
                  <Heading level={3} className="livrea-card-title">Diploma in Computer Science — ITIS "E. Fermi", Mantova</Heading>
                  <Text type="body" color="secondary">
                    Graduated with <Text as="span" color="primary" weight="medium">100 / 100</Text> · C programming, network protocols, algorithms
                  </Text>
                </VStack>
              </HStack>

              <HStack align="start" gap={6} className="livrea-grid-row">
                <HStack align="center" gap={3} className="livrea-grid-node-header">
                  <Text type="code" size="sm" color="secondary" className="livrea-grid-pos">P04</Text>
                  <Text type="code" size="sm" color="primary">Certifications</Text>
                </HStack>
                <VStack gap={1} width="100%">
                  <Heading level={3} className="livrea-card-title">Cambridge B2 First and languages</Heading>
                  <Text type="body" color="secondary">
                    Professional working proficiency in English · native Italian speaker
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </VStack>

          <HStack justify="between" align="center" width="100%" className="livrea-bottom-strip livrea-intermediate-strip">
            <Text type="code" size="sm" color="secondary">UNIMORE · Mantova campus</Text>
            <Text type="code" size="sm" color="secondary">Mantova, Italy</Text>
          </HStack>
        </VStack>
      </VStack>

      {/* 09 — Contact */}
      <VStack as="section" id="panel-9" className="livrea-panel livrea-panel-09">
        <VStack justify="between" height="100%" width="100%" className="livrea-panel-inner">
          <SectorHeader num="09" label="Contact" meta="Open to connect" />

          <VStack gap={6} width="100%" className="livrea-contact-center">
            <VStack gap={3}>
              <Heading level={2} className="livrea-section-head livrea-contact-head">
                {availability}
              </Heading>
              <Text as="p" color="secondary" className="livrea-contact-lead">
                I'm looking for an internship in systems, embedded or motorsport software. Email is the fastest way to reach me, and my CV is available in English and Italian.
              </Text>
            </VStack>

            {/* Desktop: four channels */}
            <HStack justify="between" align="stretch" gap={3} width="100%" className="livrea-contact-cards-grid livrea-contact-cards-desktop">
              <VStack gap={3} className="livrea-contact-card">
                <VStack gap={1}>
                  <Text size="sm" color="secondary">Email</Text>
                  <Text color="primary" weight="medium">{CONTACTS.email}</Text>
                  <Text size="sm" color="secondary">Projects, internships and technical questions</Text>
                </VStack>
                <HStack>
                  <Button
                    label={isCopied ? 'Email copied' : 'Copy email'}
                    variant="primary"
                    onClick={handleCopy}
                    icon={<Icon icon={isCopied ? 'check' : 'copy'} />}
                  />
                </HStack>
              </VStack>

              <VStack gap={3} className="livrea-contact-card">
                <VStack gap={1}>
                  <Text size="sm" color="secondary">GitHub</Text>
                  <Text color="primary" weight="medium">@{CONTACTS.githubUsername}</Text>
                  <Text size="sm" color="secondary">Open source work, Oxide and every repository on this page</Text>
                </VStack>
                <HStack>
                  <Button label="Open GitHub" variant="secondary" href={CONTACTS.github} {...external} endContent={extIcon} />
                </HStack>
              </VStack>

              <VStack gap={3} className="livrea-contact-card">
                <VStack gap={1}>
                  <Text size="sm" color="secondary">LinkedIn</Text>
                  <Text color="primary" weight="medium">Matteo Benassi</Text>
                  <Text size="sm" color="secondary">Based in Mantova, open to motorsport and systems software roles</Text>
                </VStack>
                <HStack>
                  <Button label="Open LinkedIn" variant="secondary" href={CONTACTS.linkedin} {...external} endContent={extIcon} />
                </HStack>
              </VStack>

              <VStack gap={3} className="livrea-contact-card">
                <VStack gap={1}>
                  <Text size="sm" color="secondary">CV</Text>
                  <Text color="primary" weight="medium">PDF, English and Italian</Text>
                  <Text size="sm" color="secondary">Education, hackathons, skills and experience</Text>
                </VStack>
                <HStack gap={2} wrap="wrap">
                  <Button label="English" variant="secondary" href={CONTACTS.cvEn} {...external} endContent={extIcon} />
                  <Button label="Italiano" variant="secondary" href={CONTACTS.cvIt} {...external} endContent={extIcon} />
                </HStack>
              </VStack>
            </HStack>

            {/* Mobile: one list of contact rows */}
            <VStack gap={0} width="100%" className="livrea-contact-action-deck">
              {contactDeckActions.map((action) => {
                if (action.action === 'email') {
                  return (
                    <Link
                      key={action.id}
                      href={`mailto:${CONTACTS.email}`}
                      onClick={handleCopy}
                      className="livrea-contact-deck-btn"
                      aria-label={isCopied ? 'Email copied' : `Copy email address ${CONTACTS.email}`}
                    >
                      <HStack justify="between" align="center" gap={3} width="100%">
                        <VStack gap={0.5}>
                          <Text size="sm" color="secondary">{action.channelLabel}</Text>
                          <Text color="primary" weight="medium">{action.subtitle}</Text>
                        </VStack>
                        <HStack align="center" gap={1} className="livrea-contact-deck-action">
                          <Text size="sm" color="primary">{isCopied ? 'Copied' : 'Copy'}</Text>
                          <Icon icon={isCopied ? 'check' : 'copy'} size="sm" color="primary" />
                        </HStack>
                      </HStack>
                    </Link>
                  );
                }

                if (action.action === 'cv') {
                  return (
                    <HStack key={action.id} justify="between" align="center" gap={3} width="100%" className="livrea-contact-deck-btn is-static">
                      <VStack gap={0.5}>
                        <Text size="sm" color="secondary">{action.channelLabel}</Text>
                        <Text color="primary" weight="medium">{action.subtitle}</Text>
                      </VStack>
                      <HStack gap={2}>
                        <Button label="EN" size="sm" variant="secondary" href={CONTACTS.cvEn} {...external} aria-label="CV in English (PDF)" />
                        <Button label="IT" size="sm" variant="secondary" href={CONTACTS.cvIt} {...external} aria-label="CV in Italian (PDF)" />
                      </HStack>
                    </HStack>
                  );
                }

                return (
                  <Link key={action.id} href={action.href ?? '#'} {...external} className="livrea-contact-deck-btn">
                    <HStack justify="between" align="center" gap={3} width="100%">
                      <VStack gap={0.5}>
                        <Text size="sm" color="secondary">{action.channelLabel}</Text>
                        <Text color="primary" weight="medium">{action.subtitle}</Text>
                      </VStack>
                      <Icon icon="externalLink" size="sm" color="secondary" />
                    </HStack>
                  </Link>
                );
              })}
            </VStack>
          </VStack>

          <HStack justify="center" align="center" width="100%" className="livrea-bottom-strip livrea-finish-strip">
            <Text type="code" size="sm" color="secondary">
              © 2026 Matteo Benassi · Mantova, Italy
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </Section>
  );
}
