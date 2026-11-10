export type TokenColor = 'default' | 'blue' | 'green' | 'teal' | 'purple' | 'orange' | 'red' | 'gray' | 'cyan' | 'yellow' | 'pink';

export interface Project {
  id: string;
  category: 'hackathon' | 'oxide' | 'rust-desktop' | 'embedded-iot' | 'web-gis';
  tabLabel: string;
  title: string;
  subtitle: string;
  award?: string;
  awardColor?: TokenColor;
  description: string;
  architectureDetails: string;
  tags: { label: string; color?: TokenColor }[];
  githubUrl?: string;
  liveUrl?: string;
  metrics?: string;
  testbenchTitle: string;
  testbenchBadge: string;
  testbenchDesc: string;
  testbenchBtnLabel: string;
  testbenchBtnActiveLabel?: string;
  codeTitle: string;
  codeLanguage: string;
  codeDefault: string;
  codeActive: string;
}

export const portfolioProjects: Project[] = [
  // =========================================================================
  // 1. HACKATHONS (3 PODIUMS)
  // =========================================================================
  {
    id: 'garda-chiese',
    category: 'hackathon',
    tabLabel: '1st Place · Garda Chiese Alert',
    title: 'Garda Chiese Alert',
    subtitle: 'Consorzio di Bonifica Garda Chiese (33 Municipalities, 76,645 ha)',
    award: '1st Place · Hack4Water 2026',
    awardColor: 'green',
    description:
      'Georeferenced citizen incident reporting platform built without requiring user registration. Captures GPS coordinates, field photos, and voice reports analyzed by Google Gemini AI, validating waterway boundaries via sub-millisecond PostGIS spatial queries.',
    architectureDetails:
      'Django REST Framework backend with PostgreSQL/PostGIS spatial GIST indices. React & TypeScript operator triage dashboard with Leaflet vector clustering and real-time push alerts.',
    tags: [
      { label: 'Django REST', color: 'blue' },
      { label: 'PostgreSQL / PostGIS', color: 'teal' },
      { label: 'React & TypeScript', color: 'blue' },
      { label: 'Google Gemini AI', color: 'purple' },
      { label: 'Leaflet GIS', color: 'green' },
      { label: 'Docker', color: 'gray' },
    ],
    githubUrl: 'https://github.com/cavallinilorenzo/alert-app-garda-chiese',
    metrics: '76,645 ha · 33 municipalities · Built in 72h',
    testbenchTitle: 'PostGIS & Gemini Triage Pipeline',
    testbenchBadge: 'SPATIAL + AI',
    testbenchDesc:
      'Simulate an incoming citizen voice report across the 76,645 ha reclamation basin with PostGIS GIST boundary validation and Gemini multimodal triage.',
    testbenchBtnLabel: 'Simulate Citizen Incident (45.16°N, 10.79°E)',
    testbenchBtnActiveLabel: 'Reset Triage Simulation',
    codeTitle: 'postgis-gemini-triage.log',
    codeLanguage: 'bash',
    codeDefault: `[BOOT] Consorzio Garda-Chiese Spatial Daemon v1.4
[DB]   PostGIS GIST index loaded (76,645 ha, 33 comuni)
[API]  Django REST endpoint /api/v1/reports/ READY
[AI]   Gemini 2.5 Flash multimodal worker pool IDLE
[GIS]  Leaflet WebSocket operator channel CONNECTED
------------------------------------------------------
Status : Listening for georeferenced field reports...
Latency: 0.38ms spatial containment check
Action : Click button above to inject field report`,
    codeActive: `[RX]   Voice report #4092 (PCM 16kHz, 45.16°N 10.79°E)
[GIS]  ST_Contains(garda_basin, ST_Point) -> TRUE (0.38ms)
[ZONE] Municipality: Acquanegra sul Chiese (Canal B-12)
[AI]   Whisper transcript: "Foam anomaly near sluice gate"
[LLM]  Gemini classification: WATER_QUALITY_ALERT
[PRIO] Calculated severity score: 4 / 5 (HIGH PRIORITY)
[PUSH] WebSocket dispatch sent to 3 field operators
------------------------------------------------------
Result : Incident #4092 pinned on live operator GIS map`,
  },
  {
    id: 'smart-beam',
    category: 'hackathon',
    tabLabel: '2nd Place · Smart Beam',
    title: 'Smart Beam',
    subtitle: 'Municipal Public Lighting Predictive Maintenance Platform',
    award: '2nd Place · SCIoTeM 2026',
    awardColor: 'orange',
    description:
      'Predictive maintenance engine shifting municipal street lighting from reactive repairs to proactive scheduling. Combines statistical survival analysis with gradient boosting to compute failure risk scores per luminaire and automate technician ticketing.',
    architectureDetails:
      'Python ML pipeline with scikit-learn, lifelines (Cox Proportional Hazards), and XGBoost. Django GIS backend serving GeoJSON risk layers and maintenance dispatch queues.',
    tags: [
      { label: 'Python', color: 'blue' },
      { label: 'Django REST', color: 'blue' },
      { label: 'scikit-learn', color: 'orange' },
      { label: 'XGBoost', color: 'orange' },
      { label: 'Survival Analysis', color: 'teal' },
      { label: 'GIS Mapping', color: 'green' },
    ],
    githubUrl: 'https://github.com/cavallinilorenzo/street-lighting-predictive-maintenance',
    metrics: 'Survival Analysis + GIS Dispatch Ticketing',
    testbenchTitle: 'Luminaire Survival & Risk Engine',
    testbenchBadge: 'ML INFERENCE',
    testbenchDesc:
      'Run Cox Proportional Hazards and XGBoost inference on street luminaire telemetry (burn hours, thermal cycles, grid surges) to estimate failure probability.',
    testbenchBtnLabel: 'Run Weibull & Cox Hazard Inference',
    testbenchBtnActiveLabel: 'Show Baseline Telemetry Model',
    codeTitle: 'survival_inference.py',
    codeLanguage: 'python',
    codeDefault: `# Smart Beam — Luminaire Hazard Pipeline
from lifelines import CoxPHFitter
import xgboost as xgb

def evaluate_grid_sector(telemetry_df):
    cph_hazard = cph_model.predict_partial_hazard(telemetry_df)
    xgb_risk   = booster.predict_proba(telemetry_df)[:, 1]
    return combine_survival_scores(cph_hazard, xgb_risk)
# Ready: 1,420 municipal luminaires indexed in GIS`,
    codeActive: `# Inference Output — Sector Mantova Nord
LUMINAIRE_ID   = "LMP-MN-0842"
OPERATING_HRS  = 14_820
VOLTAGE_SPIKES = 19          # Last 30 days
PARTIAL_HAZARD = 0.874       # CRITICAL (> 0.75 threshold)
ESTIMATED_RUL  = "290 hours" # 95% CI: [240h, 345h]
TICKET_STATUS  = "AUTO_ASSIGNED_CREW_B"
GIS_LAYER_SYNC = "UPDATED (Red Marker @ 45.158°N)"
# Preventive replacement scheduled before outage`,
  },
  {
    id: 'p7m-summarizer',
    category: 'hackathon',
    tabLabel: '2nd Place · P7M AI Summarizer',
    title: 'P7M AI Summarizer',
    subtitle: 'Cryptographic PKCS#7 (.p7m) Decapsulation & Legal Abstractor',
    award: '2nd Place · SCIoTeM 2025',
    awardColor: 'orange',
    description:
      'Specialized utility for Italian public administration digitally signed files (.p7m / CAdES). Strips cryptographic PKCS#7 envelopes without data loss and generates keyword-focused semantic summaries with exact page and section citations.',
    architectureDetails:
      'Low-level binary ASN.1/DER parsing via asn1crypto to unwrap nested digital signatures. Structured Gemini API pipeline extracting counterparties, monetary values, deadlines, and citations.',
    tags: [
      { label: 'Python', color: 'blue' },
      { label: 'asn1crypto', color: 'red' },
      { label: 'Google Gemini API', color: 'purple' },
      { label: 'PKCS#7 / CAdES', color: 'teal' },
      { label: 'Django', color: 'blue' },
    ],
    githubUrl: 'https://github.com/itsmrma/hackathon-p7m-ai-summarizer',
    metrics: 'Zero-loss ASN.1 unwrapping + Page Citations',
    testbenchTitle: 'ASN.1 / PKCS#7 Cryptographic Unwrapper',
    testbenchBadge: 'CADES PARSER',
    testbenchDesc:
      'Inspect the binary ASN.1 DER decapsulation of a signed .p7m administrative determination and its structured semantic summary with page references.',
    testbenchBtnLabel: 'Decapsulate .p7m & Extract Legal Citations',
    testbenchBtnActiveLabel: 'Reset ASN.1 Parser View',
    codeTitle: 'p7m_decapsulator.json',
    codeLanguage: 'json',
    codeDefault: `{
  "input_file": "determina_dirigenziale_2025.pdf.p7m",
  "outer_encoding": "ASN.1 DER (PKCS#7 SignedData)",
  "oid": "1.2.840.113549.1.7.2",
  "parser_engine": "asn1crypto.cms.ContentInfo",
  "payload_extraction": "READY",
  "certificate_chain": "AgID-Compliant CA (Valid to 2028)",
  "digest_algorithm": "SHA-256 (OID 2.16.840.1.101.3.4.2.1)",
  "signing_time_utc": "2025-10-14T09:22:15Z",
  "content_type": "application/pdf (Uncompressed)",
  "status": "Awaiting extraction trigger",
  "hint": "Click button above to unwrap CAdES envelope"
}`,
    codeActive: `{
  "cades_signature": "VALID (SHA-256 with RSA-4096)",
  "extracted_payload": "determina_dirigenziale_2025.pdf",
  "payload_size_bytes": 1048576,
  "signing_authority": "Provincia di Mantova — Settore Lavori Pubblici",
  "signer_identity": "Dott. Ing. Responsabile Unico del Procedimento",
  "contract_value_eur": 148500.00,
  "fiscal_code_cig": "Z893D4B12C",
  "key_clauses": [
    "Art. 4 (p. 3): Delivery deadline fixed at 90 calendar days",
    "Art. 7 (p. 5): Penalties: 1‰ per calendar day of unjustified delay",
    "Art. 9 (p. 7): Safety operational compliance under D.Lgs. 81/2008"
  ],
  "llm_summary_status": "INDEXED_AND_VERIFIED"
}`,
  },

  // =========================================================================
  // 2. OXIDE (OPEN-SOURCE AGENTIC IDE — CONTRIBUTOR)
  // =========================================================================
  {
    id: 'oxide-core',
    category: 'oxide',
    tabLabel: 'Multi-Agent Threads & CLI Host',
    title: 'Oxide — Desktop GUI for Coding Agents',
    subtitle: 'Co-developed Open-Source Project (getoxide/oxide) · Rust & Tauri 2',
    award: 'Core Contributor · Rust + Tauri 2',
    awardColor: 'orange',
    description:
      'Open-source desktop application for agentic software engineering on macOS (Apple Silicon) and Windows x64. Drives Claude Code, OpenAI Codex, and Antigravity CLI side by side in isolated Git worktrees, putting Git, GitHub, Monaco editor, and a terminal around every agent thread.',
    architectureDetails:
      'Native Rust workspace orchestrating CLI agent processes, per-thread permission modes (Ask, Auto-edit, Full access), Attention Center notifications, and automatic Git worktree isolation.',
    tags: [
      { label: 'Rust', color: 'orange' },
      { label: 'Tauri 2', color: 'teal' },
      { label: 'TypeScript & React', color: 'blue' },
      { label: 'Git Worktrees', color: 'purple' },
      { label: 'Claude Code / Codex / AGY', color: 'green' },
    ],
    githubUrl: 'https://github.com/getoxide/oxide',
    metrics: 'Rust + Tauri 2 · Multi-Provider Agent Host',
    testbenchTitle: 'Oxide Provider & Worktree Orchestrator',
    testbenchBadge: 'TAURI 2 IPC',
    testbenchDesc:
      'Inspect how Oxide spawns isolated Git worktrees and manages concurrent Claude Code, Codex, and Antigravity CLI sessions with per-turn checkpoints.',
    testbenchBtnLabel: 'Simulate Agent Turn & Checkpoint Capture',
    testbenchBtnActiveLabel: 'Show Provider Session Config',
    codeTitle: 'crates/oxide-core/src/thread_runner.rs',
    codeLanguage: 'rust',
    codeDefault: `// Oxide Multi-Provider Thread & Worktree Session
pub struct AgentThread {
    pub id: ThreadId,
    pub provider: ProviderKind, // Claude | Codex | Agy
    pub permission: PermissionMode,
    pub worktree_path: PathBuf,
    pub turn_checkpoints: Vec<GitCheckpoint>,
}
// Ready: 3 CLI providers detected in system PATH`,
    codeActive: `[OXIDE] Spawning Thread #14 (Provider: Antigravity CLI)
[GIT]   Worktree created -> .oxide/worktrees/feat-ipc
[TURN]  Checkpoint #01 recorded (HEAD: 8f3a9c1)
[AGENT] Executing tool calls (permission: AutoEdit)...
[TURN]  Checkpoint #02 recorded (+142 / -19 lines)
[DIFF]  3 files modified in crates/oxide-git/src/
[CHECK] cargo test --workspace -> 48 passed (0.82s)
[STATE] Thread #14 ready for Verification Dossier review`,
  },
  {
    id: 'oxide-dossier',
    category: 'oxide',
    tabLabel: 'Verification Dossier & Blind Review',
    title: 'Oxide — Verification Dossier & Diff Surface',
    subtitle: 'Deterministic Pre-Merge Evidence & Cross-Provider Blind Review',
    award: 'ADR-0010 · Confident Merge',
    awardColor: 'teal',
    description:
      'While most tools optimize for starting more agents, Oxide optimizes for the path from a finished agent turn to a confident merge. Computes a deterministic Verification Dossier without an LLM and allows a second provider to run a Blind Review seeing only the diff and issue.',
    architectureDetails:
      'Tracks which verification commands ran and whether they are fresh after the latest edit, flags source files modified without matching test changes, highlights sensitive paths, and converts blind-review findings into inline diff comments.',
    tags: [
      { label: 'Deterministic Verification', color: 'green' },
      { label: 'Per-Turn Git Checkpoints', color: 'blue' },
      { label: 'Blind Cross-Agent Review', color: 'purple' },
      { label: 'Hunk Revert & Restore', color: 'orange' },
      { label: 'GitHub PR Publishing', color: 'gray' },
    ],
    githubUrl: 'https://github.com/getoxide/oxide',
    metrics: 'Zero-LLM Dossier Signals + Blind Diff Review',
    testbenchTitle: 'Deterministic Verification Dossier Inspector',
    testbenchBadge: 'VERIFIED MERGE',
    testbenchDesc:
      'Evaluate a finished agent turn against Oxide’s non-LLM Verification Dossier signals: check freshness, test coverage deltas, sensitive paths, and blind review.',
    testbenchBtnLabel: 'Compute Turn Verification Dossier',
    testbenchBtnActiveLabel: 'Reset Dossier Inspector',
    codeTitle: 'verification_dossier.json',
    codeLanguage: 'json',
    codeDefault: `{
  "turn_id": "turn_01J9X8A2",
  "checkpoint_range": "8f3a9c1..e41b09d",
  "checks_executed": ["cargo check", "cargo test"],
  "checks_fresh_since_last_edit": true,
  "untested_source_touches": [],
  "sensitive_paths_touched": ["Cargo.toml"],
  "blind_review_status": "PENDING_SECOND_PROVIDER"
}`,
    codeActive: `{
  "dossier_verdict": "READY_FOR_PR",
  "fresh_checks": "2/2 PASSED (0 stale after last write)",
  "coverage_signal": "src/diff.rs paired with tests/diff.rs",
  "blind_reviewer": "Claude Code (saw diff + issue only)",
  "inline_comments_generated": 1,
  "pr_export": "Published to GitHub PR #128 body",
  "restore_point": "Undoable to Turn #01 in 1 click"
}`,
  },
  {
    id: 'oxide-workspace',
    category: 'oxide',
    tabLabel: 'Monaco LSP & On-Device Whisper',
    title: 'Oxide — Integrated Editor, Terminal & Dictation',
    subtitle: 'Full Engineering Workspace with On-Device CPU/GPU Whisper Speech',
    award: 'Desktop Engineering IDE',
    awardColor: 'blue',
    description:
      'Wraps every agent conversation in a complete developer environment: Monaco code editor with on-demand language servers (Rust, TypeScript/JS, Python, C/C++), persistent per-project terminal tabs with command blocks, and 100% local Whisper voice dictation on CPU or GPU (Vulkan/CUDA).',
    architectureDetails:
      'Zero-cloud privacy for voice input: audio stays on-machine via local Whisper models. Full Git & GitHub CLI (gh) integration for branches, commits, inline PR review threads, and SHA256 build-provenance attestations.',
    tags: [
      { label: 'Monaco + LSP', color: 'blue' },
      { label: 'On-Device Whisper (CUDA/Vulkan)', color: 'purple' },
      { label: 'Persistent PTY Terminal', color: 'teal' },
      { label: 'GitHub CLI Integration', color: 'gray' },
    ],
    githubUrl: 'https://github.com/getoxide/oxide',
    metrics: 'macOS arm64 & Windows x64 · Local GPU Whisper',
    testbenchTitle: 'Workspace Subsystem & Whisper Dictation',
    testbenchBadge: 'LOCAL GPU / LSP',
    testbenchDesc:
      'Inspect the local on-device Whisper dictation pipeline and on-demand LSP server initialization inside the Oxide desktop runtime.',
    testbenchBtnLabel: 'Run Local Whisper & LSP Diagnostic',
    testbenchBtnActiveLabel: 'Show Workspace Architecture',
    codeTitle: 'oxide_workspace_runtime.log',
    codeLanguage: 'bash',
    codeDefault: `[LSP]   Rust-Analyzer: INSTALLED (on-demand sandbox)
[LSP]   TypeScript / Python / clangd: READY
[TERM]  Persistent PTY tabs: 2 active (zsh / pwsh)
[AUDIO] On-device Whisper model: base.en (quantized)
[GPU]   Hardware acceleration: Vulkan / CUDA backend
[PRIV]  Network egress for audio: DISABLED (100% local)
------------------------------------------------------
Status : Ready for voice prompt or keyboard navigation`,
    codeActive: `[MIC]   Voice capture active (16kHz mono ring buffer)
[GPU]   Whisper inference on GPU -> 42ms latency
[TEXT]  "Refactor the checkpoint diff parser and add test"
[SEND]  Injected into active Thread #14 composer
[LSP]   rust-analyzer indexed 14 crates in 310ms
[GH]    gh pr status -> PR #128 checks green
------------------------------------------------------
Result : Zero-cloud dictation & full IDE loop complete`,
  },

  // =========================================================================
  // 3. RUST & DESKTOP APPLICATIONS
  // =========================================================================
  {
    id: 'syncforge',
    category: 'rust-desktop',
    tabLabel: 'SyncForge v3.5 (Rust + Tauri)',
    title: 'SyncForge v3.5',
    subtitle: 'Rust & Tauri v2 Video/Audio Batch Processor, FFT Sync & MCP Server',
    award: 'v3.5.3 · Rust + Tauri v2',
    awardColor: 'orange',
    description:
      'Cross-platform desktop application (Windows, macOS, Linux) and headless CLI (syncforge-cli) for automated media batch processing. Orchestrates MKVToolNix, FFmpeg, and ffsubsync with native Rust FFT waveform audio correlation, OpenSubtitles 64-bit moviehash search, and a full Model Context Protocol (MCP) server.',
    architectureDetails:
      'Native Rust backend performing FFT cross-correlation to align audio and subtitle streams in-place without quality loss. Includes signed cross-platform auto-updates and 20 MCP tools for AI agents.',
    tags: [
      { label: 'Rust', color: 'orange' },
      { label: 'Tauri v2', color: 'teal' },
      { label: 'FFT Waveform Correlation', color: 'purple' },
      { label: 'MKVToolNix & FFmpeg', color: 'blue' },
      { label: 'MCP Server', color: 'green' },
      { label: 'Headless CLI', color: 'gray' },
    ],
    githubUrl: 'https://github.com/itsmrma/SyncForge',
    metrics: '7 Modules · Native Rust FFT · Full MCP Server',
    testbenchTitle: 'Rust FFT Waveform Sync & MKV Pipeline',
    testbenchBadge: 'FFT + MKVMERGE',
    testbenchDesc:
      'Simulate native Rust FFT audio cross-correlation between reference and target tracks, followed by lossless MKV track remuxing and subtitle alignment.',
    testbenchBtnLabel: 'Run Rust FFT Audio Correlation & Remux',
    testbenchBtnActiveLabel: 'Show CLI & MCP Server Config',
    codeTitle: 'syncforge_fft_engine.rs',
    codeLanguage: 'rust',
    codeDefault: `// SyncForge v3.5 — Native Rust FFT Waveform Alignment
pub fn compute_audio_delay_ms(ref_pcm: &[f32], tgt_pcm: &[f32]) -> i64 {
    let spectrum_a = fft_forward(ref_pcm);
    let spectrum_b = fft_forward(tgt_pcm);
    let peak_idx   = cross_power_spectrum(&spectrum_a, &spectrum_b);
    sample_index_to_ms(peak_idx, 48_000)
}
// Tools detected: mkvmerge, ffmpeg, ffsubsync, mpv [OK]`,
    codeActive: `[FFT]   Extracted 120s dialogue window (48kHz mono PCM)
[SYNC]  Cross-correlation peak: +1,420ms (confidence 99.4%)
[OPUS]  Target track encoded to 192kbps libopus
[SUBS]  ffsubsync alignedita_forced.ass (drift < 8ms)
[MKV]   mkvmerge lossless remux completed in 1.84s
[FLAGS] Track #2 set [default:yes, forced:no] via mkvpropedit
[MCP]   syncforge_run_batch reported status: SUCCESS`,
  },
  {
    id: 'scrobbl-rs',
    category: 'rust-desktop',
    tabLabel: 'scrobbl.rs (Self-Hosted Rust)',
    title: 'scrobbl.rs',
    subtitle: 'Self-Hosted Music Listening Archive & Analytics Server in Rust',
    award: 'Rust Backend + React',
    awardColor: 'green',
    description:
      'Self-hosted, single-owner music listening archive inspired by Maloja. Continuously collects Spotify listens in the background, imports Spotify Extended Streaming History and ListenBrainz archives (JSON, JSONL, ZIP), and serves searchable history, rankings, and activity charts.',
    architectureDetails:
      'Rust HTTP backend with resumable, idempotent import transactions, multi-provider artist/album artwork resolution, half-star rating system, reversible namesake grouping, portable backup verification, and read-only CORS API keys.',
    tags: [
      { label: 'Rust Backend', color: 'orange' },
      { label: 'TypeScript & React', color: 'blue' },
      { label: 'Spotify & ListenBrainz', color: 'green' },
      { label: 'Idempotent Imports', color: 'teal' },
      { label: 'Self-Hosted API', color: 'purple' },
    ],
    githubUrl: 'https://github.com/itsmrma/scrobbl-rs',
    metrics: 'Resumable Archive Imports · Read-Only API Keys',
    testbenchTitle: 'scrobbl.rs Ingestion & Ranking Engine',
    testbenchBadge: 'RUST SERVER',
    testbenchDesc:
      'Inspect the resumable streaming history importer and real-time Spotify background collector running on the self-hosted Rust server.',
    testbenchBtnLabel: 'Simulate Archive Import & Deduplication',
    testbenchBtnActiveLabel: 'Show Server Endpoint Status',
    codeTitle: 'scrobbl_ingest_worker.log',
    codeLanguage: 'bash',
    codeDefault: `[BOOT] scrobbl.rs archive daemon listening on :42010
[POLL] Spotify Now-Playing collector: ACTIVE (60s tick)
[DB]   SQLite WAL mode enabled · Integrity verified
[IMG]  Providers: Custom > MusicBrainz > Spotify > Deezer
[API]  Read-only CORS key active for History Analyzer
------------------------------------------------------
Status : Archive healthy (84,920 canonical listens)
Action : Click button above to test ZIP batch import`,
    codeActive: `[IMPORT] Streaming History_Audio_2025.zip mounted
[PARSE]  Read 12,450 records (JSONL stream chunking)
[DEDUP]  Skipped 318 exact timestamp+track duplicates
[FILTER] Ignored 42 plays < 30s (eligibility rule)
[COMMIT] 12,090 new canonical listens committed
[INDEX]  Recomputed artist/album rankings in 19ms
------------------------------------------------------
Result : Checkpoint saved · Backup archive verified`,
  },
  {
    id: 'amd-fan-control',
    category: 'rust-desktop',
    tabLabel: 'AMD Fan Control (Rust + ADL)',
    title: 'AMD Fan Control',
    subtitle: 'Windows Desktop GPU Fan Curve Utility in Rust & Tauri',
    award: 'AMD ADL Overdrive8',
    awardColor: 'red',
    description:
      'Lightweight Windows desktop utility built with Rust and Tauri to replace bloated GPU suites for AMD Radeon graphics cards (developed for RX 5600 XT / RDNA). Reads live edge & hotspot temperatures, fan RPM, and controls 5-point fan curves.',
    architectureDetails:
      'Interfaces directly with AMD Display Library (ADL) Overdrive8 native C APIs from Rust FFI. Features a resizable interactive SVG curve editor with keyboard navigation, Zero-RPM toggle, and one-click driver default restoration.',
    tags: [
      { label: 'Rust FFI', color: 'orange' },
      { label: 'Tauri Desktop', color: 'teal' },
      { label: 'AMD ADL Overdrive8', color: 'red' },
      { label: 'Interactive SVG Editor', color: 'blue' },
      { label: 'Windows x64', color: 'gray' },
    ],
    githubUrl: 'https://github.com/itsmrma/amd-fan-control',
    metrics: 'Native ADL Overdrive8 · 5-Point Fan Curve',
    testbenchTitle: 'AMD ADL Overdrive8 Telemetry & Curve',
    testbenchBadge: 'RX 5600 XT',
    testbenchDesc:
      'Inspect live GPU edge/junction sensor polling and the 5-point PWM fan curve applied through the AMD Display Library Overdrive8 backend.',
    testbenchBtnLabel: 'Apply Custom 5-Point Acoustic Curve',
    testbenchBtnActiveLabel: 'Restore AMD Driver Default Curve',
    codeTitle: 'adl_overdrive8_driver.rs',
    codeLanguage: 'rust',
    codeDefault: `// AMD ADL2_Overdrive8_CurrentActivity_Get Telemetry
GPU_ADAPTER  : "AMD Radeon RX 5600 XT (Navi 10 / RDNA)"
EDGE_TEMP    : 46 °C
HOTSPOT_TEMP : 54 °C
FAN_SPEED    : 1,180 RPM (34% PWM)
ZERO_RPM     : ENABLED (< 50 °C threshold)
CURVE_POINTS : [(35°C,25%), (50°C,35%), (65°C,55%),
                (75°C,75%), (85°C,100%)]`,
    codeActive: `// Applying Custom 5-Point Curve via ADL2_Overdrive8
[FFI]  ADL2_Overdrive8_Setting_Set -> ADL_OK (0)
[PT1]  40 °C -> 30% PWM  | [PT2] 55 °C -> 45% PWM
[PT3]  68 °C -> 65% PWM  | [PT4] 76 °C -> 85% PWM
[PT5]  82 °C -> 100% PWM | Zero-RPM: DISABLED
[SENS] Hotspot dropped 54 °C -> 49 °C (1,640 RPM)
[SAFE] Hardware bounds validated against VBIOS limits`,
  },

  // =========================================================================
  // 4. EMBEDDED C, IOT & INFRASTRUCTURE
  // =========================================================================
  {
    id: 'stm32-garden',
    category: 'embedded-iot',
    tabLabel: 'STM32 Bare-Metal C',
    title: 'STM32 Smart Garden',
    subtitle: 'Bare-Metal C Firmware on STMicroelectronics B-L475E-IOT01A',
    award: 'ARM Cortex-M4 · C',
    awardColor: 'teal',
    description:
      'Autonomous irrigation firmware written in bare-metal C on an STM32L475VG Discovery board (ARM Cortex-M4). Hosts an embedded HTTP configuration server, queries live Open-Meteo rain forecasts over Wi-Fi, and actuates solenoid valves via GPIO relays.',
    architectureDetails:
      'Deterministic execution without an OS (zero heap allocation, < 16 KB SRAM). Direct HAL GPIO timer control and raw TCP/IP socket server over the onboard Inventek Wi-Fi module.',
    tags: [
      { label: 'Embedded C', color: 'blue' },
      { label: 'STM32 ARM Cortex-M4', color: 'teal' },
      { label: 'Embedded HTTP Server', color: 'orange' },
      { label: 'TCP/IP Wi-Fi Sockets', color: 'purple' },
      { label: 'Open-Meteo API', color: 'green' },
    ],
    githubUrl: 'https://github.com/itsmrma/STM32CentralinaGettiniWiFI',
    metrics: 'Zero-OS · < 16 KB SRAM · Deterministic C',
    testbenchTitle: 'STM32 GPIO PA5 & UART Telemetry Bench',
    testbenchBadge: 'CORTEX-M4',
    testbenchDesc:
      'Toggle the STM32 GPIO pin PA5 solenoid relay and inspect the bare-metal C HAL driver and serial UART/TCP telemetry output.',
    testbenchBtnLabel: 'Energize GPIO PA5 Relay (Open Valve)',
    testbenchBtnActiveLabel: 'De-energize GPIO PA5 (Close Valve)',
    codeTitle: 'src/gpio_valve_controller.c',
    codeLanguage: 'c',
    codeDefault: `// STM32L475VG Standby — Pin PA5 LOW (0.0V)
HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, GPIO_PIN_RESET);
// Check Open-Meteo Rain Probability via Wi-Fi Socket
if (weather_forecast.rain_prob_pct < 25) {
    uart_printf("[SYS] Rain prob 5%% -> Schedule ARMED\\r\\n");
    socket_send(fd, "STATE=STANDBY;PA5=0V;SRAM=14.2KB\\r\\n");
}
// Clock: 80 MHz MSI PLL · Watchdog: NOMINAL`,
    codeActive: `// STM32L475VG Active Irrigation — Pin PA5 HIGH (+3.3V)
HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, GPIO_PIN_SET);
// Solenoid Relay Energized -> Water Flow ACTIVE
char packet[64];
snprintf(packet, sizeof(packet),
         "STATE=IRRIGATING;PA5=3.3V;VALVE=OPEN\\r\\n");
socket_send(fd, packet, strlen(packet));
// Zero heap fragmentation · Stack usage: 3.8 KB`,
  },
  {
    id: 'viessmann-hass',
    category: 'embedded-iot',
    tabLabel: 'Viessmann Heat Pump Add-on',
    title: 'Viessmann Dashboard (Home Assistant)',
    subtitle: 'Supervisor Add-on Combining ViCare API & Viessmann 2701 Polling',
    award: 'Home Assistant Add-on',
    awardColor: 'blue',
    description:
      'Read-only Home Assistant Supervisor add-on (aarch64 & amd64) combining official ViCare entities with direct local polling of a Viessmann 2701 controller. Provides live multi-zone room cards, heat pump power/water telemetry, and 24-hour rolling charts.',
    architectureDetails:
      'Integrates with Home Assistant Ingress and Supervisor API. Maintains an in-memory ring buffer of 1,440 samples/source (24h history), independent fresh/stale/unavailable source state machines, and non-overlapping manual controller refresh.',
    tags: [
      { label: 'Home Assistant Ingress', color: 'blue' },
      { label: 'Viessmann 2701 Polling', color: 'teal' },
      { label: 'ViCare API Discovery', color: 'green' },
      { label: 'aarch64 & amd64', color: 'purple' },
      { label: '24h Ring Buffer', color: 'orange' },
    ],
    githubUrl: 'https://github.com/itsmrma/viesmann-dashboard-hass',
    metrics: '1,440 Samples/Source · Dual Telemetry Source',
    testbenchTitle: 'Viessmann 2701 & ViCare Polling Monitor',
    testbenchBadge: 'HASS INGRESS',
    testbenchDesc:
      'Simulate a synchronized poll of the local Viessmann 2701 zone controller and Home Assistant Supervisor ViCare heat pump entities.',
    testbenchBtnLabel: 'Trigger Manual 2701 Controller Poll',
    testbenchBtnActiveLabel: 'Show Rolling 24h Buffer Status',
    codeTitle: 'viessmann_supervisor_poll.log',
    codeLanguage: 'bash',
    codeDefault: `[INGRESS] Home Assistant Supervisor API connected
[SOURCE1] Viessmann 2701 Controller: FRESH (2m interval)
[SOURCE2] ViCare Heat Pump Entities: 18 discovered
[BUFFER]  24h Ring Buffer: 1,440 / 1,440 slots active
[ZONES]   Living (21.2°C) · Studio (20.8°C) · Night (19.5°C)
[PUMP]    Supply water: 34.5°C · Today kWh: 6.4 kWh
------------------------------------------------------
Status  : Read-only safety lock active · All zones nominal`,
    codeActive: `[POLL]    Manual refresh requested (mutex lock acquired)
[2701]    GET controller state -> HTTP 200 (142ms)
[VICARE]  Supervisor state sync -> 18/18 entities FRESH
[ZONE_01] Target: 21.0°C | Measured: 21.3°C | RH: 48%
[CIRCUIT] Direct circuit & domestic hot water: 48.0°C
[BUFFER]  Sample #1440 appended to rolling 24h chart
------------------------------------------------------
Result  : UI updated with zero overlapping poll requests`,
  },
  {
    id: 'truenas-infra',
    category: 'embedded-iot',
    tabLabel: 'TrueNAS & Linux Home Lab',
    title: 'TrueNAS & Linux Self-Hosted Infrastructure',
    subtitle: 'Personal Linux Server, ZFS Redundant Storage & Container Host',
    award: 'Linux & Systems Admin',
    awardColor: 'purple',
    description:
      'Custom-built personal Linux server running TrueNAS for network-attached storage (NAS), ZFS redundant drive pools, automated snapshot/backup pipelines, and self-hosted services (including scrobbl.rs and media automation workflows).',
    architectureDetails:
      'ZFS storage pools with periodic scrub scheduling, SMART disk health telemetry, isolated Docker/jail workloads, secure LAN/VPN TLS termination, and POSIX shell automation.',
    tags: [
      { label: 'TrueNAS & ZFS', color: 'blue' },
      { label: 'Linux Systems', color: 'teal' },
      { label: 'Docker & Self-Hosting', color: 'purple' },
      { label: 'RAID / Redundancy', color: 'green' },
      { label: 'Network & TLS', color: 'gray' },
    ],
    metrics: 'ZFS Redundancy · Self-Hosted Services Host',
    testbenchTitle: 'TrueNAS ZFS Pool & Service Telemetry',
    testbenchBadge: 'ZFS ONLINE',
    testbenchDesc:
      'Inspect ZFS storage pool health, automated snapshot replication, and self-hosted container services running on the Linux home server.',
    testbenchBtnLabel: 'Run zpool status & Service Health Check',
    testbenchBtnActiveLabel: 'Show Storage & Snapshot Schedule',
    codeTitle: 'truenas-zpool-status.log',
    codeLanguage: 'bash',
    codeDefault: `root@truenas:~# zpool status -v tank
  pool: tank
 state: ONLINE
  scan: scrub repaired 0B in 02:14:11 with 0 errors
config:
  NAME        STATE     READ WRITE CKSUM
  tank        ONLINE       0     0     0
    mirror-0  ONLINE       0     0     0
errors: No known data errors · ARC hit ratio: 98.4%`,
    codeActive: `[ZFS]    Snapshot tank/services@auto-2026-11-10 created
[SMART]  All drives PASSED (< 34°C operating temp)
[SVC-01] scrobbl-rs:42010        -> HEALTHY (uptime 42d)
[SVC-02] smb-cifs-share:445      -> ACTIVE (10GbE LAN)
[SVC-03] backup-replication.sh   -> COMPLETED (0 errors)
[NET]    TLS certificate valid · WireGuard VPN peer UP
------------------------------------------------------
Result : All storage pools and self-hosted daemons OK`,
  },

  // =========================================================================
  // 5. WEB, GIS & DATA PLATFORMS
  // =========================================================================
  {
    id: 'spotify-analyzer',
    category: 'web-gis',
    tabLabel: 'Music History Analyzer',
    title: 'Music History Analyzer',
    subtitle: 'Interactive Streaming Analytics & Multi-Scrobbler Web App',
    award: 'Live Web App',
    awardColor: 'green',
    description:
      'Client-side web application for exploring Spotify Extended Streaming History (ZIP/JSON) and merging listens from ListenBrainz, Last.fm, Maloja, and private scrobbl.rs archives. Computes top artists/tracks/albums, daily activity calendars, streaks, and listening hours.',
    architectureDetails:
      '100% in-memory session privacy (listening history and API keys never leave the browser). Features UTC timestamp deduplication, 30-second play eligibility filtering, undo/redo history stack, and incremental CORS sync with scrobbl.rs.',
    tags: [
      { label: 'JavaScript / Web', color: 'blue' },
      { label: 'Spotify Extended History', color: 'green' },
      { label: 'ListenBrainz & Last.fm', color: 'purple' },
      { label: 'scrobbl.rs Sync', color: 'teal' },
      { label: 'Client-Side Privacy', color: 'orange' },
    ],
    githubUrl: 'https://github.com/itsmrma/spotify-history-analyzer',
    liveUrl: 'https://spotify-history-analyzer.benassimatteo.dev/',
    metrics: 'Zero-Server Privacy · Multi-Scrobbler Merge',
    testbenchTitle: 'Streaming History Deduplication & Analytics',
    testbenchBadge: 'CLIENT ENGINE',
    testbenchDesc:
      'Simulate parsing a multi-year Spotify Extended Streaming History ZIP archive and merging incremental listens from a connected scrobbl.rs server.',
    testbenchBtnLabel: 'Run History Import & Scrobbler Merge',
    testbenchBtnActiveLabel: 'Show Privacy & Eligibility Rules',
    codeTitle: 'history_analyzer_engine.js',
    codeLanguage: 'js',
    codeDefault: `// Music History Analyzer — Eligibility & Deduplication
function processListenRecord(record, seenSet) {
  if (record.ms_played < 30_000 || record.episode_name) return null;
  const key = \`\${record.ts_utc}|\${record.artist}|\${record.track}\`;
  if (seenSet.has(key)) return null; // Exact duplicate
  seenSet.add(key);
  return normalizeCanonicalListen(record);
}
// Live at: spotify-history-analyzer.benassimatteo.dev`,
    codeActive: `[ZIP]    Parsed 4 Spotify Extended History JSON chunks
[FILTER] Qualified plays (>= 30s, music only): 68,410
[SYNC]   Connected to scrobbl.rs -> +1,240 newer listens
[DEDUP]  Removed 412 overlapping UTC timestamp records
[STATS]  Top Artist: 4,120 plays · Longest streak: 118d
[MEM]    In-memory session ready · Undo snapshot stored
------------------------------------------------------
Result : Charts, calendar & CSV rankings updated in 95ms`,
  },
  {
    id: 'benpie-sagre',
    category: 'web-gis',
    tabLabel: 'Sagre in Lombardia (benpie)',
    title: 'Sagre in Lombardia (benpie)',
    subtitle: 'Regional Open Data & Interactive Cartography Web Platform',
    award: 'Web GIS & Open Data',
    awardColor: 'teal',
    description:
      'Web application for discovering, filtering, and managing traditional festivals (sagre) and fairs across the Lombardy region. Combines an interactive pin map with multi-criteria search (name, date, province), user favorites, comments, and PDF summary sheet downloads.',
    architectureDetails:
      'Native PHP backend with MySQL/MariaDB relational schema (users, festivals, toponyms, provinces), bcrypt authentication, and automated synchronization scripts ingesting JSON datasets from the Regione Lombardia Open Data REST API.',
    tags: [
      { label: 'PHP & MySQL / MariaDB', color: 'blue' },
      { label: 'Interactive Map GIS', color: 'green' },
      { label: 'Open Data Lombardia API', color: 'orange' },
      { label: 'PDF Generation', color: 'purple' },
      { label: 'bcrypt Auth', color: 'teal' },
    ],
    githubUrl: 'https://github.com/itsmrma/benpie',
    metrics: 'Automated Open Data Sync + Interactive Map',
    testbenchTitle: 'Regione Lombardia Open Data Sync & GIS',
    testbenchBadge: 'OPEN DATA ETL',
    testbenchDesc:
      'Simulate fetching regional festival records from the Open Data Lombardia API, geocoding municipal toponyms, and updating the interactive map.',
    testbenchBtnLabel: 'Run Open Data Lombardia JSON Sync',
    testbenchBtnActiveLabel: 'Show Database & Map Query',
    codeTitle: 'sync_opendata_lombardia.php',
    codeLanguage: 'php',
    codeDefault: `// Open Data Regione Lombardia — Automated Sync Check
$endpoint = "https://www.dati.lombardia.it/resource/sagre.json";
$records  = fetch_lombardia_open_data($endpoint);
foreach ($records as $item) {
    $stmt->bind_param("ssssdd",
        $item['denominazione'], $item['comune'],
        $item['data_inizio'],   $item['provincia'],
        $item['latitudine'],    $item['longitudine']
    );
    $stmt->execute();
}`,
    codeActive: `[HTTP]   GET dati.lombardia.it -> 482 regional events
[MYSQL]  Upserted 482 festivals across 12 provinces
[MAP]    Generated GeoJSON pins for Mantova, Brescia,
         Bergamo, Milano, Cremona, Como, Lecco, Pavia
[STATUS] Database freshness timestamp updated (< 7 days)
[PDF]    Event summary generator ready for download
------------------------------------------------------
Result : Interactive map & prioritized favorites synced`,
  },
  {
    id: 'uni-musiclib',
    category: 'web-gis',
    tabLabel: 'Music Library',
    title: 'UNIMORE Music Library',
    subtitle: 'Full-Stack Python/Django Web App with uv & MusicBrainz/TheAudioDB APIs',
    award: 'Academic & Personal',
    awardColor: 'purple',
    description:
      'Full-stack music cataloging web application developed with Python and Django. Manages personal vinyl, CD, and digital discographies with automated metadata enrichment: queries MusicBrainz and TheAudioDB REST endpoints for release details, high-resolution album artwork, tracklists, and artist biographies. Includes bulk CSV import with validation and multi-criteria format filtering.',
    architectureDetails:
      'Django MVT architecture running under modern uv package management. Features custom API rate-limiting wrappers, SQLite database with transactional upserts, responsive Bootstrap 5 interface with Grid and Table views, and format-specific discography badges.',
    tags: [
      { label: 'Python 3.12 & Django', color: 'blue' },
      { label: 'uv Package Manager', color: 'purple' },
      { label: 'MusicBrainz REST API', color: 'purple' },
      { label: 'TheAudioDB Artwork API', color: 'orange' },
      { label: 'SQLite & Bulk CSV', color: 'green' },
      { label: 'Bootstrap 5', color: 'teal' },
    ],
    githubUrl: 'https://github.com/itsmrma/uni-musiclib-project',
    metrics: 'Automated Metadata Enrichment · uv Environment',
    testbenchTitle: 'MusicBrainz & TheAudioDB Metadata Sync',
    testbenchBadge: 'DJANGO SERVICE',
    testbenchDesc:
      'Simulate querying the MusicBrainz catalog by MBID, enriching release metadata with TheAudioDB cover artwork, and executing a transactional upsert into SQLite.',
    testbenchBtnLabel: 'Fetch MusicBrainz Release & Artwork',
    testbenchBtnActiveLabel: 'Show Service Pipeline Architecture',
    codeTitle: 'library/services/musicbrainz_sync.py',
    codeLanguage: 'python',
    codeDefault: `# UNIMORE Music Library — External API Enrichment Pipeline
import requests
from django.db import transaction
from ..models import Album, Artist

def sync_album_metadata(mbid: str, format_type: str = "VINYL"):
    """Fetch release schema from MusicBrainz & artwork from TheAudioDB."""
    mb_res = requests.get(f"https://musicbrainz.org/ws/2/release/{mbid}?fmt=json", timeout=5)
    release = mb_res.json()
    artwork_url = fetch_theaudiodb_cover(release["artist-credit"][0]["name"], release["title"])
    with transaction.atomic():
        album, created = Album.objects.update_or_create(
            mbid=mbid,
            defaults={
                "title": release["title"],
                "format": format_type,
                "cover_url": artwork_url,
                "year": release.get("date", "")[:4],
            }
        )
    return album`,
    codeActive: `[UV]       Python 3.12 virtualenv active (uv.lock locked)
[MBID]     Target: 61e93c12-70b5-41e9-9a0d-327c54ef5f92
[HTTP]     GET musicbrainz.org/ws/2/release/ -> HTTP 200 (148ms)
[RELEASE]  Title: "Random Access Memories" · Artist: "Daft Punk"
[AUDIODB]  High-resolution 3000x3000 front sleeve fetched
[DB-TX]    BEGIN TRANSACTION (SQLite WAL mode)
[ORM]      Upserted Album record (ID: 42, Format: VINYL, Year: 2013)
[CSV-BULK] Background validator: 142 collection rows verified
[STATUS]   Discography grid cache invalidated (0.02s)
------------------------------------------------------
Result   : Album metadata & cover artwork stored successfully`,
  },
  {
    id: 'itis-mazegame',
    category: 'web-gis',
    tabLabel: 'MazeGame (JavaFX)',
    title: 'MazeGame 2D Engine',
    subtitle: '2D Tilemap Dungeon Engine with Fog-of-War in Java 21 & JavaFX',
    award: 'Desktop Game Engine',
    awardColor: 'orange',
    description:
      'Desktop 2D game engine authored in Java 21 using the JavaFX Canvas API (960×768 resolution). Features a 20×16 grid tilemap system, dynamic fog-of-war raycasting that reveals hidden corridors as the player moves, sprite animation loops, audio feedback via JavaFX Media, and keyboard navigation.',
    architectureDetails:
      'Built with JDK 21 and Apache Maven (mvnw). Implements a deterministic AnimationTimer 60 FPS tick loop, matrix-based visibility computation, collision detection with wall tiles, state serialization, and decoupled audio effects.',
    tags: [
      { label: 'Java 21', color: 'orange' },
      { label: 'JavaFX Canvas', color: 'teal' },
      { label: 'Maven Build', color: 'blue' },
      { label: 'Tilemap Engine', color: 'green' },
      { label: 'Fog-of-War Raycasting', color: 'purple' },
      { label: '60 FPS Game Loop', color: 'gray' },
    ],
    githubUrl: 'https://github.com/itsmrma/itis-mazegame',
    metrics: 'Java 21 · 20×16 Tilemap · 60 FPS Canvas',
    testbenchTitle: 'JavaFX 60 FPS Loop & Visibility Engine',
    testbenchBadge: 'CANVAS RENDERER',
    testbenchDesc:
      'Simulate the JavaFX Canvas tick loop, fog-of-war matrix radius calculation, and player collision detection across the 20×16 dungeon tilemap.',
    testbenchBtnLabel: 'Step Game Loop & Cast Visibility Ray',
    testbenchBtnActiveLabel: 'Show Tilemap Matrix Coordinates',
    codeTitle: 'mazegame/engine/VisibilityEngine.java',
    codeLanguage: 'cpp',
    codeDefault: `// JavaFX 21 Canvas — Fog-of-War Matrix Raycaster
public class VisibilityEngine {
    private static final int TILE_SIZE = 48;
    private static final int SIGHT_RADIUS = 3;
    private final boolean[][] discoveredTiles = new boolean[16][20];

    public void updatePlayerSight(int playerCol, int playerRow, GraphicsContext gc) {
        for (int r = playerRow - SIGHT_RADIUS; r <= playerRow + SIGHT_RADIUS; r++) {
            for (int c = playerCol - SIGHT_RADIUS; c <= playerCol + SIGHT_RADIUS; c++) {
                if (isInBounds(c, r) && distance(playerCol, playerRow, c, r) <= SIGHT_RADIUS) {
                    discoveredTiles[r][c] = true;
                    renderTile(gc, c * TILE_SIZE, r * TILE_SIZE);
                }
            }
        }
    }
}`,
    codeActive: `[JAVAFX]   AnimationTimer frame pulse @ 16.6ms (60.0 FPS)
[VIEWPORT] 960x768 Canvas GraphicsContext active
[PLAYER]   Position: (col: 7, row: 9) -> Tile [9][7]
[RAYCAST]  Casting visibility circle (radius: 3 tiles, 28 checked)
[FOG-OF-W] Revealed 12 previously obscured corridor tiles
[PHYSICS]  Wall collision vector check: (dx: 1, dy: 0) -> VALID
[AUDIO]    Footstep audio trigger dispatched (JavaFX Media clip)
[RENDER]   Tilemap batch paint completed in 0.42ms
------------------------------------------------------
Result   : Dynamic fog-of-war mask updated without frame drops`,
  },
];

export const timelineItems = [
  {
    title: 'B.Sc. in Computer Engineering',
    period: '2024 – Present (Exp. 2027)',
    institution: 'University of Modena and Reggio Emilia (UNIMORE) · Mantova Campus',
    badge: '125/180 ECTS · Weighted Avg: 27.3/30 · 2 Honors',
    badgeColor: 'blue' as const,
    details:
      'Fully on schedule with all exam sessions. Core 3rd-year coursework: Industrial Informatics (C/C++, manual memory management, POSIX Threads, Makefiles), Intelligent IoT (Python OOP, Smart Factory modeling with uv), and Cyber-Physical Systems Security (network defense & cryptography).',
  },
  {
    title: 'High School Diploma in Computer Science & Telecom',
    period: '2019 – 2024',
    institution: 'ITIS "E. Fermi" Mantova',
    badge: 'Final Grade: 100/100 (Top Honors)',
    badgeColor: 'green' as const,
    details:
      'Graduated with maximum honors (100/100). Rigorous foundation in software engineering (C, C++, Java, PHP, web), algorithms, relational databases (SQL), and computer systems architecture.',
  },
  {
    title: 'IT Systems & Network Infrastructure Internship',
    period: '06/2023 – 07/2023',
    institution: 'Novellini S.p.A. (Mantova, Italy)',
    badge: 'Corporate IT Operations',
    badgeColor: 'gray' as const,
    details:
      'Supported corporate IT operations across manufacturing facilities: hardware diagnostics, enterprise workstation staging, structured LAN infrastructure troubleshooting, and tier-1/tier-2 internal user helpdesk.',
  },
  {
    title: 'Cambridge English Level 1 Certificate (B2 First)',
    period: 'Official Certification',
    institution: 'Cambridge Assessment English',
    badge: 'CEFR Level B2 · Italian Native',
    badgeColor: 'teal' as const,
    details:
      'Certified upper-intermediate English proficiency alongside native Italian. Fluent in reading and authoring technical documentation, software specifications, and collaborating in international engineering teams.',
  },
];

export interface CareerDomain {
  id: string;
  tabLabel: string;
  title: string;
  badge: string;
  badgeColor: TokenColor;
  statement: string;
  context: string;
  tags: string[];
  codeTitle: string;
  codeSnippet: string;
}

export const motorsportDomains: CareerDomain[] = [
  {
    id: 'motorsport-overall',
    tabLabel: 'Motorsport Software & IT',
    title: 'Working in the Motorsport & Racing Industry',
    badge: 'PRIMARY CAREER GOAL',
    badgeColor: 'red',
    statement:
      'My primary professional ambition is to build software, data tools, and engineering systems in the Motorsport and high-performance automotive sector — contributing across factory R&D, trackside operations, and team IT infrastructure.',
    context:
      'From winning 72-hour hackathons under pressure to building full-stack platforms, native Rust desktop applications, and bare-metal C firmware, I bring a versatile engineering mindset suited for the fast-paced, results-driven environment of a racing organization.',
    tags: [
      'Motorsport Software Engineering',
      'Trackside & Factory IT',
      'Full-Stack & Desktop Tools',
      'Race Strategy & Data Systems',
      'Embedded & Telemetry',
      'Linux & Server Infrastructure',
    ],
    codeTitle: 'motorsport_career_profile.yaml',
    codeSnippet: `candidate: Matteo Benassi (UNIMORE Computer Engineering B.Sc.)
academic_metrics:
  credits_completed : 125 / 180 ECTS (Expected Graduation: 2027)
  weighted_average  : 27.3 / 30.0 (with 2 Honors / 30 e Lode)
  high_school       : 100 / 100 ITIS "E. Fermi" Mantova
target_industry: Motorsport, Racing Teams & High-Performance Automotive
applied_engineering_competencies:
  - fullstack_desktop : Rust, Tauri 2, TypeScript, React 19, Python
  - spatial_data_ai   : Django REST, PostgreSQL/PostGIS, scikit-learn
  - embedded_systems  : C/C++, STM32 ARM Cortex-M4, CAN-Bus, POSIX
  - infra_systems     : Linux server admin, TrueNAS ZFS, Docker, CI/CD
  - competitive_edge  : 1st Place Hack4Water 2026, 2x 2nd Place SCIoTeM
target_roles:
  - Curricular Internship (Tirocinio Curriculare UNIMORE 2026/2027)
  - Junior Software, Telemetry, Data or Infrastructure Engineer`,
  },
  {
    id: 'motorsport-data-sw',
    tabLabel: 'Data Platforms & Race Tooling',
    title: 'Engineering Dashboards, Data Pipelines & Simulation Tools',
    badge: 'FULL-STACK & DATA',
    badgeColor: 'blue',
    statement:
      'Modern racing teams rely on custom internal software before, during, and after every track session: visualization dashboards, automated data ingestion, predictive reliability models, and workflow automation for engineers.',
    context:
      'My experience developing Oxide (Rust + Tauri 2), SyncForge (FFT signal processing + batch automation), Smart Beam (survival analysis & XGBoost), and Garda Chiese Alert (real-time operator dashboards) translates directly to building reliable internal motorsport software.',
    tags: [
      'Internal Engineering Tools',
      'Rust & Tauri Desktop Apps',
      'Python & ML Analytics',
      'React & TypeScript Dashboards',
      'Predictive Reliability',
      'Workflow Automation',
    ],
    codeTitle: 'race_session_analytics.py',
    codeSnippet: `# Motorsport Session Data Ingestion & Reliability Analysis
from dataclasses import dataclass
import numpy as np

@dataclass
class StintTelemetryAnalysis:
    stint_id: str
    laps_completed: int
    degradation_rate_ms_lap: float
    outlier_sensor_indices: list[int]
    recommended_pit_window: tuple[int, int]

def evaluate_session_stint(session_frames: list[dict]) -> StintTelemetryAnalysis:
    pace_array = np.array([f["lap_time_ms"] for f in session_frames if f["valid_lap"]])
    deg_slope, _ = np.polyfit(np.arange(len(pace_array)), pace_array, deg=1)
    anomalies = [i for i, f in enumerate(session_frames) if f["tyre_temp_c"] > 115.0]
    return StintTelemetryAnalysis(
        stint_id="FP2_RUN_03",
        laps_completed=len(pace_array),
        degradation_rate_ms_lap=round(float(deg_slope), 3),
        outlier_sensor_indices=anomalies,
        recommended_pit_window=(18, 22),
    )`,
  },
  {
    id: 'motorsport-systems',
    tabLabel: 'Embedded, Telemetry & Infra',
    title: 'Embedded Electronics, Telemetry & Team Infrastructure',
    badge: 'SYSTEMS & INFRA',
    badgeColor: 'teal',
    statement:
      'Bridging hardware and software: from microcontroller firmware and sensor acquisition to Linux server administration, network reliability, and track-to-factory data synchronization.',
    context:
      'Combining hands-on experience with bare-metal C on STM32 ARM Cortex-M4, POSIX multithreading in C/C++, TrueNAS/ZFS Linux server administration, and corporate IT infrastructure at Novellini S.p.A.',
    tags: [
      'STM32 & Bare-Metal C/C++',
      'Telemetry & Sensor Pipelines',
      'Linux & TrueNAS Servers',
      'POSIX Multithreading',
      'Network & Trackside IT',
      'Docker & CI/CD',
    ],
    codeTitle: 'telemetry_bridge_service.rs',
    codeSnippet: `// Track-to-Factory Telemetry & Infrastructure Bridge (Rust + POSIX)
#[repr(C, packed)]
pub struct RaceTelemetryFrame {
    pub timestamp_epoch_us: u64,
    pub session_id: u32,
    pub lap_number: u16,
    pub engine_rpm: u16,
    pub vehicle_speed_kmh: f32,
    pub throttle_pct: u8,
    pub brake_pressure_bar: u8,
    pub steering_angle_deg: i16,
    pub tyre_pressures_mbar: [u16; 4],
    pub payload_crc32: u32,
}

impl RaceTelemetryFrame {
    pub fn verify_and_route(&self, socket_fd: i32) -> Result<(), &'static str> {
        let computed_crc = crc32fast::hash(&self.as_bytes()[..30]);
        if computed_crc != self.payload_crc32 {
            return Err("CRC32 mismatch: frame dropped at gateway");
        }
        dispatch_to_race_engineer_bus(socket_fd, self)
    }
}`,
  },
];

export const whoamiSnippet = {
  developer: 'Matteo Benassi',
  role: 'Computer Engineering Student · Full-Stack, Rust & Systems Developer',
  email: 'info@benassimatteo.dev',
  location: 'Mantova, Italy · UTC+1',
  university: 'University of Modena and Reggio Emilia (UNIMORE)',
  degree: 'B.Sc. Computer Engineering (2024 – 2027)',
  academic_record: '125/180 ECTS · Weighted Average: 27.3/30 (2 Honors)',
  hackathons: [
    '1st Place Hack4Water 2026 (Garda Chiese Alert)',
    '2nd Place SCIoTeM 2026 (Smart Beam)',
    '2nd Place SCIoTeM 2025 (P7M AI Summarizer)',
  ],
  key_projects: [
    'Oxide (getoxide/oxide — Rust + Tauri 2 Agentic IDE Contributor)',
    'SyncForge v3.5 (Rust + Tauri v2 Media Processor, FFT Sync & MCP Server)',
    'scrobbl.rs (Self-Hosted Rust + React Music Listening Archive)',
    'AMD Fan Control (Rust + Tauri AMD ADL Overdrive8 GPU Utility)',
    'STM32 Smart Garden (Bare-Metal C Firmware on ARM Cortex-M4)',
    'Viessmann Dashboard (Home Assistant Add-on for 2701 + ViCare)',
    'UNIMORE Music Library (Python/Django + uv & MusicBrainz API)',
    'MazeGame (Java 21 + JavaFX 2D Tilemap Engine)',
  ],
  career_objective: 'Software, Data & Systems Engineering in the Motorsport & Racing Industry',
};
