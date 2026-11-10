import { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  StackItem,
  Grid,
  Card,
  Section,
  Text,
  Heading,
  Button,
  Divider,
  Token,
  Center,
  CodeBlock,
  TextInput,
  TextArea,
  DropdownMenu,
} from '@astryxdesign/core';
import {
  portfolioProjects,
  timelineItems,
  motorsportDomains,
  whoamiSnippet,
  TokenColor,
  Project,
} from '../data/portfolioData';

interface WorkstationPortfolioProps {
  colorMode: 'dark' | 'light';
  onToggleColorMode: () => void;
}

export type WorkstationTab =
  | 'home'
  | 'hackathons'
  | 'oxide'
  | 'rust-desktop'
  | 'embedded-iot'
  | 'web-gis'
  | 'curriculum'
  | 'objectives'
  | 'terminal'
  | 'contacts';

interface TabMeta {
  id: WorkstationTab;
  label: string;
  filename: string;
  badge: string;
  badgeColor: TokenColor;
  subtitle: string;
}

const WORKSTATION_TABS: TabMeta[] = [
  {
    id: 'home',
    label: 'Home',
    filename: 'Workstation_Overview.sys',
    badge: 'System v3.2',
    badgeColor: 'blue',
    subtitle: 'Matteo Benassi · Computer Engineering B.Sc. student @ UNIMORE & Systems Developer',
  },
  {
    id: 'hackathons',
    label: 'Hackathons',
    filename: 'Hackathon_Showcase.app',
    badge: '3 Podiums',
    badgeColor: 'green',
    subtitle: 'Competitive software engineering · 1st Place Hack4Water 2026 & 2x 2nd Place SCIoTeM',
  },
  {
    id: 'oxide',
    label: 'Oxide',
    filename: 'Oxide_Agent_IDE.rs',
    badge: 'getoxide/oxide',
    badgeColor: 'orange',
    subtitle: 'Open-source Rust + Tauri 2 desktop GUI for Claude Code, Codex & Antigravity CLI',
  },
  {
    id: 'rust-desktop',
    label: 'Rust & Desktop',
    filename: 'Rust_Desktop_Suite.rs',
    badge: 'Rust + Tauri',
    badgeColor: 'teal',
    subtitle: 'Native Rust applications: SyncForge v3.5, scrobbl.rs archive & AMD GPU Fan Control',
  },
  {
    id: 'embedded-iot',
    label: 'Embedded & IoT',
    filename: 'Embedded_Systems_Lab.c',
    badge: 'STM32 · HASS · ZFS',
    badgeColor: 'blue',
    subtitle: 'Bare-metal C on ARM Cortex-M4, Viessmann Home Assistant add-on & TrueNAS Linux lab',
  },
  {
    id: 'web-gis',
    label: 'Web & GIS',
    filename: 'Web_Spatial_Platforms.ts',
    badge: 'Full-Stack & GIS',
    badgeColor: 'purple',
    subtitle: 'Music History Analyzer, Sagre in Lombardia Open Data GIS & UNIMORE Django/JavaFX',
  },
  {
    id: 'curriculum',
    label: 'Curriculum',
    filename: 'Curriculum_Vitae.pdf',
    badge: '125/180 ECTS',
    badgeColor: 'blue',
    subtitle: 'UNIMORE B.Sc. in Computer Engineering · Weighted Avg: 27.3/30 (2 Honors) · 100/100 ITIS Fermi',
  },
  {
    id: 'objectives',
    label: 'Career Objectives',
    filename: 'Motorsport_Career.cfg',
    badge: 'Motorsport & Racing',
    badgeColor: 'red',
    subtitle: 'Ambition to work in the Motorsport world across software, data platforms, telemetry & team IT',
  },
  {
    id: 'terminal',
    label: 'Terminal',
    filename: 'Developer_Shell.zsh',
    badge: 'zsh 5.9',
    badgeColor: 'gray',
    subtitle: 'Interactive developer console · System diagnostics, repositories & profile inspector',
  },
  {
    id: 'contacts',
    label: 'Contacts',
    filename: 'Communications_Directory.net',
    badge: 'Available for Roles',
    badgeColor: 'green',
    subtitle: 'Direct communication channels · Curricular internship & engineering inquiries',
  },
];

const INITIAL_NEOFETCH = `matteo@benassios:~$ neofetch
       ___         Matteo Benassi @ UNIMORE (Mantova, Italy)
      /  /\\        ------------------------------------------------
     /  /::\\       OS: BenassiOS Workstation v3.2 (x86_64 / arm64)
    /  /:/\\:\\      Degree: B.Sc. Computer Engineering (2024 – 2027)
   /  /::\\ \\:\\     Academic Record: 125/180 ECTS · Avg 27.3/30 (2 Honors)
  /__/:/\\:\\ \\:\\    Hackathons: 1st Hack4Water '26 · 2x 2nd SCIoTeM ('26, '25)
  \\  \\:\\ \\:\\_\\/    Open Source: getoxide/oxide, SyncForge, scrobbl.rs
   \\  \\:\\ \\:\\      Core Stack: Rust, C/C++, Python, TypeScript, React, Django
    \\  \\:\\_\\/      Systems: Tauri 2, STM32 Cortex-M4, PostGIS, TrueNAS ZFS
     \\__\\/         Career Focus: Motorsport Software, Data & Engineering IT`;

export function WorkstationPortfolio({ colorMode, onToggleColorMode }: WorkstationPortfolioProps) {
  const [activeTab, setActiveTab] = useState<WorkstationTab>('home');

  // Track viewport width for responsive mobile dropdown
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Selected project per category tab
  const [selectedByCategory, setSelectedByCategory] = useState<Record<string, string>>({
    hackathon: 'garda-chiese',
    oxide: 'oxide-core',
    'rust-desktop': 'syncforge',
    'embedded-iot': 'stm32-garden',
    'web-gis': 'spotify-analyzer',
  });

  // Track which project testbenches have been toggled active
  const [activeTestbenches, setActiveTestbenches] = useState<Record<string, boolean>>({});

  // Career Objectives sub-tab & toggle state
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>('motorsport-overall');

  const [emailCopied, setEmailCopied] = useState(false);
  const [clockTime, setClockTime] = useState<string>('17:30:00');

  // Contact form & dispatcher state
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactCategory, setContactCategory] = useState<string>('Curricular Internship');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [contactDispatched, setContactDispatched] = useState<boolean>(false);
  const [messageCopied, setMessageCopied] = useState<boolean>(false);

  const handleDispatchContact = () => {
    const subjectText = `[${contactCategory}] Inquiry from ${contactName.trim() || 'Recruiter'}`;
    const bodyText = `Hello Matteo,\n\nName: ${contactName.trim() || 'Not specified'}\nEmail: ${contactEmail.trim() || 'Not specified'}\nTopic: ${contactCategory}\n\nMessage:\n${contactMessage.trim() || '(No message content)'}\n\n---\nSent from benassimatteo.dev Workstation`;
    const mailtoUrl = `mailto:info@benassimatteo.dev?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;
    window.open(mailtoUrl, '_blank');
    setContactDispatched(true);
  };

  const handleCopyMessage = () => {
    const bodyText = `To: info@benassimatteo.dev\nSubject: [${contactCategory}] Inquiry from ${contactName.trim() || 'Recruiter'}\n\nHello Matteo,\n\nName: ${contactName.trim() || 'Not specified'}\nEmail: ${contactEmail.trim() || 'Not specified'}\nTopic: ${contactCategory}\n\nMessage:\n${contactMessage.trim() || '(No message content)'}`;
    navigator.clipboard.writeText(bodyText);
    setMessageCopied(true);
    setTimeout(() => setMessageCopied(false), 2200);
  };

  const contactLog = contactDispatched
    ? `[DISPATCH] Handshake OK (200)
[MAILTO]   Handed over to system client: mailto:info@benassimatteo.dev
[PAYLOAD]  Target: info@benassimatteo.dev
           Topic : ${contactCategory}
           From  : ${contactName || 'Visitor'} <${contactEmail || 'unspecified'}>
[STATUS]   Transmission dispatched successfully.
------------------------------------------------------
Thank you for reaching out! Matteo typically replies within 24 hours.`
    : `[COMMUNICATIONS DAEMON] Ready for incoming message
------------------------------------------------------
To       : info@benassimatteo.dev
From     : ${contactName.trim() || '<Your Name / Organization>'} <${contactEmail.trim() || '<your.email@company.com>'}>
Topic    : ${contactCategory}
Length   : ${contactMessage.length} characters
Security : TLS 1.3 encrypted transport via MTA
Status   : ${contactName || contactMessage ? 'PAYLOAD DRAFTED · READY TO TRANSMIT' : 'AWAITING USER INPUT'}
------------------------------------------------------
Click "Dispatch via Email Client ✉" to open mailer or "Copy Text" to clipboard.`;

  // Terminal state
  const [activeCliCommand, setActiveCliCommand] = useState<string>('neofetch');
  const [terminalInput, setTerminalInput] = useState<string>('');
  const [cliTranscript, setCliTranscript] = useState<string>(INITIAL_NEOFETCH);

  // Live Clock Effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('info@benassimatteo.dev');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2200);
  };

  const toggleProjectTestbench = (projectId: string) => {
    setActiveTestbenches((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const handleRunCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim().toLowerCase();
    if (!trimmed) return;

    if (trimmed === 'clear') {
      setActiveCliCommand('clear');
      setCliTranscript(INITIAL_NEOFETCH);
      return;
    }

    if (trimmed === 'home') {
      setActiveTab('home');
      setCliTranscript(`matteo@benassios:~$ home\n[Navigated to Workstation Overview Dashboard]`);
      return;
    }

    setActiveCliCommand(trimmed);
    let output = '';

    switch (trimmed) {
      case 'help':
        output = [
          'Available diagnostic commands:',
          '  home          Jump to Workstation Overview & KPIs',
          '  neofetch      System summary, academic average & hardware targets',
          '  whoami        Structured JSON developer profile & coordinates',
          '  oxide         Inspect getoxide/oxide (Rust + Tauri 2 Agentic IDE)',
          '  repos         List key repositories (SyncForge, scrobbl.rs, STM32, ...)',
          '  hackathons    Competition victories (1st Hack4Water, 2x 2nd SCIoTeM)',
          '  stack         Languages, frameworks, embedded & infrastructure tools',
          '  objectives    Career ambition in the Motorsport & Racing industry',
          '  contact       Email, GitHub & official PDF curriculum links',
        ].join('\n');
        break;
      case 'neofetch':
        setCliTranscript(INITIAL_NEOFETCH);
        return;
      case 'whoami':
        output = JSON.stringify(whoamiSnippet, null, 2);
        break;
      case 'oxide':
        output = [
          'Repository : https://github.com/getoxide/oxide (with @cavallinilorenzo)',
          'Stack      : Rust + Tauri 2 + TypeScript/React (macOS arm64 & Windows x64)',
          'Providers  : Claude Code (claude), OpenAI Codex (codex), Antigravity CLI (agy)',
          'Highlights : Per-Turn Git Checkpoints, Deterministic Verification Dossier,',
          '             Blind Cross-Provider Review, Monaco LSPs & Local GPU Whisper.',
        ].join('\n');
        break;
      case 'repos':
        output = [
          '• getoxide/oxide                 [Rust/Tauri 2] Desktop GUI for AI Coding Agents',
          '• itsmrma/SyncForge              [Rust/Tauri 2] Video/Audio FFT Sync, CLI & MCP',
          '• itsmrma/scrobbl-rs             [Rust/React]   Self-Hosted Music Listening Archive',
          '• itsmrma/amd-fan-control        [Rust/ADL]     AMD Radeon Overdrive8 Fan Utility',
          '• itsmrma/viesmann-dashboard-hass[JS/HASS]      Viessmann 2701 + ViCare Add-on',
          '• itsmrma/spotify-history-analyzer[Web/JS]      Multi-Scrobbler Streaming Analytics',
          '• itsmrma/STM32CentralinaGettini [Embedded C]   STM32 Cortex-M4 Autonomous Irrigation',
          '• itsmrma/benpie                 [PHP/MySQL]    Sagre in Lombardia Open Data GIS',
          '• itsmrma/uni-musiclib-project   [Python/Django]MusicBrainz & TheAudioDB Library',
        ].join('\n');
        break;
      case 'hackathons':
        output = [
          '1. [1st Place] Hack4Water 2026 — Garda Chiese Alert (PostGIS + Gemini AI · 76,645 ha)',
          '2. [2nd Place] SCIoTeM 2026    — Smart Beam (Cox Survival Analysis + XGBoost ML)',
          '3. [2nd Place] SCIoTeM 2025    — P7M AI Summarizer (ASN.1/DER PKCS#7 Unwrapper)',
        ].join('\n');
        break;
      case 'stack':
        output = [
          'Rust & Desktop : Rust, Tauri 2, Cargo Workspaces, FFI, FFT DSP, MCP Servers',
          'Embedded & OS  : C, C++, STM32 ARM Cortex-M4, POSIX Threads, Linux, TrueNAS ZFS',
          'Web & Backend  : Python, Django REST, TypeScript, React 19, PHP, MySQL, PostGIS',
          'Data & AI      : Google Gemini API, scikit-learn, XGBoost, Survival Analysis',
        ].join('\n');
        break;
      case 'objectives':
      case 'motorsport':
        output = [
          'Target Industry : Motorsport, Racing Teams & High-Performance Automotive',
          'Engineering Role: Full-Stack & Desktop Tooling, Data/Strategy Platforms,',
          '                  Trackside & Factory IT Systems, Telemetry & Embedded.',
          'Availability    : Curricular Internship, Thesis & Junior Engineering Roles.',
        ].join('\n');
        break;
      case 'contact':
        output = [
          'Email      : info@benassimatteo.dev',
          'GitHub     : https://github.com/itsmrma',
          'Resume (EN): /cv/CV_Matteo_Benassi_EN.pdf',
          'Resume (IT): /cv/CV_Matteo_Benassi_IT.pdf',
        ].join('\n');
        break;
      default:
        output = `zsh: command not found: ${trimmed}. Type "help" for available commands.`;
    }

    setCliTranscript(`matteo@benassios:~$ ${trimmed}\n${output}`);
  };

  const handleTerminalSubmit = () => {
    if (!terminalInput.trim()) return;
    handleRunCommand(terminalInput);
    setTerminalInput('');
  };

  const currentTabMeta = WORKSTATION_TABS.find((t) => t.id === activeTab) || WORKSTATION_TABS[0];

  const categoryMap: Partial<Record<WorkstationTab, Project['category']>> = {
    hackathons: 'hackathon',
    oxide: 'oxide',
    'rust-desktop': 'rust-desktop',
    'embedded-iot': 'embedded-iot',
    'web-gis': 'web-gis',
  };

  const activeCategory = categoryMap[activeTab];
  const categoryProjects = activeCategory
    ? portfolioProjects.filter((p) => p.category === activeCategory)
    : [];
  const selectedProjectId = activeCategory ? selectedByCategory[activeCategory] : undefined;
  const activeProject =
    categoryProjects.find((p) => p.id === selectedProjectId) || categoryProjects[0];

  const activeObjective =
    motorsportDomains.find((d) => d.id === selectedObjectiveId) || motorsportDomains[0];

  const educationItems = timelineItems.slice(0, 2);
  const experienceAndCertItems = timelineItems.slice(2, 4);

  return (
    <VStack gap={0} hAlign="stretch">
      {/* ======================================================== */}
      {/* 1. TOP STATUS BAR (RESPONSIVE & EXPANDED TO 1640px)      */}
      {/* ======================================================== */}
      <Section variant="section" paddingBlock={1.5} paddingInline={2} dividers={['bottom']}>
        <Center axis="horizontal">
          {isMobile ? (
            <VStack gap={1} width="100%">
              <HStack justify="between" vAlign="center" width="100%">
                <HStack gap={1} vAlign="center">
                  <Heading level={4}>Matteo Benassi</Heading>
                  <Token label="UNIMORE" size="sm" color="purple" />
                </HStack>
                <HStack gap={1} vAlign="center">
                  <Token
                    label={colorMode === 'dark' ? '☀ LIGHT' : '☾ DARK'}
                    size="sm"
                    color="teal"
                    onClick={onToggleColorMode}
                  />
                  <Token
                    label={emailCopied ? 'COPIED!' : 'EMAIL'}
                    size="sm"
                    color="blue"
                    onClick={handleCopyEmail}
                  />
                </HStack>
              </HStack>
              <HStack justify="between" vAlign="center" width="100%">
                <Token label="125/180 ECTS · AVG 27.3/30 (2L)" size="sm" color="gray" />
                <Token label="SYSTEM ONLINE" size="sm" color="green" />
              </HStack>
            </VStack>
          ) : (
            <HStack justify="between" vAlign="center" wrap="wrap" gap={1.5} maxWidth={1640} width="100%">
              {/* Left: Identity & Academic Status */}
              <HStack gap={1} vAlign="center" wrap="wrap">
                <Heading level={4}>Matteo Benassi</Heading>
                <Text type="code" color="secondary">
                  Computer Engineering @ UNIMORE
                </Text>
                <Token label="125/180 ECTS · AVG 27.3/30 (2 HONORS)" size="sm" color="purple" />
                <Token label="SYSTEM ONLINE" size="sm" color="green" />
              </HStack>

              {/* Right: Same-Height Interactive Tokens (Clock, Email, Theme) */}
              <HStack gap={1} vAlign="center" wrap="nowrap">
                <Token label={`${clockTime} UTC+1`} size="sm" color="gray" />
                <Token
                  label={emailCopied ? 'COPIED!' : 'info@benassimatteo.dev'}
                  size="sm"
                  color="blue"
                  onClick={handleCopyEmail}
                />
                <Token
                  label={colorMode === 'dark' ? '☀ LIGHT' : '☾ DARK'}
                  size="sm"
                  color="teal"
                  onClick={onToggleColorMode}
                />
              </HStack>
            </HStack>
          )}
        </Center>
      </Section>

      {/* ======================================================== */}
      {/* 2. MAIN WORKSTATION WORKSPACE (EXPANDED TO 1640px)       */}
      {/* ======================================================== */}
      <Section variant="transparent" paddingBlock={3} paddingInline={2}>
        <Center axis="horizontal">
          <VStack gap={3} maxWidth={1640} width="100%">
            {/* Responsive Navigation: Adaptive Dropdown on Mobile, Sleek Dock on Desktop */}
            {isMobile ? (
              <Card padding={2} variant="default" elevation="low" width="100%">
                <HStack justify="between" vAlign="center" gap={2} width="100%">
                  <StackItem size="fill">
                    <DropdownMenu
                      button={{
                        label: `App: ${currentTabMeta.label}`,
                        size: 'md',
                        variant: 'primary',
                        width: '100%',
                      }}
                      presentation="adaptive"
                      items={WORKSTATION_TABS.map((tab) => ({
                        id: tab.id,
                        label: `${tab.label} (${tab.badge})`,
                        onClick: () => setActiveTab(tab.id),
                      }))}
                    />
                  </StackItem>
                  <Button
                    label="GitHub ↗"
                    size="md"
                    variant="secondary"
                    href="https://github.com/itsmrma"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                </HStack>
              </Card>
            ) : (
              <Card padding={1.5} variant="default" elevation="low" width="100%">
                <HStack justify="between" vAlign="center" gap={1.5} width="100%">
                  <StackItem size="fill">
                    <HStack gap={0.5} vAlign="center" wrap="nowrap">
                      {WORKSTATION_TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                          <Button
                            key={tab.id}
                            label={tab.label}
                            size="sm"
                            variant={isActive ? 'primary' : 'ghost'}
                            onClick={() => setActiveTab(tab.id)}
                          />
                        );
                      })}
                    </HStack>
                  </StackItem>

                  <StackItem size="static">
                    <Button
                      label="GitHub @itsmrma ↗"
                      size="sm"
                      variant="secondary"
                      href="https://github.com/itsmrma"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  </StackItem>
                </HStack>
              </Card>
            )}

            {/* The Workstation Window Frame (Generous Desktop Sizing) */}
            <Card padding={3} variant="default" elevation="med" width="100%">
              <VStack gap={3}>
                {/* Workstation Window Titlebar */}
                <HStack justify="between" vAlign="center" wrap="wrap" gap={2}>
                  <VStack gap={0.5}>
                    <HStack gap={1.5} vAlign="center">
                      <Heading level={3}>{currentTabMeta.filename}</Heading>
                      <Token
                        label={currentTabMeta.badge}
                        size="sm"
                        color={currentTabMeta.badgeColor}
                      />
                    </HStack>
                    <Text type="supporting" color="secondary">
                      {currentTabMeta.subtitle}
                    </Text>
                  </VStack>

                  {activeTab === 'home' && (
                    <HStack gap={1.5} wrap="wrap">
                      <Button
                        label="Download CV (EN) ↗"
                        size="sm"
                        variant="primary"
                        href="/cv/CV_Matteo_Benassi_EN.pdf"
                        target="_blank"
                      />
                      <Button
                        label="Download CV (IT) ↗"
                        size="sm"
                        variant="secondary"
                        href="/cv/CV_Matteo_Benassi_IT.pdf"
                        target="_blank"
                      />
                    </HStack>
                  )}

                  {activeTab === 'contacts' && (
                    <HStack gap={1.5} wrap="wrap">
                      <Button
                        label="Send Email ✉"
                        size="sm"
                        variant="primary"
                        href="mailto:info@benassimatteo.dev"
                      />
                      <Button
                        label={emailCopied ? 'Copied!' : 'Copy Email'}
                        size="sm"
                        variant="secondary"
                        onClick={handleCopyEmail}
                      />
                    </HStack>
                  )}

                  {activeProject && (
                    <HStack gap={1.5} wrap="wrap">
                      {activeProject.liveUrl && (
                        <Button
                          label="Open Live Web App ↗"
                          size="sm"
                          variant="primary"
                          href={activeProject.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      )}
                      {activeProject.githubUrl && (
                        <Button
                          label="View Repository on GitHub ↗"
                          size="sm"
                          variant="secondary"
                          href={activeProject.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      )}
                    </HStack>
                  )}

                  {activeTab === 'curriculum' && (
                    <HStack gap={1.5} wrap="wrap">
                      <Button
                        label="Download CV (EN) ↗"
                        size="sm"
                        variant="primary"
                        href="/cv/CV_Matteo_Benassi_EN.pdf"
                        target="_blank"
                      />
                      <Button
                        label="Download CV (IT) ↗"
                        size="sm"
                        variant="secondary"
                        href="/cv/CV_Matteo_Benassi_IT.pdf"
                        target="_blank"
                      />
                    </HStack>
                  )}

                  {activeTab === 'objectives' && (
                    <Button
                      label="Get in Touch ✉"
                      size="sm"
                      variant="primary"
                      onClick={() => setActiveTab('contacts')}
                    />
                  )}
                </HStack>

                <Divider variant="subtle" />

                {/* ============================================== */}
                {/* TAB 0: HOMEPAGE / WORKSTATION OVERVIEW         */}
                {/* ============================================== */}
                {activeTab === 'home' && (
                  <VStack gap={4} width="100%">
                    {/* Hero Identity Banner Card */}
                    <Card padding={4} variant="muted" width="100%">
                      <VStack gap={3}>
                        <HStack justify="between" vAlign="center" wrap="wrap" gap={1.5}>
                          <HStack gap={1} vAlign="center" wrap="wrap">
                            <Token label="SYSTEM ONLINE" size="sm" color="green" />
                            <Token label="UNIMORE MANTOVA CAMPUS" size="sm" color="purple" />
                            <Token label="B.Sc. COMPUTER ENGINEERING" size="sm" color="blue" />
                          </HStack>
                          <Token label="OPEN TO OPPORTUNITIES" size="sm" color="gray" />
                        </HStack>

                        <VStack gap={1}>
                          <Heading level={1}>Matteo Benassi</Heading>
                          <Heading level={3}>
                            Computer Engineering Student @ UNIMORE · Systems, Rust &amp; Full-Stack Developer
                          </Heading>
                        </VStack>

                        <Text type="body">
                          Third-year Computer Engineering undergraduate at the University of Modena and Reggio Emilia (UNIMORE). Builder of high-performance software, native Rust desktop apps with Tauri 2, bare-metal C firmware on ARM Cortex-M4 microcontrollers, and spatial GIS pipelines. Passionate about software engineering, reliable systems, and dedicated to pursuing a career in the Motorsport &amp; Racing industry.
                        </Text>

                        <Divider variant="subtle" />

                        <HStack justify="between" vAlign="center" wrap="wrap" gap={2}>
                          <HStack gap={1.5} wrap="wrap">
                            <Button
                              label="Download CV (English PDF) ↗"
                              size="md"
                              variant="primary"
                              href="/cv/CV_Matteo_Benassi_EN.pdf"
                              target="_blank"
                            />
                            <Button
                              label="Download CV (Italian PDF) ↗"
                              size="md"
                              variant="secondary"
                              href="/cv/CV_Matteo_Benassi_IT.pdf"
                              target="_blank"
                            />
                            <Button
                              label="Get in Touch ✉"
                              size="md"
                              variant="secondary"
                              onClick={() => setActiveTab('contacts')}
                            />
                            <Button
                              label="GitHub @itsmrma ↗"
                              size="md"
                              variant="ghost"
                              href="https://github.com/itsmrma"
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          </HStack>

                          <Button
                            label={emailCopied ? 'Email Copied!' : 'info@benassimatteo.dev'}
                            size="md"
                            variant="ghost"
                            onClick={handleCopyEmail}
                          />
                        </HStack>
                      </VStack>
                    </Card>

                    {/* Key Metrics Grid (Spacious 4-Card Layout) */}
                    <Grid columns={{ minWidth: 260, max: 4 }} gap={3} width="100%">
                      <Card padding={3} variant="default">
                        <VStack gap={1.5} height="100%" justify="between">
                          <VStack gap={1}>
                            <HStack justify="between" vAlign="center">
                              <Text type="label" color="accent">ACADEMIC TRACK</Text>
                              <Token label="UNIMORE" size="sm" color="purple" />
                            </HStack>
                            <Heading level={2}>125 / 180</Heading>
                            <Text type="code">Weighted Avg: 27.3/30 (2 Honors)</Text>
                          </VStack>
                          <Text type="supporting" color="secondary">
                            On schedule with all sessions. High school diploma 100/100 (top grade) at ITIS "E. Fermi".
                          </Text>
                        </VStack>
                      </Card>

                      <Card padding={3} variant="default">
                        <VStack gap={1.5} height="100%" justify="between">
                          <VStack gap={1}>
                            <HStack justify="between" vAlign="center">
                              <Text type="label" color="accent">HACKATHONS</Text>
                              <Token label="3 PODIUMS" size="sm" color="green" />
                            </HStack>
                            <Heading level={2}>1st &amp; 2x 2nd</Heading>
                            <Text type="code">1st Hack4Water '26 · 2x SCIoTeM</Text>
                          </VStack>
                          <Text type="supporting" color="secondary">
                            Garda Chiese Alert (76k+ ha geofenced), Smart Beam survival ML, and P7M ASN.1 unwrapper.
                          </Text>
                        </VStack>
                      </Card>

                      <Card padding={3} variant="default">
                        <VStack gap={1.5} height="100%" justify="between">
                          <VStack gap={1}>
                            <HStack justify="between" vAlign="center">
                              <Text type="label" color="accent">DESKTOP &amp; RUST</Text>
                              <Token label="TAURI 2" size="sm" color="orange" />
                            </HStack>
                            <Heading level={2}>Oxide &amp; SyncForge</Heading>
                            <Text type="code">Rust, Tauri 2, DSP &amp; MCP</Text>
                          </VStack>
                          <Text type="supporting" color="secondary">
                            Co-developer of Oxide (agentic GUI) and creator of SyncForge (FFT video/audio batch processor).
                          </Text>
                        </VStack>
                      </Card>

                      <Card padding={3} variant="default">
                        <VStack gap={1.5} height="100%" justify="between">
                          <VStack gap={1}>
                            <HStack justify="between" vAlign="center">
                              <Text type="label" color="accent">CAREER OBJECTIVE</Text>
                              <Token label="RACING IT" size="sm" color="red" />
                            </HStack>
                            <Heading level={2}>Motorsport</Heading>
                            <Text type="code">Software, Telemetry &amp; Data Tools</Text>
                          </VStack>
                          <Text type="supporting" color="secondary">
                            Targeting factory R&amp;D, race strategy platforms, low-latency streaming and trackside IT.
                          </Text>
                        </VStack>
                      </Card>
                    </Grid>

                    {/* Workstation Application Modules Quick Launch Grid */}
                    <VStack gap={2} width="100%">
                      <HStack justify="between" vAlign="center">
                        <Heading level={3}>Workstation Applications &amp; Repositories</Heading>
                        <Text type="supporting" color="secondary">
                          Click any module below to inspect architecture, source code &amp; live testbench
                        </Text>
                      </HStack>

                      <Grid columns={{ minWidth: 320, max: 4 }} gap={3} width="100%">
                        {/* Card 1: Hackathons */}
                        <Card padding={3} variant="default">
                          <VStack gap={3} height="100%" justify="between">
                            <VStack gap={1.5}>
                              <HStack justify="between" vAlign="center">
                                <Heading level={4}>Hackathon Showcase</Heading>
                                <Token label="3 Podiums" size="sm" color="green" />
                              </HStack>
                              <Text type="code" color="accent">Hackathon_Showcase.app</Text>
                              <Text type="body">
                                Podium projects engineered under tight 72h deadlines: Garda Chiese Alert (PostGIS + Gemini AI), Smart Beam (Cox survival analysis), and P7M cryptographic unwrapper.
                              </Text>
                            </VStack>
                            <VStack paddingBlockStart={1.5} width="100%">
                              <Button
                                label="Launch Hackathon Showcase ↵"
                                size="sm"
                                variant="secondary"
                                width="100%"
                                onClick={() => setActiveTab('hackathons')}
                              />
                            </VStack>
                          </VStack>
                        </Card>

                        {/* Card 2: Oxide */}
                        <Card padding={3} variant="default">
                          <VStack gap={3} height="100%" justify="between">
                            <VStack gap={1.5}>
                              <HStack justify="between" vAlign="center">
                                <Heading level={4}>Oxide Agentic IDE</Heading>
                                <Token label="Rust + Tauri 2" size="sm" color="orange" />
                              </HStack>
                              <Text type="code" color="accent">getoxide/oxide</Text>
                              <Text type="body">
                                Open-source desktop GUI co-developed with Lorenzo Cavallini driving Claude Code, Codex, and Antigravity CLI side by side in Git worktrees with deterministic verification dossiers.
                              </Text>
                            </VStack>
                            <VStack paddingBlockStart={1.5} width="100%">
                              <Button
                                label="Inspect Oxide ↵"
                                size="sm"
                                variant="secondary"
                                width="100%"
                                onClick={() => setActiveTab('oxide')}
                              />
                            </VStack>
                          </VStack>
                        </Card>

                        {/* Card 3: Rust & Desktop */}
                        <Card padding={3} variant="default">
                          <VStack gap={3} height="100%" justify="between">
                            <VStack gap={1.5}>
                              <HStack justify="between" vAlign="center">
                                <Heading level={4}>Rust &amp; Desktop Suite</Heading>
                                <Token label="Native Rust" size="sm" color="teal" />
                              </HStack>
                              <Text type="code" color="accent">SyncForge · scrobbl.rs</Text>
                              <Text type="body">
                                Native systems applications: SyncForge v3.5 (FFT audio sync, CLI &amp; MCP server), scrobbl.rs (self-hosted music archive), and AMD Fan Control (ADL Overdrive8 utility).
                              </Text>
                            </VStack>
                            <VStack paddingBlockStart={1.5} width="100%">
                              <Button
                                label="Open Rust Suite ↵"
                                size="sm"
                                variant="secondary"
                                width="100%"
                                onClick={() => setActiveTab('rust-desktop')}
                              />
                            </VStack>
                          </VStack>
                        </Card>

                        {/* Card 4: Embedded Systems */}
                        <Card padding={3} variant="default">
                          <VStack gap={3} height="100%" justify="between">
                            <VStack gap={1.5}>
                              <HStack justify="between" vAlign="center">
                                <Heading level={4}>Embedded &amp; IoT Lab</Heading>
                                <Token label="ARM Cortex-M4" size="sm" color="blue" />
                              </HStack>
                              <Text type="code" color="accent">STM32 · HASS · TrueNAS</Text>
                              <Text type="body">
                                Deterministic bare-metal C firmware on STM32 Discovery board (zero-OS, &lt;16KB RAM), Viessmann Home Assistant Supervisor add-on, and TrueNAS ZFS server.
                              </Text>
                            </VStack>
                            <VStack paddingBlockStart={1.5} width="100%">
                              <Button
                                label="Enter Embedded Lab ↵"
                                size="sm"
                                variant="secondary"
                                width="100%"
                                onClick={() => setActiveTab('embedded-iot')}
                              />
                            </VStack>
                          </VStack>
                        </Card>

                        {/* Card 5: Web & GIS */}
                        <Card padding={3} variant="default">
                          <VStack gap={3} height="100%" justify="between">
                            <VStack gap={1.5}>
                              <HStack justify="between" vAlign="center">
                                <Heading level={4}>Web &amp; Spatial GIS</Heading>
                                <Token label="Full-Stack &amp; GIS" size="sm" color="purple" />
                              </HStack>
                              <Text type="code" color="accent">Music History · Sagre</Text>
                              <Text type="body">
                                Music History Analyzer (client-side privacy), Sagre in Lombardia Open Data GIS cartography, UNIMORE Music Library (Django + uv), and MazeGame 2D (Java 21 + JavaFX).
                              </Text>
                            </VStack>
                            <VStack paddingBlockStart={1.5} width="100%">
                              <Button
                                label="Explore Web &amp; GIS ↵"
                                size="sm"
                                variant="secondary"
                                width="100%"
                                onClick={() => setActiveTab('web-gis')}
                              />
                            </VStack>
                          </VStack>
                        </Card>

                        {/* Card 6: Career Objectives */}
                        <Card padding={3} variant="default">
                          <VStack gap={3} height="100%" justify="between">
                            <VStack gap={1.5}>
                              <HStack justify="between" vAlign="center">
                                <Heading level={4}>Career Objectives</Heading>
                                <Token label="Motorsport &amp; Racing" size="sm" color="red" />
                              </HStack>
                              <Text type="code" color="accent">Motorsport_Career.cfg</Text>
                              <Text type="body">
                                Vision and competencies for engineering roles in Motorsport: full-stack tooling, race session data analytics, telemetry acquisition, and track-to-factory systems infrastructure.
                              </Text>
                            </VStack>
                            <VStack paddingBlockStart={1.5} width="100%">
                              <Button
                                label="View Career Objectives ↵"
                                size="sm"
                                variant="secondary"
                                width="100%"
                                onClick={() => setActiveTab('objectives')}
                              />
                            </VStack>
                          </VStack>
                        </Card>

                        {/* Card 7: Curriculum Vitae */}
                        <Card padding={3} variant="default">
                          <VStack gap={3} height="100%" justify="between">
                            <VStack gap={1.5}>
                              <HStack justify="between" vAlign="center">
                                <Heading level={4}>Curriculum Vitae</Heading>
                                <Token label="125/180 ECTS" size="sm" color="blue" />
                              </HStack>
                              <Text type="code" color="accent">Curriculum_Vitae.pdf</Text>
                              <Text type="body">
                                Academic record at UNIMORE (Weighted Average 27.3/30 with 2 Honors), 100/100 ITIS Fermi diploma, Novellini S.p.A. enterprise IT experience, and Cambridge B2 certification.
                              </Text>
                            </VStack>
                            <VStack paddingBlockStart={1.5} width="100%">
                              <Button
                                label="Inspect Curriculum ↵"
                                size="sm"
                                variant="secondary"
                                width="100%"
                                onClick={() => setActiveTab('curriculum')}
                              />
                            </VStack>
                          </VStack>
                        </Card>

                        {/* Card 8: Contacts & Inquiries */}
                        <Card padding={3} variant="default">
                          <VStack gap={3} height="100%" justify="between">
                            <VStack gap={1.5}>
                              <HStack justify="between" vAlign="center">
                                <Heading level={4}>Contacts &amp; Matrix</Heading>
                                <Token label="Direct Channels" size="sm" color="green" />
                              </HStack>
                              <Text type="code" color="accent">Communications_Directory.net</Text>
                              <Text type="body">
                                Direct email (info@benassimatteo.dev), GitHub profile (@itsmrma), UNIMORE academic coordinates, and in-browser message dispatcher for engineering inquiries.
                              </Text>
                            </VStack>
                            <VStack paddingBlockStart={1.5} width="100%">
                              <Button
                                label="Open Contacts Matrix ↵"
                                size="sm"
                                variant="secondary"
                                width="100%"
                                onClick={() => setActiveTab('contacts')}
                              />
                            </VStack>
                          </VStack>
                        </Card>
                      </Grid>
                    </VStack>

                    {/* Technical Stack Overview Cloud */}
                    <Card padding={3} variant="muted" width="100%">
                      <VStack gap={2}>
                        <HStack justify="between" vAlign="center" wrap="wrap" gap={1}>
                          <Text type="label" color="accent">CORE ENGINEERING STACK &amp; METHODOLOGIES</Text>
                          <Token label="PRODUCTION &amp; ACADEMIC" size="sm" color="gray" />
                        </HStack>
                        <HStack wrap="wrap" gap={1}>
                          <Token label="Rust" size="sm" color="orange" />
                          <Token label="C / C++ (POSIX Threads, Makefiles)" size="sm" color="blue" />
                          <Token label="STM32 ARM Cortex-M4 (Bare-Metal)" size="sm" color="teal" />
                          <Token label="Python &amp; Django REST" size="sm" color="blue" />
                          <Token label="PostgreSQL &amp; PostGIS Spatial" size="sm" color="green" />
                          <Token label="Tauri 2 (macOS &amp; Windows)" size="sm" color="teal" />
                          <Token label="TypeScript &amp; React 19" size="sm" color="purple" />
                          <Token label="Google Gemini Multimodal API" size="sm" color="purple" />
                          <Token label="scikit-learn &amp; XGBoost" size="sm" color="orange" />
                          <Token label="Linux, Docker &amp; TrueNAS ZFS" size="sm" color="gray" />
                          <Token label="Git Worktrees &amp; CI/CD" size="sm" color="green" />
                        </HStack>
                      </VStack>
                    </Card>
                  </VStack>
                )}

                {/* ============================================== */}
                {/* PROJECT CATEGORY TABS (HACKATHONS, OXIDE,      */}
                {/* RUST & DESKTOP, EMBEDDED & IOT, WEB & GIS)     */}
                {/* ============================================== */}
                {activeCategory && activeProject && (
                  <VStack gap={3}>
                    {/* Sub-Tab Selector Bar */}
                    <HStack gap={1.5} wrap="wrap" width="100%">
                      {categoryProjects.map((proj) => (
                        <Button
                          key={proj.id}
                          label={proj.tabLabel}
                          size="sm"
                          variant={activeProject.id === proj.id ? 'primary' : 'secondary'}
                          onClick={() =>
                            setSelectedByCategory((prev) => ({
                              ...prev,
                              [activeCategory]: proj.id,
                            }))
                          }
                        />
                      ))}
                    </HStack>

                    <Grid columns={{ minWidth: 280, max: 2 }} gap={3} align="stretch" width="100%">
                      {/* Left Column: Project Specification Card */}
                      <Card padding={3} variant="muted" width="100%">
                        <VStack gap={3} height="100%" justify="between">
                          <VStack gap={2}>
                            <HStack justify="between" vAlign="center" wrap="wrap" gap={1}>
                              {activeProject.award && (
                                <Token
                                  label={activeProject.award}
                                  size="sm"
                                  color={activeProject.awardColor || 'blue'}
                                />
                              )}
                              {activeProject.metrics && (
                                <Token label={activeProject.metrics} size="sm" color="gray" />
                              )}
                            </HStack>

                            <Heading level={2}>{activeProject.title}</Heading>
                            <Text type="code" color="accent">
                              {activeProject.subtitle}
                            </Text>

                            <Text type="body">{activeProject.description}</Text>
                            <Text type="supporting" color="secondary">
                              {activeProject.architectureDetails}
                            </Text>
                          </VStack>

                          <VStack gap={1.5}>
                            <Text type="label" color="accent">
                              TECH STACK &amp; ARCHITECTURE
                            </Text>
                            <HStack wrap="wrap" gap={1}>
                              {activeProject.tags.map((t) => (
                                <Token key={t.label} label={t.label} size="sm" color={t.color} />
                              ))}
                            </HStack>
                          </VStack>
                        </VStack>
                      </Card>

                      {/* Right Column: Interactive Testbench & Full-Space Terminal */}
                      <Card padding={3} variant="default" width="100%">
                        <VStack gap={2} height="100%">
                          <VStack gap={1.5}>
                            <HStack justify="between" vAlign="center">
                              <Heading level={4}>{activeProject.testbenchTitle}</Heading>
                              <Token
                                label={
                                  activeTestbenches[activeProject.id]
                                    ? 'ACTIVE OUTPUT'
                                    : activeProject.testbenchBadge
                                }
                                size="sm"
                                color={activeTestbenches[activeProject.id] ? 'green' : 'blue'}
                              />
                            </HStack>

                            <Text type="supporting" color="secondary">
                              {activeProject.testbenchDesc}
                            </Text>

                            <Button
                              label={
                                activeTestbenches[activeProject.id]
                                  ? activeProject.testbenchBtnActiveLabel || 'Reset Simulation'
                                  : activeProject.testbenchBtnLabel
                              }
                              size="sm"
                              variant={
                                activeTestbenches[activeProject.id] ? 'secondary' : 'primary'
                              }
                              width="100%"
                              onClick={() => toggleProjectTestbench(activeProject.id)}
                            />
                          </VStack>

                          <CodeBlock
                            title={activeProject.codeTitle}
                            hasLanguageLabel={false}
                            width="100%"
                            code={
                              activeTestbenches[activeProject.id]
                                ? activeProject.codeActive
                                : activeProject.codeDefault
                            }
                            language={activeProject.codeLanguage}
                          />

                          <Card padding={2} variant="muted" width="100%">
                            <HStack justify="between" vAlign="center" wrap="wrap" gap={1}>
                              <Text type="code" color="secondary">
                                Pipeline Verification: Deterministic Output
                              </Text>
                              <Token label={activeProject.metrics || 'Verified'} size="sm" color="gray" />
                            </HStack>
                          </Card>
                        </VStack>
                      </Card>
                    </Grid>
                  </VStack>
                )}

                {/* ============================================== */}
                {/* TAB 6: CURRICULUM VITAE (BALANCED 2-COLUMN)    */}
                {/* ============================================== */}
                {activeTab === 'curriculum' && (
                  <Grid columns={{ minWidth: 280, max: 2 }} gap={3} align="stretch" width="100%">
                    {/* Left Column: Academic Education */}
                    <Card padding={3} variant="muted" width="100%">
                      <VStack gap={3} height="100%" justify="between">
                        <VStack gap={3}>
                          <HStack justify="between" vAlign="center">
                            <Heading level={4}>Academic Education</Heading>
                            <Token label="UNIMORE & ITIS FERMI" size="sm" color="purple" />
                          </HStack>
                          <Divider variant="subtle" />

                          <VStack gap={3}>
                            {educationItems.map((item, idx) => (
                              <VStack key={idx} gap={1}>
                                <HStack justify="between" vAlign="center" wrap="wrap" gap={1}>
                                  <Heading level={4}>{item.title}</Heading>
                                  <Token label={item.period} size="sm" color="gray" />
                                </HStack>

                                <Text type="code" color="accent">
                                  {item.institution}
                                </Text>

                                <HStack gap={1}>
                                  <Token
                                    label={item.badge}
                                    size="sm"
                                    color={item.badgeColor}
                                  />
                                </HStack>

                                <Text type="supporting" color="secondary">
                                  {item.details}
                                </Text>
                                {idx < educationItems.length - 1 && <Divider variant="subtle" />}
                              </VStack>
                            ))}
                          </VStack>
                        </VStack>

                        <Card padding={2} variant="default">
                          <HStack justify="between" vAlign="center" wrap="wrap" gap={1}>
                            <Text type="code" color="secondary">
                              Mantova, Italy · Full-Time Student
                            </Text>
                            <Token label="ON TRACK · 2 HONORS (30L)" size="sm" color="green" />
                          </HStack>
                        </Card>
                      </VStack>
                    </Card>

                    {/* Right Column: Experience, Certifications & Technical Stack */}
                    <Card padding={3} variant="default" width="100%">
                      <VStack gap={3} height="100%" justify="between">
                        <VStack gap={3}>
                          <HStack justify="between" vAlign="center">
                            <Heading level={4}>Experience &amp; Certifications</Heading>
                            <Token label="INDUSTRY & LANGUAGES" size="sm" color="teal" />
                          </HStack>
                          <Divider variant="subtle" />

                          <VStack gap={3}>
                            {experienceAndCertItems.map((item, idx) => (
                              <VStack key={idx} gap={1}>
                                <HStack justify="between" vAlign="center" wrap="wrap" gap={1}>
                                  <Heading level={4}>{item.title}</Heading>
                                  <Token label={item.period} size="sm" color="gray" />
                                </HStack>

                                <Text type="code" color="accent">
                                  {item.institution}
                                </Text>

                                <HStack gap={1}>
                                  <Token
                                    label={item.badge}
                                    size="sm"
                                    color={item.badgeColor}
                                  />
                                </HStack>

                                <Text type="supporting" color="secondary">
                                  {item.details}
                                </Text>
                                {idx < experienceAndCertItems.length - 1 && (
                                  <Divider variant="subtle" />
                                )}
                              </VStack>
                            ))}
                          </VStack>
                        </VStack>

                        <Card padding={2} variant="muted">
                          <VStack gap={1.5}>
                            <Text type="label" color="accent">
                              CORE TECHNICAL STACK
                            </Text>
                            <HStack wrap="wrap" gap={1}>
                              <Token label="Rust & Tauri 2" size="sm" color="orange" />
                              <Token label="C / C++ & STM32" size="sm" color="blue" />
                              <Token label="Python & Django" size="sm" color="teal" />
                              <Token label="TypeScript & React" size="sm" color="purple" />
                              <Token label="PostgreSQL / PostGIS" size="sm" color="green" />
                              <Token label="Linux & TrueNAS ZFS" size="sm" color="gray" />
                            </HStack>
                          </VStack>
                        </Card>
                      </VStack>
                    </Card>
                  </Grid>
                )}

                {/* ============================================== */}
                {/* TAB 7: CAREER OBJECTIVES (BROAD MOTORSPORT)    */}
                {/* ============================================== */}
                {activeTab === 'objectives' && (
                  <VStack gap={3} width="100%">
                    {/* Sub-Tab Selector Bar */}
                    <HStack gap={1.5} wrap="wrap" width="100%">
                      {motorsportDomains.map((dom) => (
                        <Button
                          key={dom.id}
                          label={dom.tabLabel}
                          size="sm"
                          variant={activeObjective.id === dom.id ? 'primary' : 'secondary'}
                          onClick={() => setSelectedObjectiveId(dom.id)}
                        />
                      ))}
                    </HStack>

                    <Grid columns={{ minWidth: 280, max: 2 }} gap={3} align="stretch" width="100%">
                      {/* Left: Motorsport Career Vision */}
                      <Card padding={3} variant="muted" width="100%">
                        <VStack gap={3} height="100%" justify="between">
                          <VStack gap={2}>
                            <HStack justify="between" vAlign="center" wrap="wrap" gap={1}>
                              <Token
                                label={activeObjective.badge}
                                size="sm"
                                color={activeObjective.badgeColor}
                              />
                              <Token label="MOTORSPORT & AUTOMOTIVE" size="sm" color="gray" />
                            </HStack>

                            <Heading level={2}>{activeObjective.title}</Heading>
                            <Text type="body">{activeObjective.statement}</Text>
                            <Text type="supporting" color="secondary">
                              {activeObjective.context}
                            </Text>
                          </VStack>

                          <VStack gap={1.5}>
                            <Text type="label" color="accent">
                              AREAS OF INTEREST IN MOTORSPORT
                            </Text>
                            <HStack wrap="wrap" gap={1}>
                              {activeObjective.tags.map((tag) => (
                                <Token key={tag} label={tag} size="sm" color="blue" />
                              ))}
                            </HStack>
                          </VStack>
                        </VStack>
                      </Card>

                      {/* Right: Full-Space Engineering Profile & Domain Terminal */}
                      <Card padding={3} variant="default" width="100%">
                        <VStack gap={2} height="100%">
                          <VStack gap={1.5}>
                            <HStack justify="between" vAlign="center">
                              <Heading level={4}>Motorsport Engineering Alignment</Heading>
                              <Token label="ENGINEERING R&D" size="sm" color="green" />
                            </HStack>
                            <Text type="supporting" color="secondary">
                              How my software engineering projects, hackathon victories, and UNIMORE formation map to a racing team’s technical departments:
                            </Text>
                          </VStack>

                          <CodeBlock
                            title={activeObjective.codeTitle}
                            hasLanguageLabel={false}
                            width="100%"
                            code={activeObjective.codeSnippet}
                            language="yaml"
                          />

                          <Card padding={2} variant="muted" width="100%">
                            <HStack justify="between" vAlign="center" wrap="wrap" gap={1}>
                              <Text type="code" color="secondary">
                                Focus: Racing Software, Data Platforms &amp; Telemetry
                              </Text>
                              <Token label="MOTORSPORT AMBITION" size="sm" color="red" />
                            </HStack>
                          </Card>
                        </VStack>
                      </Card>
                    </Grid>
                  </VStack>
                )}

                {/* ============================================== */}
                {/* TAB 8: TERMINAL (UNIFIED FULL-WIDTH CONSOLE)   */}
                {/* ============================================== */}
                {activeTab === 'terminal' && (
                  <VStack gap={3} width="100%">
                    {/* Top Command Preset Toolbar */}
                    <HStack justify="between" vAlign="center" gap={1.5} width="100%">
                      <HStack gap={1} wrap="wrap" width="100%">
                        {(
                          [
                            'home',
                            'neofetch',
                            'oxide',
                            'repos',
                            'hackathons',
                            'stack',
                            'objectives',
                            'whoami',
                            'contacts',
                          ] as const
                        ).map((cmd) => (
                          <Button
                            key={cmd}
                            label={`./${cmd}`}
                            size="sm"
                            variant={activeCliCommand === cmd ? 'primary' : 'secondary'}
                            onClick={() => handleRunCommand(cmd)}
                          />
                        ))}
                      </HStack>

                      <HStack gap={1} wrap="nowrap">
                        <Button
                          label="help"
                          size="sm"
                          variant={activeCliCommand === 'help' ? 'primary' : 'ghost'}
                          onClick={() => handleRunCommand('help')}
                        />
                        <Button
                          label="reset"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRunCommand('clear')}
                        />
                      </HStack>
                    </HStack>

                    {/* Unified Full-Space Terminal Viewport */}
                    <CodeBlock
                      title="matteo@benassios: ~ (zsh 5.9 — UNIMORE Workstation)"
                      hasLanguageLabel={false}
                      width="100%"
                      code={cliTranscript}
                      language="bash"
                    />

                    {/* Interactive Command Input Prompt */}
                    <HStack gap={1.5} vAlign="center" width="100%">
                      <Token label="~$" size="sm" color="green" />
                      <StackItem size="fill">
                        <TextInput
                          label="Terminal command input"
                          isLabelHidden
                          size="sm"
                          width="100%"
                          value={terminalInput}
                          onChange={(val) => setTerminalInput(val)}
                          onEnter={handleTerminalSubmit}
                        />
                      </StackItem>
                      <Button
                        label="Run ↵"
                        size="sm"
                        variant="primary"
                        onClick={handleTerminalSubmit}
                      />
                    </HStack>
                  </VStack>
                )}

                {/* ============================================== */}
                {/* TAB 9: CONTACTS & DIRECT COMMUNICATIONS        */}
                {/* ============================================== */}
                {activeTab === 'contacts' && (
                  <VStack gap={3} width="100%">
                    {/* Banner Card */}
                    <Card padding={3} variant="muted" width="100%">
                      <VStack gap={2}>
                        <HStack justify="between" vAlign="center" wrap="wrap" gap={1}>
                          <HStack gap={1} vAlign="center" wrap="wrap">
                            <Token label="COMMUNICATIONS MATRIX" size="sm" color="blue" />
                            <Token label="STATUS: ACTIVE" size="sm" color="green" />
                          </HStack>
                          <Token label="RESPONSE: < 24 HOURS" size="sm" color="gray" />
                        </HStack>

                        <Heading level={2}>Direct Contact &amp; Engineering Inquiries</Heading>
                        <Text type="body">
                          Third-year Computer Engineering undergraduate at UNIMORE (Mantova Campus), available for engineering roles, technical collaboration, and opportunities in the Motorsport and high-performance software industry.
                        </Text>
                        <Text type="supporting" color="secondary">
                          Reach out directly via email, explore my GitHub repositories, or compose an inquiry using the interactive communicator below.
                        </Text>
                      </VStack>
                    </Card>

                    <Grid columns={{ minWidth: 280, max: 2 }} gap={3} align="stretch" width="100%">
                      {/* Left Column: Direct Coordinates & Credentials */}
                      <Card padding={3} variant="muted" width="100%">
                        <VStack gap={3} height="100%" justify="between">
                          <VStack gap={3}>
                            {/* Primary Email */}
                            <VStack gap={1}>
                              <HStack justify="between" vAlign="center" wrap="wrap" gap={1}>
                                <Heading level={4}>Primary Direct Email</Heading>
                                <Token label="DIRECT CHANNEL" size="sm" color="green" />
                              </HStack>
                              <Text type="code" color="accent">
                                info@benassimatteo.dev
                              </Text>
                              <Text type="supporting" color="secondary">
                                Monitored daily. Best channel for formal engineering inquiries, technical discussions, and project proposals.
                              </Text>
                              <HStack gap={1} wrap="wrap">
                                <Button
                                  label="Open Mail Client ✉"
                                  size="sm"
                                  variant="primary"
                                  href="mailto:info@benassimatteo.dev"
                                />
                                <Button
                                  label={emailCopied ? 'Address Copied!' : 'Copy Address'}
                                  size="sm"
                                  variant="secondary"
                                  onClick={handleCopyEmail}
                                />
                              </HStack>
                            </VStack>

                            <Divider variant="subtle" />

                            {/* GitHub & Open-Source */}
                            <VStack gap={1}>
                              <HStack justify="between" vAlign="center" wrap="wrap" gap={1}>
                                <Heading level={4}>GitHub &amp; Open-Source Profile</Heading>
                                <Token label="@itsmrma" size="sm" color="purple" />
                              </HStack>
                              <Text type="code" color="accent">
                                https://github.com/itsmrma
                              </Text>
                              <Text type="supporting" color="secondary">
                                Public repositories, pull requests, and commit logs across Rust, Tauri 2, Python/Django, STM32 C, and web platforms. Co-developer of getoxide/oxide.
                              </Text>
                              <Button
                                label="Explore GitHub Repositories ↗"
                                size="sm"
                                variant="secondary"
                                href="https://github.com/itsmrma"
                                target="_blank"
                                rel="noopener noreferrer"
                              />
                            </VStack>

                            <Divider variant="subtle" />

                            {/* Academic Base & Location */}
                            <VStack gap={1}>
                              <HStack justify="between" vAlign="center" wrap="wrap" gap={1}>
                                <Heading level={4}>Academic Institution &amp; Base</Heading>
                                <Token label="UNIMORE MANTOVA" size="sm" color="teal" />
                              </HStack>
                              <Text type="body">
                                <strong>Università di Modena e Reggio Emilia (UNIMORE)</strong><br />
                                Dipartimento di Scienze Fisiche, Informatiche e Matematiche (Mantova Campus)
                              </Text>
                              <Text type="supporting" color="secondary">
                                Location: Motteggiana (Mantova), Italy. In close proximity to the Italian Motor Valley (Modena, Maranello, Bologna, Reggio Emilia, Brescia).
                              </Text>
                            </VStack>
                          </VStack>

                          {/* Curriculum PDF Quick Links */}
                          <Card padding={2} variant="default" width="100%">
                            <HStack justify="between" vAlign="center" wrap="wrap" gap={1}>
                              <Text type="code" color="secondary">
                                Curriculum Vitae:
                              </Text>
                              <HStack gap={1} wrap="wrap">
                                <Button
                                  label="English CV (PDF) ↗"
                                  size="sm"
                                  variant="secondary"
                                  href="/cv/CV_Matteo_Benassi_EN.pdf"
                                  target="_blank"
                                />
                                <Button
                                  label="Italian CV (PDF) ↗"
                                  size="sm"
                                  variant="secondary"
                                  href="/cv/CV_Matteo_Benassi_IT.pdf"
                                  target="_blank"
                                />
                              </HStack>
                            </HStack>
                          </Card>
                        </VStack>
                      </Card>

                      {/* Right Column: In-Browser Message Communicator & Transmission Terminal */}
                      <Card padding={3} variant="default" width="100%">
                        <VStack gap={2} height="100%">
                          <HStack justify="between" vAlign="center">
                            <Heading level={4}>In-App Message Communicator</Heading>
                            <Token
                              label={contactDispatched ? 'DISPATCHED' : 'READY TO COMPOSE'}
                              size="sm"
                              color={contactDispatched ? 'green' : 'blue'}
                            />
                          </HStack>

                          <Text type="supporting" color="secondary">
                            Compose a message below. You can dispatch it directly via your default email client or copy the formatted text.
                          </Text>

                          {/* Form Fields using Astryx TextInput and TextArea */}
                          <VStack gap={1.5} width="100%">
                            <TextInput
                              label="Your Name or Organization"
                              size="sm"
                              width="100%"
                              placeholder="e.g. Scuderia / Engineering Team / Recruiter"
                              value={contactName}
                              onChange={(val) => setContactName(val)}
                            />

                            <TextInput
                              label="Your Email Address"
                              size="sm"
                              width="100%"
                              placeholder="e.g. your.email@company.com"
                              value={contactEmail}
                              onChange={(val) => setContactEmail(val)}
                            />

                            {/* Quick Topic Chips */}
                            <VStack gap={0.5} width="100%">
                              <Text type="label" color="secondary">
                                INQUIRY TOPIC
                              </Text>
                              <HStack wrap="wrap" gap={1}>
                                {(
                                  [
                                    'Software Engineering',
                                    'Motorsport Projects',
                                    'Rust & Systems Software',
                                    'General Inquiry',
                                  ] as const
                                ).map((topic) => (
                                  <Button
                                    key={topic}
                                    label={topic}
                                    size="sm"
                                    variant={contactCategory === topic ? 'primary' : 'secondary'}
                                    onClick={() => setContactCategory(topic)}
                                  />
                                ))}
                              </HStack>
                            </VStack>

                            <TextArea
                              label="Message / Project Details"
                              size="sm"
                              width="100%"
                              placeholder="Describe the opportunity, engineering project, or question..."
                              value={contactMessage}
                              onChange={(val) => setContactMessage(val)}
                            />
                          </VStack>

                          {/* Action Buttons */}
                          <HStack gap={1.5} width="100%" wrap="wrap">
                            <StackItem size="fill">
                              <Button
                                label="Dispatch via Email Client ✉"
                                size="sm"
                                variant="primary"
                                width="100%"
                                onClick={handleDispatchContact}
                              />
                            </StackItem>
                            <Button
                              label={messageCopied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}
                              size="sm"
                              variant="secondary"
                              onClick={handleCopyMessage}
                            />
                          </HStack>

                          {/* Real-time Dispatch Terminal Log */}
                          <CodeBlock
                            title="communications_dispatcher.log"
                            hasLanguageLabel={false}
                            width="100%"
                            code={contactLog}
                            language="bash"
                          />
                        </VStack>
                      </Card>
                    </Grid>
                  </VStack>
                )}
              </VStack>
            </Card>

            {/* Clean Footer */}
            <HStack justify="between" vAlign="center" wrap="wrap" gap={2}>
              <Text type="supporting" color="secondary">
                © {new Date().getFullYear()} Matteo Benassi · Computer Engineering B.Sc. student @ UNIMORE
              </Text>

              <HStack gap={1.5} vAlign="center">
                <Button
                  label="info@benassimatteo.dev"
                  size="sm"
                  variant="ghost"
                  onClick={() => setActiveTab('contacts')}
                />
                <Button
                  label="GitHub: @itsmrma ↗"
                  size="sm"
                  variant="ghost"
                  href="https://github.com/itsmrma"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              </HStack>
            </HStack>
          </VStack>
        </Center>
      </Section>
    </VStack>
  );
}
