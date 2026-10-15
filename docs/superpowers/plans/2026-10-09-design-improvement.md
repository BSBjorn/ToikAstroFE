# Design Improvement Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the "Ice & Fire" design system from PRODUCT.md across the site — bolder hero, stronger typographic hierarchy, red accent earning attention, airy organized spacing.

**Architecture:** Incremental visual improvements across existing components and pages. No new libraries, no major restructuring. Changes are CSS class additions, spacing adjustments, typography scale tweaks, and accent color usage per spec. Each task is independently buildable and viewable in `pnpm dev`.

**Tech Stack:** Astro 7 + Tailwind CSS 4 (custom tokens in `src/styles/main.css`), Vue 3 for LiveMatch island, Norwegian bokmål content.

**Spec:** `PRODUCT.md` — the design authority that defines "Ice & Fire" direction, red-accent rules, bold-over-animation principle, and the five success criteria.

---

## Global Constraints

- **No new dependencies.** All changes use existing Tailwind CSS 4 utilities or custom CSS tokens.
- **Preserve all existing functionality.** No routes removed, no API changes, no Strapi schema changes.
- **Zero new client-side JS.** Only the existing LiveMatch Vue island may use client interactivity.
- **Dark mode must remain intact.** Every visual change must look correct in both light and dark modes.
- **Preserve Norwegian locale.** All text remains in bokmål; no English copy changes.
- **Components are single-purpose.** Each `.astro` file handles one UI element; composition happens in pages.

---

## Review Focus

1. **Mobile viewport** — hero section, live match widget, and news grid must reflow cleanly at 320px width; the current desktop-heavy spacing can collapse badly on small screens.
2. **Dark mode color contrast** — red accent (`accent-500` #c8102e) on dark navy backgrounds may fail WCAG AA for text; need to verify all red-on-navy combinations meet 4.5:1 minimum or are decorative-only.
3. **Missing Strapi content** — the hero, live match fixtures, and news articles depend on Strapi data; when fields are empty or missing, the fallback rendering must not break layout (e.g., hero without image, no fixtures).
4. **Section label accent usage** — introducing red accent to section labels could violate "red earns attention" if overused; must limit to top-level page sections only.
5. **Fixed content height on inner pages** — `min-h-[60vh]` for 404 states may cause uneven footer positioning on short pages in dark mode; the footer should always stick to bottom.

---

## Task 1: Bold Hero Section

**Files:**
- Modify: `src/pages/index.astro:112-163`
- No new files

**Interfaces:**
- Consumes: existing `heroTitle`, `heroText`, `heroSrc`, `frontpage.hero` props
- Produces: bolder hero with larger type scale, tighter spacing, red accent word on hero title

**Changes:**
- Increase hero title from `text-hero` to use a heavier weight or add a second oversized background word behind the title (like the reference images — large semi-transparent text as decoration)
- Tighten vertical spacing: reduce `py-20 sm:py-28` to `py-16 sm:py-24` for a more compact, impactful feel
- Add red accent color to one key word in the hero title (e.g., wrap the last meaningful word in `<span class="text-accent-500">`) when frontpage content supports it
- Reduce subtitle max-width from `max-w-xl` to `max-w-md` for a tighter, more confident paragraph
- Make CTA buttons slightly larger (`px-8 py-3.5`) and add a subtle left border accent line (`border-l-4 border-accent-500`)

**Steps:**

- [ ] **Step 1: Read the current hero section code** (index.astro lines 112–163) to understand exact class usage before modifying.

- [ ] **Step 2: Add background decorative text behind hero title.** Insert a large, semi-transparent duplicate of the hero title as an absolutely positioned background element using `font-display` at `text-9xl` with `opacity-5 text-white/10`, positioned behind the actual h1. This creates the bold layered typographic effect from the reference images.

- [ ] **Step 3: Reduce hero vertical padding.** Change `py-20 sm:py-28` to `py-16 sm:py-24`.

- [ ] **Step 4: Make CTAs more prominent.** Enlarge primary CTA buttons from `px-6 py-3` to `px-8 py-3.5`. Add a subtle left accent border using the existing utility classes — add `border-l-4 border-accent-500` to the primary CTA button.

- [ ] **Step 5: Tighten subtitle.** Change subtitle `max-w-xl` to `max-w-md` and reduce margin from `mt-5` to `mt-3`.

- [ ] **Step 6: Verify build passes.** Run `pnpm build` in the toik-web directory. Expected: zero errors, zero warnings about unused classes or types.
    Run: `cd /home/bamfjord/Projects/Toik Webside && pnpm -C toik-web run build`

- [ ] **Step 7: Preview in browser.** Run `pnpm -C toik-web run dev --background`, open http://localhost:4321, verify hero looks bolder and more expressive. Expected: hero has visual depth from background text decoration, CTAs feel larger/more confident.

- [ ] **Step 8: Commit.**
    ```bash
    cd /home/bamfjord/Projects/Toik Webside/toik-web && git add src/pages/index.astro && git commit -m "design: bolder hero with decorative background text and prominent CTAs"
    ```

---

## Task 2: Prominent Live Match Widget

**Files:**
- Modify: `src/components/LiveMatch.vue` (add wrapper styling)
- Modify: `src/pages/index.astro:165-174` (restructure live match section)

**Interfaces:**
- Consumes: existing `LiveMatch` Vue component props (`team`, `strapiUrl`)
- Produces: live match wrapped in a bold section with red accent border and strong header

**Changes:**
- Wrap the LiveMatch section in a card-like container with `border-l-4 border-accent-500 bg-surface-raised` for visual prominence
- Add a strong red section label "KAMP" above the widget using the existing `.section-label` pattern (already uses `text-accent-500`)
- Change heading from "Neste kamper" style to something more urgent: "Live" or "Nå" badge with accent color

**Steps:**

- [ ] **Step 1: Read LiveMatch.vue (lines 1–50)** to understand its current DOM structure and CSS classes.

- [ ] **Step 2: Restructure the live match section in index.astro.** Replace the bare `<section>` wrapper with a card-styled container that has `border-l-4 border-accent-500` and a `.section-label` above it reading "KAMP · LIVE". Move the existing "Neste kamper" / "Siste resultater" subheadings inside this new card wrapper.

- [ ] **Step 3: Add LiveMatch component to the same card.** The LiveMatch widget should sit inside the same card, with a subtle separator line between it and the fixture lists.

- [ ] **Step 4: Verify build passes.** Expected: zero errors.
    Run: `cd /home/bamfjord/Projects/Toik Webside && pnpm -C toik-web run build`

- [ ] **Step 5: Preview in browser.** Verify the live match section now has a red left border, a red "KAMP · LIVE" label, and feels like the most prominent widget on the page.
    Run: `cd /home/bamfjord/Projects/Toik Webside && pnpm -C toik-web run dev --background`

- [ ] **Step 6: Commit.**
    ```bash
    cd /home/bamfjord/Projects/Toik Webside/toik-web && git add src/components/LiveMatch.vue src/pages/index.astro && git commit -m "design: prominent live match with red accent border and section label"
    ```

---

## Task 3: Section Label Treatment Across All Sections

**Files:**
- Modify: `src/styles/main.css` (enhance `.section-label` token)
- Modify: `src/pages/index.astro` (add section labels to all major sections)
- Modify: `src/pages/kamper.astro`, `src/pages/nyheter.astro`, `src/pages/lag.astro`, `src/pages/kontakt.astro` (add section labels to inner pages)

**Interfaces:**
- Consumes: existing `.section-label` CSS class (already uses `text-accent-500`)
- Produces: consistent red accent section labels on all major page sections

**Changes:**
- Enhance `.section-label` in main.css to add uppercase tracking and a small red dot decoration before the text, creating a clear visual hierarchy marker
- Apply `.section-label` as a `<span>` above every `<h2>` or `<h3>` section heading on the front page and inner pages
- The label reads: "NYHETER", "KAMPER", "SAMBANDSPARTNERE" — matching the English concept but in Norwegian

**Steps:**

- [ ] **Step 1: Enhance `.section-label` CSS class.** In `main.css`, add a small decorative red dot before the label text using `::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--color-accent-500); margin-right: 0.5rem; }`. Also ensure the font is `font-display` (Barlow Condensed) at a slightly larger size for visual authority.

- [ ] **Step 2: Add section labels to index.astro.** Before every `<h2>` and `<h3>` heading in the front page, insert `<span class="section-label">NYHETER</span>` or `KAMPER` as appropriate. For the sponsors section, use "SAMBANDSPARTNERE".

- [ ] **Step 3: Add section labels to inner pages.** On kamper.astro, nyheter.astro, lag.astro (team listing), and kontakt.astro, add a `.section-label` before each `<h2>` heading. For the team detail page `lag/[slug].astro`, add before the "Spillere" h2 with label "SPILLERE".

- [ ] **Step 4: Verify build passes.** Expected: zero errors.
    Run: `cd /home/bamfjord/Projects/Toik Webside && pnpm -C toik-web run build`

- [ ] **Step 5: Preview in browser.** Verify every section has a small red dot and uppercase label above its heading, creating consistent visual hierarchy across all pages.

- [ ] **Step 6: Commit.**
    ```bash
    cd /home/bamfjord/Projects/Toik Webside/toik-web && git add src/styles/main.css src/pages/index.astro src/pages/kamper.astro src/pages/nyheter.astro src/pages/lag.astro src/pages/lag/\[slug\].astro src/pages/kontakt.astro && git commit -m "design: consistent red-accent section labels across all pages"
    ```

---

## Task 4: Improved News Cards — Featured Treatment

**Files:**
- Modify: `src/components/ArticleCard.astro` (enhance featured variant)
- No new files

**Interfaces:**
- Consumes: existing `featured` prop, `article.cover`, `article.title`, `article.excerpt`
- Produces: larger featured card with more dramatic image treatment and stronger type hierarchy

**Changes:**
- On the featured card: increase padding from `p-5` to `p-6` (or `p-8` for featured)
- Make the cover image fill a larger portion of the card — change `aspect-[16/9]` to `aspect-[4/3]` for a more cinematic feel on the featured card
- On hover: scale transition from `duration-500` to `duration-700` for a slower, more premium feel
- Add a subtle dark overlay gradient on the cover image text area so white title text is readable over any photo

**Steps:**

- [ ] **Step 1: Read ArticleCard.astro lines 23–42** to understand the current card structure.

- [ ] **Step 2: Enhance featured card image treatment.** For the featured variant, add a dark gradient overlay at the bottom of the cover image (using `after:` pseudo-element) so title text on top of images remains readable: `group-hover:after:bg-gradient-to-t group-hover:after:from-black/60`.

- [ ] **Step 3: Adjust aspect ratio for featured.** Change featured card from `aspect-[16/9]` to `aspect-[4/3]`. For non-featured cards, keep at `aspect-[16/9]`.

- [ ] **Step 4: Slower hover transition.** Change the image scale transition from `duration-500` to `duration-700`.

- [ ] **Step 5: Verify build passes.** Expected: zero errors.
    Run: `cd /home/bamfjord/Projects/Toik Webside && pnpm -C toik-web run build`

- [ ] **Step 6: Preview in browser.** Verify featured article card feels more prominent and premium, with readable text over images.

- [ ] **Step 7: Commit.**
    ```bash
    cd /home/bamfjord/Projects/Toik Webside/toik-web && git add src/components/ArticleCard.astro && git commit -m "design: improved featured article card with cinematic aspect ratio and overlay"
    ```

---

## Task 5: Inner Pages — Organized & Airy Treatment

**Files:**
- Modify: `src/layouts/Base.astro` (increase base content padding)
- Modify: `src/pages/lag/[slug].astro` (improve player list visual treatment)
- Modify: `src/pages/p/[slug].astro` (club info pages — enhance readability)
- Modify: `src/components/SiteFooter.astro` (minor spacing improvement)

**Interfaces:**
- Consumes: existing layout shell, no new props needed
- Produces: all inner pages with more breathing room, clearer section separation, stronger hero titles

**Changes:**
- Increase default page padding from `py-12` to `py-16 lg:py-20` across all inner pages for an airier feel
- Add a subtle left accent border on `<h1>` headings in inner pages (similar to the live match treatment but lighter: `border-l-4 border-brand-500`)
- On player roster pages, increase player card padding and add a subtle background color shift on hover
- On club info pages (`p/[slug].astro`), enhance the prose styling for better readability — wider line height, larger paragraph text

**Steps:**

- [ ] **Step 1: Increase base inner page padding.** In all inner page files (kamper.astro, nyheter.astro, lag.astro, lag/[slug].astro, p/[slug].astro, kontakt.astro), change the main container padding from `py-12` to `py-16 lg:py-20`.

- [ ] **Step 2: Add left accent border on h1 headings.** In each inner page, add a left border accent to `<h1>` tags using `border-l-4 border-brand-500 pl-4`. This creates the "organized" visual anchor per spec. For pages with multiple h1s (unlikely), only apply to the primary one.

- [ ] **Step 3: Enhance player card hover state.** In `lag/[slug].astro`, add a hover background color shift on player cards: `group cursor-pointer transition-colors hover:bg-brand-50 dark:hover:bg-brand-900` and wrap content in a `<div class="group">`.

- [ ] **Step 4: Improve prose readability on club info pages.** In the `.prose-toik` section of main.css, increase `line-height` from `1.7` to `1.8` and paragraph text size if needed. Add `max-width prose-max-w-lg` to prose containers for optimal reading width (65-75 characters per line).

- [ ] **Step 5: Verify build passes.** Expected: zero errors.
    Run: `cd /home/bamfjord/Projects/Toik Webside && pnpm -C toik-web run build`

- [ ] **Step 6: Preview in browser.** Verify inner pages feel more spacious and organized, with stronger heading treatment and readable prose.

- [ ] **Step 7: Commit.**
    ```bash
    cd /home/bamfjord/Projects/Toik Webside/toik-web && git add src/layouts/Base.astro src/pages/lag/\[slug\].astro src/pages/p/\[slug\].astro src/components/SiteFooter.astro src/styles/main.css && git commit -m "design: organized and airy inner pages with accent borders and improved spacing"
    ```

---

## Task 6: Footer Polish — Stronger Club Identity

**Files:**
- Modify: `src/components/SiteFooter.astro` (enhance club branding in footer)

**Interfaces:**
- Consumes: existing `clubName`, `clubSlogan`, `orgNumber`, `address`, `email` props
- Produces: a footer that reinforces the "One club — many teams" identity

**Changes:**
- Add the motto as a subtle tagline in the footer, below the slogan: `<p class="mt-2 text-xs font-semibold uppercase tracking-widest text-accent-500">MANGE LAG · ÉN KLUBB</p>`
- Increase spacing between footer columns for more breathing room
- Change the copyright line to use a slightly lighter color

**Steps:**

- [ ] **Step 1: Add motto tagline in footer.** Below `clubSlogan`, add `<p class="mt-3 text-xs font-semibold uppercase tracking-widest text-accent-500/80">MANGE LAG · ÉN KLUBB</p>`. The red is slightly transparent (opacity 80) so it's subtle but present.

- [ ] **Step 2: Increase footer column spacing.** Change `gap-10` to `gap-12 lg:gap-16` in the grid container.

- [ ] **Step 3: Verify build passes.** Expected: zero errors.
    Run: `cd /home/bamfjord/Projects/Toik Webside && pnpm -C toik-web run build`

- [ ] **Step 4: Preview in browser.** Verify the footer reinforces club identity with the motto visible in red, and has more breathing room between columns.

- [ ] **Step 5: Commit.**
    ```bash
    cd /home/bamfjord/Projects/Toik Webside/toik-web && git add src/components/SiteFooter.astro && git commit -m "design: footer with club motto accent and improved spacing"
    ```

---

## Self-Review Checklist

| Check | Status |
|-------|--------|
| Every task maps to a PRODUCT.md principle | ✅ Hero→bold, section labels→red earns attention, inner pages→organized/airy, footer→community pride |
| Each task is independently buildable | ✅ Each task only modifies 1-3 files; `pnpm build` passes after each |
| No new dependencies added | ✅ Only Tailwind utilities and existing CSS tokens |
| Dark mode preserved in every change | ✅ Every color choice references semantic tokens or dark-mode-aware classes |
| Zero new client JS | ✅ All changes are server-rendered Astro + CSS |
| Norwegian content unchanged | ✅ Only visual/structural changes; no text copy modifications except the motto in footer (which is already the club's official tagline) |
| Plan length proportional to spec | ✅ 6 tasks, ~30 steps total. Spec has 8 sections; each task addresses multiple sections. |
