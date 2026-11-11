export interface FeaturedProject {
  id: string;
  title: string;
  year: string;
  tagline: string;
  description: string;
  stack: string;
  href: string;
  badge?: string;
  highlight?: boolean;
}

export interface OtherProject {
  id: string;
  name: string;
  desc: string;
  award?: string;
  href: string;
  isLive?: boolean;
}

export interface PathItem {
  period: string;
  title: string;
  institution: string;
  detail?: string;
}

export interface RecognitionItem {
  placement: string;
  event: string;
  project: string;
  year: string;
}

export interface MilestoneItem {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  stack?: string;
  href?: string;
  isMajor?: boolean;
  isLargest?: boolean;
  isInProgress?: boolean;
  isFinish?: boolean;
}

export const IDENTITY = {
  name: 'Matteo Benassi',
  role: 'Computer Engineering student · Rust & systems developer',
  location: 'Mantova, Italy',
  manifesto:
    'I build fast, reliable software — from Rust desktop apps to bare-metal C. Next stop: motorsport.',
  bio:
    "I'm a Computer Engineering student at the University of Modena and Reggio Emilia, Mantova campus. I've won three hackathon podiums, I contribute to open-source Rust tools, and I want to build software for racing teams.",
  availability: 'Open to a curricular internship in 2026/27.',
  lastUpdated: 'November 2026',
};

export const METRICS = [
  { value: '1st place', label: 'Hack4Water 2026' },
  { value: '2nd place', label: 'SCIoTeM 2026 & 2025' },
  { value: '27.3/30', label: 'average · 125/180 ECTS' },
  { value: '100/100', label: 'high-school diploma' },
];

export const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    id: 'oxide',
    title: 'Oxide',
    year: '2026 · now',
    tagline: 'Core contributor',
    description:
      'Open-source desktop app that runs Claude Code, Codex and Antigravity side by side in isolated Git worktrees, and checks every agent turn before merge.',
    stack: 'Rust · Tauri 2 · React',
    href: 'https://github.com/getoxide/oxide',
    badge: 'Core contributor',
    highlight: true,
  },
  {
    id: 'syncforge',
    title: 'SyncForge',
    year: '2026',
    tagline: 'Audio & subtitle synchronization',
    description:
      'Desktop app and CLI that aligns audio and subtitle tracks with FFT cross-correlation and remuxes MKV files losslessly. Ships with an MCP server.',
    stack: 'Rust · Tauri 2 · FFmpeg',
    href: 'https://github.com/itsmrma/SyncForge',
  },
  {
    id: 'garda-chiese',
    title: 'Garda Chiese Alert',
    year: '2026',
    tagline: '1st place, Hack4Water 2026',
    description:
      'Citizen reporting platform for a 76,645-hectare water basin: GPS, photos and voice reports triaged with PostGIS and Gemini. Built in 72 hours.',
    stack: 'Django · PostGIS · React',
    href: 'https://github.com/cavallinilorenzo/alert-app-garda-chiese',
    badge: '1st place, Hack4Water 2026',
  },
  {
    id: 'stm32',
    title: 'STM32 Smart Garden',
    year: '2026',
    tagline: 'Bare-metal C firmware',
    description:
      'Bare-metal C irrigation firmware for an ARM Cortex-M4: no OS, under 16 KB of SRAM, checks the rain forecast over Wi-Fi before opening the valves.',
    stack: 'C · STM32 · TCP/IP',
    href: 'https://github.com/itsmrma/STM32CentralinaGettiniWiFI',
  },
  {
    id: 'scrobbl',
    title: 'scrobbl.rs',
    year: '2026',
    tagline: 'Self-hosted listening archive & daemon',
    description:
      'Single-owner, self-hosted music listening archive and analytics daemon. Collects Spotify plays in the background, ingests multi-year JSON streaming archives, and serves high-throughput personal rankings and activity charts.',
    stack: 'Rust · SQLite WAL · React · Axum',
    href: 'https://github.com/itsmrma/scrobbl-rs',
    badge: 'Creator · Active',
  },
];

export const OTHER_PROJECTS: OtherProject[] = [
  {
    id: 'smart-beam',
    name: 'Smart Beam',
    desc: 'predictive maintenance for street lighting',
    award: '2nd, SCIoTeM 2026',
    href: 'https://github.com/cavallinilorenzo/street-lighting-predictive-maintenance',
  },
  {
    id: 'p7m-summarizer',
    name: 'P7M AI Summarizer',
    desc: 'unwraps signed .p7m files, summarizes them',
    award: '2nd, SCIoTeM 2025',
    href: 'https://github.com/itsmrma/hackathon-p7m-ai-summarizer',
  },
  {
    id: 'music-analyzer',
    name: 'Music History Analyzer',
    desc: 'Spotify history explorer',
    href: 'https://spotify-history-analyzer.benassimatteo.dev',
    isLive: true,
  },
  {
    id: 'amd-fan',
    name: 'AMD Fan Control',
    desc: 'GPU fan curves via Rust FFI',
    href: 'https://github.com/itsmrma/amd-fan-control',
  },
  {
    id: 'viessmann',
    name: 'Viessmann Dashboard',
    desc: 'Home Assistant add-on for a heat pump',
    href: 'https://github.com/itsmrma/viesmann-dashboard-hass',
  },
  {
    id: 'truenas',
    name: 'TrueNAS home lab',
    desc: 'ZFS storage and self-hosted services',
    href: 'https://github.com/itsmrma/benpie',
  },
];

export const RECOGNITION: RecognitionItem[] = [
  {
    placement: '1st place',
    event: 'Hack4Water 2026',
    project: 'Garda Chiese Alert',
    year: '2026',
  },
  {
    placement: '2nd place',
    event: 'SCIoTeM 2026',
    project: 'Smart Beam',
    year: '2026',
  },
  {
    placement: '2nd place',
    event: 'SCIoTeM 2025',
    project: 'P7M AI Summarizer',
    year: '2025',
  },
];

export const PATH_ITEMS: PathItem[] = [
  {
    period: '2024 – now',
    title: 'B.Sc. Computer Engineering',
    institution: 'UNIMORE (Mantova campus)',
    detail: '27.3/30 weighted average · 125/180 ECTS · expected graduation 2027',
  },
  {
    period: '2023',
    title: 'IT systems internship',
    institution: 'Novellini S.p.A.',
    detail: 'Enterprise network diagnostics, workstation deployment and systems maintenance',
  },
  {
    period: '2019 – 2024',
    title: 'Diploma in Computer Science',
    institution: 'ITIS "E. Fermi" Mantova',
    detail: 'Final grade: 100/100',
  },
  {
    period: 'Languages',
    title: 'Cambridge B2 First',
    institution: 'English (professional working proficiency) · Italian (native)',
  },
];

export const CONTACTS = {
  email: 'info@benassimatteo.dev',
  github: 'https://github.com/itsmrma',
  githubUsername: 'itsmrma',
  cvEn: '/cv/CV_Matteo_Benassi_EN.pdf',
  cvIt: '/cv/CV_Matteo_Benassi_IT.pdf',
};

export const CHRONOLOGICAL_MILESTONES: MilestoneItem[] = [
  {
    id: 'm-2019',
    year: '2019',
    title: 'ITIS "E. Fermi"',
    subtitle: 'High School Diploma in Computer Science',
    description: 'Began systems programming journey, C and computer networking fundamentals in Mantova.',
  },
  {
    id: 'm-2023',
    year: '2023',
    title: 'Novellini S.p.A.',
    subtitle: 'IT Systems Internship',
    description: 'Enterprise IT infrastructure, systems support and production hardware diagnosis.',
  },
  {
    id: 'm-2024',
    year: '2024',
    title: 'UNIMORE',
    subtitle: '100/100 Diploma → B.Sc. Computer Engineering',
    description: 'Enrolled at the University of Modena and Reggio Emilia (Mantova campus). 27.3/30 average.',
  },
  {
    id: 'm-2025',
    year: '2025',
    title: 'P7M AI Summarizer',
    subtitle: '2nd place · SCIoTeM 2025',
    description: 'Unwraps legally signed PKCS#7 (.p7m) digital envelopes and summarizes contents with LLMs.',
    href: 'https://github.com/itsmrma',
  },
  {
    id: 'm-stm32',
    year: '2026',
    title: 'STM32 Smart Garden',
    subtitle: 'Bare-Metal Irrigation Controller',
    description: 'Bare-metal C firmware on ARM Cortex-M4: zero OS overhead, <16 KB SRAM, live Wi-Fi forecast polling.',
    stack: 'C · STM32 · TCP/IP',
    href: 'https://github.com/itsmrma/STM32CentralinaGettiniWiFI',
  },
  {
    id: 'm-syncforge',
    year: '2026',
    title: 'SyncForge',
    subtitle: 'Desktop App & CLI & MCP Server',
    description: 'Lossless audio/subtitle alignment using FFT cross-correlation in Rust, with FFmpeg remuxing.',
    stack: 'Rust · Tauri 2 · FFmpeg',
    href: 'https://github.com/itsmrma/SyncForge',
  },
  {
    id: 'm-scrobbl',
    year: '2026',
    title: 'scrobbl.rs',
    subtitle: 'Self-Hosted Listening Tracker',
    description: 'Lightweight Rust daemon collecting Spotify history, local SQLite store, and personal ranking server.',
    stack: 'Rust · React · SQLite',
    href: 'https://github.com/itsmrma/scrobbl-rs',
  },
  {
    id: 'm-smartbeam',
    year: '2026',
    title: 'Smart Beam',
    subtitle: '2nd place · SCIoTeM 2026',
    description: 'Predictive maintenance engine for municipal streetlights combining survival analysis & gradient boosting.',
    href: 'https://github.com/itsmrma',
  },
  {
    id: 'm-garda',
    year: '2026',
    title: 'Garda Chiese Alert',
    subtitle: '1st place · Hack4Water 2026',
    description: 'Citizen incident platform for 76,645-hectare basin. Sub-millisecond PostGIS boundary checks & Gemini triage.',
    stack: 'Django · PostGIS · React',
    href: 'https://github.com/cavallinilorenzo/alert-app-garda-chiese',
    isMajor: true,
  },
  {
    id: 'm-oxide',
    year: '2026 · now',
    title: 'Oxide',
    subtitle: 'Core Contributor · In Progress',
    description: 'Desktop platform running multi-agent AI worktrees (Claude Code, Codex, Antigravity) with pre-merge turn validation.',
    stack: 'Rust · Tauri 2 · React',
    href: 'https://github.com/getoxide/oxide',
    isLargest: true,
    isInProgress: true,
  },
  {
    id: 'm-next',
    year: '2027 →',
    title: 'Next: Software for Motorsport',
    subtitle: 'The Finish Line',
    description: 'Seeking a curricular internship in 2026/27 to build high-performance systems for racing teams.',
    isFinish: true,
  },
];
