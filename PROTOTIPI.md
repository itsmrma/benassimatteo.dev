# PROTOTIPI.md — 4 redesign per benassimatteo.dev

> **Per l'agente che li realizzerà:** questo file descrive **4 concept alternativi**, da implementare ciascuno come variante separata e confrontabile (es. `?variant=a|b|c|d`). Sostituiscono **tutto** il sito attuale e le vecchie varianti (`Variant2_CommandDeck`, `Variant3_NodeGraph`, `Variant4_CinematicStory`, `VariantA–D`, `WorkstationPortfolio`). Non riciclarne layout, palette o componenti.
> Prima di scrivere codice leggi `AGENTS.md` (regole Astryx) e la sezione **Regole comuni** qui sotto.

---

## 0. Cosa non funziona nel sito attuale (da NON ripetere)

| Problema attuale | Perché va eliminato |
|---|---|
| "Workstation" dark slate + indigo, dock, prototype switcher | Sembra un'app, non una persona. Troppo cromo. |
| Testbench con bottoni "Simulate…" e log finti (`[BOOT] … [GIS] …`) | Rumore: nessun recruiter clicca, e sembrano finti perché lo sono. |
| Code snippet ovunque (Rust, YAML, Python "motorsport") | Codice inventato non dimostra niente. Il codice vero sta su GitHub. |
| 16 progetti con 5–6 tag colorati ciascuno | Arcobaleno di Token, nessuna gerarchia: non si capisce cosa conta. |
| Metriche e badge su ogni elemento | Se tutto è evidenziato, non è evidenziato niente. |
| Tante card annidate, tab, pannelli | Troppe cose da navigare. |

**Obiettivo di tutti e 4 i prototipi:** chi arriva capisce **chi è Matteo, cosa ha fatto di meglio e come contattarlo in meno di 60 secondi**, scorrendo e basta.

---

## 1. Regole comuni (valgono per tutti e 4)

1. **Una pagina sola, si scorre.** Niente tab, niente modali, niente pannelli espandibili. Al massimo un'ancora di navigazione.
2. **Un solo colore d'accento** per prototipo. Lo stack tecnologico è **testo semplice grigio** (`Rust · Tauri 2 · TypeScript`), **mai** Token/Badge colorati.
3. **Vietato:** terminali finti, simulazioni, log, code block, particelle, typewriter, cursori lampeggianti, contatori animati, prototype switcher nella versione finale.
4. **Massimo 5 progetti "in evidenza"**, il resto in una lista compatta di una riga ciascuno (o omesso, dove indicato).
5. **Testi del sito in inglese** (come ora). Il CV si scarica in EN e IT (`/cv/CV_Matteo_Benassi_EN.pdf`, `/cv/CV_Matteo_Benassi_IT.pdf`).
6. **Solo link veri.** Se una data o un'informazione non è certa (vedi i `TODO` nella sezione 2), **chiedi all'utente**, non inventare.
7. **Leggero:** nessuna libreria di animazione (niente GSAP, three.js, framer-motion). Effetti di scroll con CSS (`scroll-snap`, `position: sticky`, `scroll-timeline` dove supportato) o un piccolo hook. Rispetta sempre `prefers-reduced-motion`. Obiettivo Lighthouse ≥ 95 su tutte le voci.
8. **Astryx (da `AGENTS.md`):** parti dal template `blank` (`npx astryx template blank --type page <path>`, non richiede StyleX), niente `<div>`/`<span>`, colori e font **solo** tramite tema (`defineTheme`, token `--color-*`, `--font-family-*`), nessun hex/px nei componenti. I valori hex qui sotto vanno **solo** dentro il tema. Aggiorna i Google Fonts in `index.html` per ogni prototipo. Esegui `npx astryx doctor --built dist` prima di consegnare.
9. **Accessibilità:** contrasto AA, focus visibile, un solo `h1`, gerarchia di heading corretta, tutto navigabile da tastiera.

---

## 2. Contenuti curati (usali in tutti i prototipi)

Il file `src/data/portfolioData.ts` contiene troppo. Questa è la versione "a dieta": testi già pronti, in inglese.

### Identità
- **Nome:** Matteo Benassi
- **Ruolo (breve):** Computer Engineering student · Rust & systems developer
- **Dove:** Mantova, Italy
- **Frase manifesto:** *"I build fast, reliable software — from Rust desktop apps to bare-metal C. Next stop: motorsport."*
- **Bio (2 frasi):** *"I'm a Computer Engineering student at the University of Modena and Reggio Emilia, Mantova campus. I've won three hackathon podiums, I contribute to open-source Rust tools, and I want to build software for racing teams."*
- **Disponibilità:** *Open to a curricular internship in 2026/27.*

### Numeri che contano (usane al massimo 3–4)
- 1st place · Hack4Water 2026
- 2nd place · SCIoTeM 2026 and 2025
- 27.3/30 average · 125/180 ECTS
- 100/100 high-school diploma

### Progetti in evidenza (max 5, in quest'ordine)
| Progetto | Una riga (copy pronta) | Stack (testo semplice) | Link |
|---|---|---|---|
| **Oxide** | Open-source desktop app that runs Claude Code, Codex and Antigravity side by side in isolated Git worktrees, and checks every agent turn before merge. *Core contributor.* | Rust · Tauri 2 · React | github.com/getoxide/oxide |
| **SyncForge** | Desktop app and CLI that aligns audio and subtitle tracks with FFT cross-correlation and remuxes MKV files losslessly. Ships with an MCP server. | Rust · Tauri 2 · FFmpeg | github.com/itsmrma/SyncForge |
| **Garda Chiese Alert** | Citizen reporting platform for a 76,645-hectare water basin: GPS, photos and voice reports triaged with PostGIS and Gemini. Built in 72 hours. *1st place, Hack4Water 2026.* | Django · PostGIS · React | github.com/cavallinilorenzo/alert-app-garda-chiese |
| **STM32 Smart Garden** | Bare-metal C irrigation firmware for an ARM Cortex-M4: no OS, under 16 KB of SRAM, checks the rain forecast over Wi-Fi before opening the valves. | C · STM32 · TCP/IP | github.com/itsmrma/STM32CentralinaGettiniWiFI |
| **scrobbl.rs** | Self-hosted music listening archive: collects Spotify plays in the background, imports years of history, serves rankings and charts. | Rust · React · SQLite | github.com/itsmrma/scrobbl-rs |

### Altri progetti (una riga ciascuno, solo nome + 4–6 parole + link)
- Smart Beam — predictive maintenance for street lighting · *2nd, SCIoTeM 2026*
- P7M AI Summarizer — unwraps signed .p7m files, summarizes them · *2nd, SCIoTeM 2025*
- Music History Analyzer — Spotify history explorer · **live:** spotify-history-analyzer.benassimatteo.dev
- AMD Fan Control — GPU fan curves via Rust FFI
- Viessmann Dashboard — Home Assistant add-on for a heat pump
- TrueNAS home lab — ZFS storage and self-hosted services
- Sagre in Lombardia, UNIMORE Music Library, MazeGame (JavaFX) — opzionali, si possono omettere

### Percorso
- 2024 – now · B.Sc. Computer Engineering, UNIMORE (Mantova) — 27.3/30, exp. 2027
- 2023 · IT systems internship, Novellini S.p.A.
- 2019 – 2024 · Diploma in Computer Science, ITIS "E. Fermi" Mantova — 100/100
- Cambridge B2 First · Italian native

### Contatti
- Email: `info@benassimatteo.dev` (click = copia negli appunti + feedback "Copied")
- GitHub: github.com/itsmrma
- CV: EN / IT

### Da eliminare del tutto
Testbench, `codeDefault`/`codeActive`, `motorsportDomains` con i relativi snippet, `whoamiSnippet`, colori dei tag, dettagli dei corsi universitari, metriche per ogni progetto.

> [!IMPORTANT]
> **Date progetti (confermate dall'utente):** STM32 Smart Garden, SyncForge, scrobbl.rs e Oxide sono tutti del **2026**, realizzati in quest'ordine: STM32 → SyncForge → scrobbl.rs → Oxide. **Oxide è il progetto più grande e ancora in corso.** Non esistono mesi precisi: mostra solo "2026" e rispetta l'ordine. In tutti i prototipi Oxide va presentato per primo e con più enfasi.

---

## Prototipo A — "Quaderno"

**In una frase:** una pagina che si legge come una lettera: una colonna di testo, carta chiara, serif, zero decorazioni.

### Mood e riferimenti
Personal site da ingegnere/scrittore: tipo un README ben impaginato o un saggio breve. Il contenuto *è* il design. Ispirazione: siti personali minimal "text-only" (stile Paco Coursey, Rauno Freiberg, Maggie Appleton nelle pagine più sobrie).

### Palette (tema chiaro; dark automatico via `prefers-color-scheme`)
| Ruolo | Light | Dark |
|---|---|---|
| Sfondo | `#FAF8F3` (carta) | `#161514` |
| Testo primario | `#1C1B19` | `#ECE9E2` |
| Testo secondario | `#6B675F` | `#9A958B` |
| Accento (solo link) | `#2047D6` (blu inchiostro) | `#8FA8FF` |
| Linee | `#E4E0D6` | `#2A2826` |

Nessun toggle tema: segue il sistema.

### Tipografia
- Tutto in **Newsreader** (serif, Google Fonts), corpo 19–20px equivalenti, interlinea generosa (~1.6).
- **IBM Plex Mono** solo per anni/date, piccolo e grigio.
- Larghezza colonna ~ 36rem (≈ 65 caratteri per riga), centrata.

### Struttura (scorrimento normale, dall'alto in basso)
1. **Intestazione minima** — a sinistra "Matteo Benassi", a destra "Mantova, Italy". Una riga, piccola. Niente nav.
2. **Lettera di presentazione** — un paragrafo grande (≈ 1.4× il corpo) con la bio. I nomi dei progetti dentro il testo sono **link inline** che portano alle sezioni sotto. Es.: *"I'm Matteo, a computer engineering student in Mantova. I contribute to **Oxide**, I built **SyncForge**, and my team won **Hack4Water 2026**. I want to build software for racing teams."*
3. **Work** — etichetta di sezione in maiuscoletto grigio. Su desktop le etichette stanno **nel margine sinistro** della colonna (come le note a margine di un libro); su mobile tornano sopra. I 5 progetti sono righe di testo: **Titolo** ↗ · anno in mono · una riga di descrizione · stack in grigio. Separati solo da spazio, niente card, niente linee.
4. **Recognition** — 3 righe: piazzamento, evento, progetto.
5. **Path** — 4 righe del percorso, anno in mono a sinistra.
6. **Also** — gli altri progetti in un'unica frase/elenco inline separato da virgole, ognuno linkato.
7. **Contact** — una frase: *"The best way to reach me is info@benassimatteo.dev. My code is on GitHub. Here's my CV in English and Italian."* — ogni parte è un link.
8. **Footer** — "Last updated November 2026", piccolo, grigio.

### Interazioni e motion
- Solo i link: sottolineatura sottile che diventa piena in hover. Nient'altro si muove.
- Click sull'email = copia + testo che diventa "copied ✓" per 2 secondi.

### Mobile
Identico, la colonna occupa tutta la larghezza con un margine laterale; le etichette di sezione passano sopra il contenuto.

### Perché è diverso dall'attuale
Zero UI: niente card, niente bottoni, niente icone, niente dark slate. È il prototipo più radicale in termini di semplicità.

---

## Prototipo B — "Livrea" (poster a pannelli)

**In una frase:** il sito come una serie di poster sportivi a schermo intero: un messaggio per schermata, tipografia enorme, bianco/nero/rosso da monoposto.

### Mood e riferimenti
Grafica svizzera + livree da corsa + manifesti di gara. Grandi numeri di sezione usati come **numeri di gara** (`01`, `02`, …). Coraggioso ma con pochissimi elementi per schermata. Richiama l'obiettivo motorsport **senza** dashboard o telemetria.

### Palette (solo chiaro)
| Ruolo | Valore |
|---|---|
| Sfondo | `#FFFFFF` |
| Testo | `#0A0A0A` |
| Accento (rosso corsa) | `#E10600` |
| Grigio secondario | `#6E6E6E` |
| Pannello invertito | sfondo `#0A0A0A`, testo `#FFFFFF` |

Alterna pannelli bianchi e pannelli neri; il rosso compare **una volta per pannello** (un numero, una riga, una parola).

### Tipografia
- **Archivo** (variable, con asse width): titoli in *Archivo Expanded/ExtraCondensed Black* MAIUSCOLO, dimensioni enormi (fino a ~12vw per il nome).
- Corpo in **Archivo** regular, corto e grande.
- Numeri di sezione in condensed black, rosso, molto grandi, allineati a destra o in un angolo.

### Struttura (pannelli a tutta altezza con `scroll-snap`)
1. **01 — Nome.** "MATTEO / BENASSI" su due righe gigantesche. Sotto, piccolo: *Computer Engineering · Rust & Systems · Mantova*. In basso a destra una freccia ↓ "Scroll".
2. **02 — Podio** (pannello nero). Tre colonne: **P1** Hack4Water 2026 / **P2** SCIoTeM 2026 / **P2** SCIoTeM 2025, ognuna col nome del progetto sotto. "P1" in rosso.
3. **03 — Oxide.** Titolo enorme, una riga di descrizione, stack in grigio, link "View on GitHub →". Il numero "03" in rosso nell'angolo.
4. **04 — SyncForge.** Stessa struttura del 03 ma impaginazione **specchiata** (titolo a destra).
5. **05 — Garda Chiese Alert** (pannello nero). Stessa struttura.
6. **06 — More.** Lista compatta dei progetti rimanenti (STM32, scrobbl.rs + "Altri progetti"), due colonne, una riga ciascuno. Non snap obbligatorio se è più alto dello schermo.
7. **07 — Grid** (percorso). Quattro righe come una griglia di partenza: anno grande a sinistra, titolo e istituto a destra.
8. **08 — "BOX, BOX."** (pannello rosso pieno con testo bianco, unica eccezione). Sottotitolo: *"Open to a curricular internship in 2026/27."* Tre grandi link: Email · GitHub · CV (EN/IT).

### Interazioni e motion
- `scroll-snap-type: y mandatory` su desktop, `proximity` su mobile.
- **Barra di avanzamento** rossa sottilissima in cima alla finestra che si riempie con lo scroll (come un giro di pista che avanza).
- Indicatore di pannello fisso in basso a sinistra: `03 / 08`.
- Ingresso dei titoli: un semplice slide-in orizzontale di pochi pixel + fade quando il pannello entra (disattivato con `prefers-reduced-motion`).
- Frecce ↑/↓ e PagSu/PagGiù passano al pannello precedente/successivo (comportamento nativo dello snap).

### Mobile
I pannelli diventano alti almeno quanto lo schermo ma possono crescere; il nome scala a ~16vw; il podio va in colonna.

### Perché è diverso dall'attuale
Opposto totale: bianco al posto del dark, una cosa per schermo al posto di tutto insieme, tipografia come unico elemento grafico.

---

## Prototipo C — "Rettilineo" (scorrimento orizzontale cronologico)

**In una frase:** scorrendo con la rotella la pagina avanza **in orizzontale** lungo un rettilineo d'asfalto: ogni tappa della carriera è un punto sulla linea, dal 2019 al traguardo "Next: motorsport".

### Mood e riferimenti
Asfalto di notte e segnaletica orizzontale. Un'unica linea tratteggiata gialla attraversa tutto il sito e collega le tappe. Narrativo ma con pochissimi elementi: è la *forma* dello scroll a raccontare la storia.

### Palette (solo scuro, ma NON slate/indigo)
| Ruolo | Valore |
|---|---|
| Sfondo (asfalto) | `#16171A` |
| Superficie leggermente più chiara | `#1F2024` |
| Testo primario | `#EDEDED` |
| Testo secondario | `#8C8C8C` |
| Accento (segnaletica gialla) | `#FFD400` |

### Tipografia
- **Geist** per titoli e corpo, **Geist Mono** per anni e date (grandi, in giallo).
- Gli anni sono l'elemento tipografico dominante sulla pista.

### Struttura
1. **Hero (verticale, normale).** Nome grande a sinistra, frase manifesto, sotto la scritta piccola *"Scroll to drive →"*. In basso parte la linea tratteggiata gialla, che curva di 90° e diventa orizzontale entrando nella sezione successiva.
2. **La pista (sezione "pinnata", scroll orizzontale).** La sezione resta ferma a tutta altezza mentre lo scroll verticale la fa scorrere in orizzontale (tecnica: contenitore esterno alto quanto la lunghezza della pista, interno `sticky` con `translateX` proporzionale allo scroll). Tappe sulla linea, ognuna = anno grande in giallo + titolo + 1–2 righe + link se c'è:
   - **2019** · ITIS "E. Fermi" — inizio
   - **2023** · Internship at Novellini
   - **2024** · Diploma 100/100 → UNIMORE Computer Engineering
   - **2025** · 2nd place SCIoTeM — P7M AI Summarizer
   - **2026** · STM32 Smart Garden
   - **2026** · SyncForge
   - **2026** · scrobbl.rs
   - **2026** · 2nd place SCIoTeM — Smart Beam
   - **2026** · **1st place Hack4Water** — Garda Chiese Alert (tappa più grande delle altre)
   - **2026 · now** · **Oxide**, core contributor — il progetto più grande, ancora in corso: tappa **la più grande di tutte**, con etichetta "In progress" al posto della data di fine
   
   > Poiché il 2026 contiene molte tappe, mostra un'etichetta "2026" una sola volta come intestazione di gruppo e metti sulle tappe solo il nome; l'ordine dei premi rispetto ai progetti è libero (mesi non noti).
   - **2027 →** · **Traguardo**: bandiera a scacchi (pattern CSS semplice) + *"Next: software for motorsport."*
   Le tappe si alternano sopra e sotto la linea per dare ritmo. Una piccola "posizione attuale" (pallino giallo pieno) indica la tappa più vicina al centro dello schermo.
3. **Pit lane (verticale, normale).** Dopo il traguardo la linea torna verticale. Lista compatta "Other projects" su due colonne + Cambridge B2.
4. **Contatti (verticale).** Titolo *"Let's talk."*, email grande (click = copia), GitHub, CV EN/IT. La linea gialla finisce qui con un tratto continuo.

### Interazioni e motion
- L'unico effetto è lo scroll orizzontale della pista; nient'altro si anima.
- Frecce ←/→ e Tab tra i link funzionano; la pista è anche trascinabile col trackpad orizzontale.
- **`prefers-reduced-motion` o schermi < 768px:** la pista diventa una normale timeline **verticale** (linea gialla a sinistra, tappe impilate). Questa versione verticale va fatta bene, non è un ripiego.

### Mobile
Timeline verticale come sopra. Hero e contatti identici.

### Perché è diverso dall'attuale
È l'unico prototipo cronologico e orizzontale: invece di un catalogo di progetti, racconta un percorso con una sola metafora visiva. Scuro sì, ma caldo/asfalto e con accento giallo, non slate + indigo.

> [!WARNING]
> È il prototipo più impegnativo da implementare bene (scroll pinnato, fallback verticale, accessibilità). Verificarlo su trackpad, rotella, touch e tastiera.

---

## Prototipo D — "Racing Green" (split con colonna fissa)

**In una frase:** a sinistra un "biglietto da visita" fisso con nome e contatti sempre visibili, a destra il contenuto che scorre; verde corsa inglese e ottone.

### Mood e riferimenti
Elegante e da recruiter: il layout split-sticky reso famoso dai portfolio dev più efficaci (stile Brittany Chiang v4), ma con un'identità cromatica forte e calda: **British racing green**, crema e un dettaglio color ottone. Richiama il motorsport classico, non la telemetria.

### Palette (scuro di default + variante chiara con toggle)
| Ruolo | Dark (default) | Light |
|---|---|---|
| Sfondo | `#0F3B2C` | `#F3EEE3` (crema) |
| Superficie (hover righe) | `#14473A` | `#E9E2D2` |
| Testo primario | `#F2EBDD` | `#12352A` |
| Testo secondario | `#A9B8AE` | `#5D6B63` |
| Accento (ottone) | `#C9A45C` | `#9A7633` |

Unico prototipo con toggle tema, piccolo, in fondo alla colonna sinistra.

### Tipografia
- Nome in **Instrument Serif** (grande, elegante, solo per il nome e i titoli di sezione).
- Tutto il resto in **Instrument Sans**.
- Nessun monospace.

### Struttura
**Colonna sinistra (≈ 40%, `sticky`, alta quanto lo schermo):**
- Nome grande in serif.
- Ruolo breve + frase manifesto (2 righe).
- **Nav verticale** con 4 voci: About · Work · Record · Contact. La voce della sezione visibile si evidenzia (linea ottone che si allunga + testo primario); le altre sono grigie.
- In basso: email (click = copia), GitHub, "CV — EN / IT", riga *"Open to a curricular internship in 2026/27"*, toggle tema.

**Colonna destra (≈ 60%, scorre):**
1. **About** — la bio in 2 paragrafi brevi. Una riga finale con i 3 numeri chiave in linea (`1st · Hack4Water 2026` — `27.3/30` — `100/100`), testo semplice.
2. **Work** — i 5 progetti in evidenza come **righe** (non card): a sinistra anno piccolo, a destra titolo + una riga + stack grigio. In hover l'intera riga prende lo sfondo "superficie", il titolo diventa ottone e compare una freccia ↗; tutta la riga è cliccabile. Sotto, link testuale *"Other projects →"* che espande in place una lista di una riga per progetto (unica eccezione alla regola "niente espandibili": in alternativa, mostrarla sempre).
3. **Record** — due sotto-blocchi a righe: *Recognition* (3 premi) e *Path* (4 voci del percorso).
4. **Contact** — un paragrafo breve e un bottone grande "Email me" (copia + feedback) affiancato da "Download CV".
5. Footer minimo: *"Built with React & Astryx. Mantova, 2026."*

### Interazioni e motion
- Nav attiva aggiornata con `IntersectionObserver` (o hook Astryx equivalente); click = scroll fluido all'ancora.
- Hover sulle righe dei progetti come descritto; nessun'altra animazione.

### Mobile
La colonna sinistra diventa un header normale (non fisso) in cima: nome, ruolo, contatti in una riga di icone. La nav sparisce (pagina corta, non serve). Il contenuto segue sotto.

### Perché è diverso dall'attuale
I contatti sono sempre a portata di mano, la navigazione è una lista di 4 parole, i progetti sono righe e non pannelli. Palette verde/crema/ottone lontanissima dallo slate/indigo attuale.

---

## 3. Confronto rapido

| | A — Quaderno | B — Livrea | C — Rettilineo | D — Racing Green |
|---|---|---|---|---|
| **Sensazione** | Calma, letteraria | Audace, sportiva | Narrativa, notturna | Elegante, professionale |
| **Scorrimento** | Verticale normale | Pannelli a scatto (snap) | Orizzontale pinnato | Split con colonna fissa |
| **Tema** | Carta, auto dark | Bianco/nero/rosso | Asfalto + giallo | Verde + crema + ottone |
| **Densità** | Bassissima | Bassa (1 idea/schermo) | Bassa | Media |
| **Font** | Newsreader + Plex Mono | Archivo | Geist + Geist Mono | Instrument Serif + Sans |
| **Difficoltà** | ★☆☆☆ | ★★☆☆ | ★★★★ | ★★☆☆ |
| **Ideale per** | Chi legge con calma | Farsi ricordare | Raccontare il percorso | Recruiter con poco tempo |

> [!TIP]
> Ordine di implementazione consigliato: **A → D → B → C** (dal più semplice al più complesso), così i primi confronti arrivano subito. A e D sono le scelte più sicure per i recruiter; B è la più memorabile; C la più originale ma anche la più fragile.
