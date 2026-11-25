# MOVE 2026 Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `Portfolio-2026-move_compressed_compressed.pdf` into a visually faithful, responsive, interactive static `HTML / CSS / JS` portfolio website (`index.html`, `styles.css`, `script.js`, `assets/`).

**Architecture:** Hybrid Exact-Section Reconstruction. The structural frame (Hero metadata/copy, "A Journey of Success", clickable Client Logo strips, scroll-reveal navbar, Lightbox modal, and white Footer band) is built in semantic HTML/CSS/JS, while all campaign artworks and cosmic background plates are cropped at high resolution directly from the source PDF into optimized WebP/JPEG/PNG assets and arranged in the exact section cadence and multi-column grids of the PDF.

**Tech Stack:** Vanilla HTML5, CSS3 (Grid, Flexbox, Custom Properties), Vanilla ES6 JavaScript, Node.js scratch tooling (temporary in artifact scratch directory only) to render and crop high-res assets from the PDF without adding build dependencies to the workspace.

**Spec / Confirmed Decisions (from Brainstorming & Grill-Me):**
- **Visual Fidelity:** Match the PDF's exact dark cosmic palette, typography hierarchy, section order, multi-column compositions, and white bottom footer band.
- **UI Language:** English structural copy (`PORTFOLIO MOVE 2026`, `A Journey of Success`, `MOVEMENA.COM`, `INFO@MOVEMENA.COM`), preserving original Arabic and English copy inside cropped campaign visuals.
- **Navigation & Filtering:** Minimal sticky navbar revealed only after scrolling past the Hero; clickable logos in the client strips smoothly scroll to the corresponding brand section, plus an optional quick brand filter with "All Works" reset.
- **Lightbox Modal:** Clicking any campaign artwork opens a dark backdrop Lightbox with client label, artwork title, Prev/Next navigation, keyboard support (`Esc`, `ArrowLeft`, `ArrowRight`), and click-outside-to-close.
- **Motion:** Restrained and intentional (subtle Hero load entrance + light hover affordance on clickable artworks; `prefers-reduced-motion` respected; no generic scroll-reveal spam).
- **Footer & Contact:** Exact match to the PDF white footer bar with clickable `MOVEMENA.COM`, `mailto:info@movemena.com`, and 1-click Copy Email with toast feedback (no extra contact form).

## Global Constraints

- Pure static output in `e:\yalla`: `index.html`, `styles.css`, `script.js`, and `assets/` — zero runtime frameworks, bundlers, or `node_modules` inside `e:\yalla`.
- Zero horizontal overflow at `1440px`, `1024px`, `768px`, and `375px` viewports.
- All below-the-fold campaign images must use `loading="lazy"` and explicit `aspect-ratio` or `width`/`height` to avoid layout shift (CLS).
- All interactive controls (`button`, `a`, Lightbox close/prev/next, copy email, filter pills) must be keyboard-accessible with visible `:focus-visible` states.
- Respect `@media (prefers-reduced-motion: reduce)` by disabling entrance and hover transitions.

## Review Focus

- **Ultra-tall PDF high-res rendering truncation:** The source PDF page is `1624.82 × 14094.5` pt (~1:8.67 ratio); naive single-canvas rendering can hit browser/GPU texture caps (e.g., 16,384px height limit). Verify cropped strips cover 100% of `0..14094.5` pt without blurry downscaling or clipped bottom footer.
- **Mobile grid reflow vs. PDF desktop fidelity:** Desktop (`>=1024px`) must match multi-column PDF layouts (`2-col`, `3-col`, `4-col`), while `<768px` must stack cleanly without squished images or horizontal scrollbars.
- **Lightbox focus management & keyboard trap:** Opening Lightbox must move focus inside the modal, support `Esc` / `ArrowLeft` / `ArrowRight`, and restore focus to the triggering artwork button upon closing.
- **Filter state & section jumping conflict:** If a user clicks a client logo while a filter is active (or resets via navbar), hidden sections must un-hide before smooth-scrolling so the target section is never scrolled to at `0px` height.
- **Clipboard API fallback:** `navigator.clipboard.writeText` can fail on `file://` or non-HTTPS origins; implement a clean fallback (`textarea` + `execCommand('copy')`) so Copy Email works even when opened locally.

---

## File Structure

- `e:\yalla\index.html` — Semantic HTML5 document matching all 17 PDF sections + sticky nav + Lightbox modal + toast region.
- `e:\yalla\styles.css` — Design tokens, typography, Hero/Cosmic layouts, brand section grids, responsive breakpoints, Lightbox & Toast styles, reduced-motion rules.
- `e:\yalla\script.js` — Scroll-reveal navbar, brand smooth-scroll & quick filter controller, Lightbox gallery controller with keyboard/focus management, and 1-click Copy Email handler.
- `e:\yalla\assets\` — High-resolution cropped artwork assets extracted from `Portfolio-2026-move_compressed_compressed.pdf` (organized by section: `hero-bg.webp`, `astronaut-bg.webp`, `nbe-1..5.webp`, `cib-1..2.webp`, `global-1..3.webp`, `etmanna-strip.webp`, `etmanna-hero.webp`, `roza-school.webp`, `go-1..3.webp`, `etmanna-beauty-1..6.webp`, `elsayed-1..3.webp`, `roza-shoe.webp`, `cherry-1..2.webp`, `yalla-1..7.webp`, `magnesia-1..3.webp`, `global-grid-1..6.webp`, `outro-bg.webp`, plus `move-logo.svg`).

---

### Task 1: High-Resolution PDF Asset Extraction & Cropping Pipeline

**Files:**
- Scratch script (outside repo): `<ArtifactDir>/scratch/extract_pdf_assets.mjs`
- Output directory: `e:\yalla\assets\`

**Interfaces:**
- Consumes: `e:\yalla\Portfolio-2026-move_compressed_compressed.pdf`
- Produces: Named WebP/PNG files in `e:\yalla\assets/` matching exact coordinates of every section and individual campaign panel in the PDF.

- [ ] **Step 1: Set up temporary PDF rendering tool in scratch directory**
  Install `mupdf` or `pdfjs-dist` + `sharp` inside `<ArtifactDir>/scratch/` (never inside `e:\yalla`) and verify it can render bands of `Portfolio-2026-move_compressed_compressed.pdf` at `2x` scale (`~3250px` wide) without hitting canvas height limits.

- [ ] **Step 2: Render banded full-height master strips and inspect slice boundaries**
  Render vertical bands (e.g., 4–5 overlapping bands) and verify exact pixel `Y` and `X` coordinates for every section and card against the visual layout.

- [ ] **Step 3: Crop and optimize all individual campaign panels & background plates**
  Crop each card/banner individually (so each card is clickable in the Lightbox and responsive grids rearrange cleanly on mobile), saving optimized WebP assets (`quality: 88`) into `e:\yalla\assets/`.

- [ ] **Step 4: Visually verify cropped assets**
  Inspect representative cropped images (Hero, NBE, CIB, etmanna, Yalla Grow, Magnesia, Outro) with `read_file` to ensure zero cut-off text, zero seams, and sharp resolution.

---

### Task 2: Semantic HTML Structure & Brand SVG Mark (`index.html`)

**Files:**
- Create: `e:\yalla\index.html`
- Create: `e:\yalla\assets\move-logo.svg`

**Interfaces:**
- Produces DOM landmarks & IDs consumed by `styles.css` and `script.js`:
  - `#sticky-nav`, `[data-nav-toggle]`
  - `#hero`, `#about`, `#nbe`, `#cib`, `#global`, `#etmanna`, `#roza`, `#go`, `#etmanna-beauty`, `#elsayed-ashta`, `#roza-footwear`, `#cherry-grills`, `#brands`, `#yalla-grow`, `#magnesia`, `#global-grid`, `#contact`
  - `[data-brand-section="<slug>"]`, `[data-filter-btn="<slug>"]`, `[data-jump-brand="<slug>"]`
  - `[data-lightbox-item]` with `data-src`, `data-brand`, `data-title`
  - `#lightbox` (`role="dialog" aria-modal="true"`), `[data-lb-img]`, `[data-lb-brand]`, `[data-lb-title]`, `[data-lb-counter]`, `[data-lb-prev]`, `[data-lb-next]`, `[data-lb-close]`
  - `[data-copy-email]`, `#copy-toast` (`aria-live="polite"`)

- [ ] **Step 1: Create crisp `move-logo.svg` vector lockup**
  Author an SVG matching the exact `mo / ve ™` stacked wordmark from the PDF in white (`currentColor` so it renders white on dark Hero/Outro and `#0A0A0A` on the white Footer).

- [ ] **Step 2: Author `index.html` with all 17 PDF sections in exact order**
  Include Google Fonts (`Plus Jakarta Sans`) with `display=swap` fallback, proper `<meta>` tags, Hero overlay copy (`PORTFOLIO MOVE 2026`, `EFFECTIVE MARKETING FOR YOUR COMPANY STARTS WITH MOVE`, `MOVEMENA.COM`, `INFO@MOVEMENA.COM`), *A Journey of Success* copy, clickable client logo strip, every campaign grid using `<button type="button" data-lightbox-item ...><img ...></button>`, white brand divider strip, and the exact white PDF footer bar.

- [ ] **Step 3: Validate HTML structure**
  Check that all `<img>` sources resolve to existing files in `e:\yalla\assets\`, all interactive elements have descriptive `aria-label` / `alt` attributes, and zero broken relative links exist.

---

### Task 3: PDF-Faithful Styling & Responsive Layout (`styles.css`)

**Files:**
- Create: `e:\yalla\styles.css`

**Interfaces:**
- Consumes class names and `data-*` attributes defined in `index.html`.
- Produces responsive layouts matching PDF proportions on desktop (`>=1024px`) and clean stacking on tablet/mobile (`<1024px`, `<768px`), plus Lightbox, Sticky Nav, Filter Bar, and Toast styles.

- [ ] **Step 1: Define design tokens and base reset**
  Set root palette (`--bg-void: #04070b`, `--bg-surface: #0b1117`, `--bg-white: #ffffff`, `--text-primary: #f5f7fa`, `--text-muted: #9ba6b2`, `--accent-cyan: #45b6e5`), max-width container (`1240px` matching PDF canvas proportions), clean typography scale, and `scroll-behavior: smooth`.

- [ ] **Step 2: Style Hero, "A Journey of Success", Client Strips, and Sticky Nav**
  Match Hero framing (top-left `move™`, centered `PORTFOLIO / MOVE 2026` over Earth/turtle scene, bottom 2-column info bar), translucent sticky nav revealed via `.is-visible` class, and client logo strip hover/focus states.

- [ ] **Step 3: Style all Campaign Sections matching PDF grids**
  Implement exact PDF section grids: NBE (`2-col` + `3-col`), CIB (`2-col`), GLOBAL (`3-col`), etmanna strip + app hero, ROZA full banner, GO (`3-col`), etmanna beauty (`3-col` + `3-col`), elsayed ashta (`3-col`), ROZA footwear full banner, Cherry Grills (`2-col`), White Brand Strip, Yalla Grow (`4-col` + `3-col`), Magnesia (`1.15fr / 1fr` asymmetric 2-col with stacked right items), GLOBAL IT grid (`3×2`), Cosmic Outro, and white Footer band.

- [ ] **Step 4: Style Lightbox Modal, Filter Pills, Toast & Reduced Motion**
  Style centered dark Lightbox with crisp framing, Prev/Next buttons, counter badge, Copy Email toast, active filter badge (`[hidden]` support), `:focus-visible` outlines, and `@media (prefers-reduced-motion: reduce)` overrides.

---

### Task 4: Interactive JavaScript Controllers (`script.js`)

**Files:**
- Create: `e:\yalla\script.js`

**Interfaces:**
- Initializes on `DOMContentLoaded`:
  - `initStickyNav()` — toggles `.is-visible` on `#sticky-nav` when Hero scrolls out of view (`IntersectionObserver`).
  - `initBrandNavigation()` — clicking any `[data-jump-brand]` logo un-filters if needed and smooth-scrolls to the brand's section; `[data-filter-btn]` filters `[data-brand-section]` blocks cleanly with an `"All"` reset.
  - `initLightbox()` — collects `[data-lightbox-item]` nodes, opens `#lightbox`, manages `currentIndex`, updates image/brand/title/counter, handles `Escape` / `ArrowLeft` / `ArrowRight` / backdrop click, and restores focus to `lastFocusedElement`.
  - `initCopyEmail()` — copies `info@movemena.com` using `navigator.clipboard.writeText` with `textarea` fallback and triggers `#copy-toast`.

- [ ] **Step 1: Implement `initStickyNav()` and `initBrandNavigation()`**
  Ensure clicking a client logo while a different brand filter is active automatically resets or switches the filter before scrolling so the user never lands on a hidden section.

- [ ] **Step 2: Implement `initLightbox()` with full keyboard & focus accessibility**
  Preload adjacent image on open, lock body scroll while open, trap/handle `Escape`, `ArrowLeft`, `ArrowRight`, and return focus on close.

- [ ] **Step 3: Implement `initCopyEmail()` with local `file://` fallback**
  Show confirmation toast for 2.4s and announce cleanly via `aria-live="polite"`.

---

### Task 5: End-to-End Browser Verification & Visual Comparison

**Files:**
- Modify (only if visual/layout fixes found): `e:\yalla\index.html`, `e:\yalla\styles.css`, `e:\yalla\script.js`

- [ ] **Step 1: Serve `e:\yalla` locally and inspect with browser subagent / Playwright**
  Launch a local static server and verify:
  1. Zero console errors or failed image requests (`404`s).
  2. Visual screenshot comparison across desktop (`1440px`) and mobile (`375px`) against `Portfolio-2026-move_compressed_compressed.pdf`.
  3. Zero horizontal overflow (`document.documentElement.scrollWidth <= window.innerWidth`).

- [ ] **Step 2: Test all interactive flows in browser**
  1. Scroll past Hero -> verify `#sticky-nav` appears.
  2. Click a client logo in the strip -> verify smooth scroll to section; test filter & reset.
  3. Click a campaign card -> verify `#lightbox` opens, `ArrowRight` / `ArrowLeft` advances items, `Esc` closes and restores focus.
  4. Click Copy Email -> verify `#copy-toast` appears.

- [ ] **Step 3: Final Code Quality & Web Guidelines Review**
  Apply `clean-code-guard` and `web-design-guidelines` checks across HTML/CSS/JS, remove any temporary scratch artifacts from `e:\yalla` (verify only clean project files + `docs/` remain), and confirm everything passes cleanly.
