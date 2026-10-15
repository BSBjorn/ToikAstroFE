---
name: TOIK Web
description: Ishall-nettside for Tønsberg og Omegn Ishockeyklubb — kaldt, sportslig, fellesskapelig
colors:
  primary:
    navy-50: "#eef3f9"
    navy-100: "#d6e2f0"
    navy-200: "#adc4e0"
    navy-300: "#7c9fcb"
    navy-400: "#4a74a8"
    navy-500: "#2b5286"
    navy-600: "#1d3c66"
    navy-700: "#142c4c"
    navy-800: "#0f2138"
    navy-900: "#0a1a2f"
    navy-950: "#061120"
  accent:
    red-50: "#fdeaee"
    red-100: "#fbd0d8"
    red-200: "#f5a3b2"
    red-300: "#ee6c83"
    red-400: "#e03a58"
    red-500: "#e81a30"
    red-600: "#a60c26"
    red-700: "#82091e"
    red-800: "#5e0616"
    red-900: "#3d040e"
  neutral:
    ice-50: "#f8fafc"
    ice-100: "#eef2f6"
    ice-200: "#dde4ec"
    ice-300: "#c3cedb"
    ice-400: "#94a4b8"
    ice-500: "#64748b"
    ice-600: "#47566b"
    ice-700: "#334154"
    ice-800: "#1f2937"
    ice-900: "#111827"
  surface:
    base: "var(--color-ice-50)"
    raised: "#ffffff"
    sunken: "var(--color-ice-100)"
    invert: "var(--color-brand-900)"
  ink:
    primary: "var(--color-brand-900)"
    muted: "var(--color-ice-600)"
    invert: "var(--color-ice-50)"
  line:
    default: "var(--color-ice-200)"
    strong: "var(--color-ice-300)"
typography:
  display:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  hero:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  body:
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    lineHeight: 1.6
  label:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.05em"
    textTransform: "uppercase"
rounded:
  sm: "4px"
  md: "12px"
  pill: "999px"
spacing:
  gutter: "1rem"
  content-max: "72rem"
components:
  button-primary:
    backgroundColor: "{colors.navy-600}"
    textColor: "{colors.surface.raised}"
    rounded: "{rounded.md}"
    fontSize: "0.875rem"
    fontWeight: 600
    paddingInline: "1.25rem"
    paddingBlock: "0.625rem"
  button-accent:
    backgroundColor: "{colors.red-500}"
    textColor: "{colors.surface.raised}"
    rounded: "999px"
    fontSize: "1rem"
    fontWeight: 600
    paddingInline: "1.5rem"
    paddingBlock: "0.75rem"
  button-outline:
    borderColor: "{colors.navy-600}"
    borderWidth: "1px"
    textColor: "{colors.navy-600}"
    rounded: "{rounded.md}"
    fontSize: "0.875rem"
    fontWeight: 600
  button-pill:
    rounded: "{rounded.pill}"
    extendButton: "button-primary"
  card-default:
    backgroundColor: "{colors.surface.raised}"
    borderColor: "{colors.line.default}"
    borderWidth: "1px"
    borderRadius: "{rounded.md}"
    boxShadow: "{shadows.card}"
---

# Design System: TOIK

## Overview

**Creative North Star: "The Ice Rink at Dusk"**

A Norwegian ice hockey club website that carries the atmosphere of a local arena at night — deep navy stands as the night sky, cold ice-blue surfaces evoke the rink, and one vivid red accent cuts through like the scoreboard glowing in the dark. The design is professional enough to print on a programme, energetic enough to make someone want to put on their skates. Inclusive and warm without being loud; the accent earns attention because almost nothing else uses it.

**Key Characteristics:**
- Deep navy base with cold ice-blue neutrals — serious, authoritative, prints well on club kit
- Single hot red accent reserved for live state, scores, and calls to action
- Flat-by-default surfaces with subtle shadows only for cards and hover states
- Condensed display typefaces carry the club's voice; clean sans-serif handles body copy
- Pill-shaped buttons for hero CTAs; rounded rectangles (12px) for UI elements

## Colors

Palette built on three ramps: navy (primary), rink red (accent), ice neutrals. When real brand colors arrive, swap the two ramp definitions — the semantic layer underneath updates everywhere automatically.

### Primary (Navy)
- **Midnight Navy** (#0a1a2f): Base surface for dark hero sections, inverted text on light backgrounds. The club's anchor colour.
- **Ice-Bedrock Navy** (#1d3c66): Button-primary fill, primary link text, active nav indicators.

### Accent (Rink Red)
- **Scoreboard Red** (#e81a30): Hero CTAs ("Bli med i klubben"), live match state, the only element that should draw eyes on a page with this palette. The One Voice Rule applies: one accent element per viewport at most.

### Neutral (Ice)
- **Rink White** (#f8fafc): Page body background (`ice-50`). Cold-toned off-white, never pure white.
- **Boards Light** (#ffffff): Raised card and surface fill — the bright ice slab above rink level.
- **Frosted Line** (#dde4ec): Sunken surfaces, default borders, dividers.
- **Skate Mark** (#64748b): Muted text for dates, venues, secondary labels.

### Named Rules
**The One Voice Rule.** Scoreboard Red is used on ≤10% of any given screen's area. It appears only on CTAs, live state indicators, and outcome badges (win/loss). Everything else stays navy, ice, or white.

## Typography

**Display Font:** Barlow Condensed (`'Barlow Condensed', 'Arial Narrow', system-ui, sans-serif`) — tall, condensed, sporting-club energy. Used for hero headings, section headers, navigation labels, scores, and club name in the logo.

**Body Font:** Inter (`'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif`) — clean, highly legible sans-serif for paragraphs, article cards, forms, and metadata.

- **Hero** (clamp 2.5–4.5rem, tight leading 1.02, slight negative tracking −0.02em): Full-page hero titles only. The biggest voice on the site.
- **Display Heading** (clamp 1.75–2.75rem, leading 1.1, tracking −0.015em): Section headers ("Siste nytt", "Kamper"), page `<h1>`. Condensed typeface carries weight without bulk.
- **Body Heading** (`text-xl`, roughly 1.25rem): Sub-section titles like "Neste kamper" and "Siste resultater". Less condensed, regular weight — a step down in presence without changing font family.
- **Label / Badge** (0.75rem, uppercase, wide tracking +0.05em, bold): Section badges ("Klubb", "Elite"), nav links, team labels. The Barlow Condensed display typeface at its smallest setting creates a distinctive micro-typography.

All `<h1>`, `<h2>`, `<h3>` elements inherit `text-transform: uppercase` and `letter-spacing: 0.005em` from the base layer via `--font-display`. This is an intentional sporting-club convention — headings always read in caps, even at large sizes.

### Named Rules
**The Condensed-Only Rule.** Barlow Condensed is never used below 0.75rem or in paragraphs. It is the display voice; Inter is the reading voice. Don't mix them on the same line unless for explicit contrast (e.g., condensed score number next to regular text).

## Layout

**Container:** Maximum content width of 72rem (~1152px), centered with 1rem gutter on each side. The `.container-content` utility class governs every page's horizontal rhythm.

**Grid Systems:** Two-column layouts at `sm:` breakpoint, three-column grids for article cards and sponsor tiers at `lg:`. Hero images in dynamic sections use a 1/3–2/3 split with order switching between image-first (even index) and text-first (odd index). Mobile collapses everything to single-column.

**Spacing Rhythm:** Section-to-section vertical rhythm uses `mb-16` (4rem) for content sections, `mb-14` after the live match widget. Within cards: 5-unit padding (`p-5`) on standard cards, 8-unit (`p-8`) on featured lead cards.

**Responsive Behavior:** Header nav collapses to hamburger at `md:` breakpoint (768px). Grid columns reflow progressively: single → two-column → three-column. Hero section padding increases from `py-20` to `sm:py-28`. No fixed breakpoints for content width — the 72rem container handles it.

## Elevation & Depth

The system is **flat-by-default** with shadows only as stateful enhancements, not permanent decoration. Two shadow tokens exist, both applied to cards:

- **`shadow-card`** (`0 1px 2px rgb(10 26 47 / 0.06), 0 8px 24px -12px rgb(10 26 47 / 0.18)`): Default card elevation. Thin, close contact shadow plus a soft spread beneath. Always on cards at rest.
- **`shadow-lift`** (`0 2px 4px rgb(10 26 47 / 0.08), 0 16px 40px -16px rgb(10 26 47 / 0.28)`): Hover elevation on cards. Shadow spreads further, suggesting the card lifting away from the surface. Applied via `hover:shadow-lift`.

The header uses `backdrop-blur` and a semi-transparent surface (`bg-surface/90`) for sticky depth — it floats above content without a shadow, relying on translucency to convey layering.

### Named Rules
**The No-Shadow Rule.** Text elements, buttons, badges, and inputs never carry shadows. Shadows appear only on card-like containers at rest or in hover state. Depth through transparency (header blur) is the only non-shadow elevation technique.

## Shapes

Two corner styles govern the entire system:

- **Rounded Card** (`0.75rem` / 12px): The default for cards, inputs, and empty-state placeholders. Gives a soft, approachable feel to content containers.
- **Pill** (`999px`): Hero CTAs, section badges ("Klubb", "Elite"), nav link hit areas, dark mode toggle, mobile menu button, match score circles. Creates strong visual contrast against the rectangular card language.

**Borders:** Lines use `border-line` (ice-200) for default dividers and card outlines, `border-line-strong` (ice-300) for stronger separators like the header bottom border. Empty states use a dashed variant (`border-dashed`). The fixture list uses a left-border accent stripe (`border-l-4 border-l-brand-300`) to mark home games.

## Components

### Buttons
Six variants built on the `.btn` base class:

- **Primary** (`.btn-primary`): Navy-600 background, white text, `rounded-lg` (12px). Used for secondary CTAs and general action buttons. Hover darkens to navy-500 with `opacity-90`.
- **Accent** (`.btn-accent`): Scoreboard Red (`red-500`) fill, white text. Reserved for hero CTAs — the one allowed accent element per page section. Pill shape in practice (see index page). Hover lightens to red-400.
- **Outline** (`.btn-outline`): Navy-600 border and text, transparent background. For secondary navigation or alternate actions within a CTA pair. In dark mode: navy-400 on navy-900 hover.
- **Subtle** (`.btn-subtle`): Ice-100 background (`bg-ice-100`). Light action buttons where prominence is unwanted.
- **Ghost** (`.btn-ghost`): Navy text, transparent background. Minimal presence for tertiary actions.
- **Pill** (`.btn-pill`): Applies `rounded-full` to any of the above variants. Default on hero CTAs and match score display elements.

Size modifiers: `.btn-sm` (0.75rem text, compact padding) and `.btn-lg` (1rem text, larger padding).

### Cards / Containers
- **Article Card**: Image-top layout with `aspect-[16/9]` image that scales to 1.03× on hover (`group-hover:scale-[1.03]`). Featured variant uses a wide two-column split (`sm:flex-row`, image takes `sm:w-1/2`). Padding increases from `p-5` (standard) to `p-8` (featured).
- **Fixture List**: Border-grouped list with rounded corners, white background, and divide lines between rows. Home games get a navy-300 left stripe (`border-l-4`). Completed matches show expandable goal timelines in `<details>` elements. Win badges use emerald-green; loss badges use rink red; draws use ice-400.
- **Generic Card** (`.card`): White background, border-line outline, rounded-card corners, shadow-card elevation that transitions to shadow-lift on hover.

### Badges & Tags
Pill-shaped, sunken-surface background (`bg-surface-sunken`, roughly `#eef2f6`), small text at 0.75rem with bold weight and uppercase tracking. Used for section labels in article cards ("Klubb", "Elite", "Bredde").

### Navigation
- **Desktop Nav**: Condensed uppercase labels (`tracking-wide`) with pill-shaped hit areas on hover. Active state: sunken background with primary ink color. Dropdown panels use `backdrop-blur` header, card border, and shadow elevation.
- **Mobile Nav**: Full-width slide-down panel below the sticky header, separated by a bottom border. Grouped labels are bold uppercase; children are indented with `pl-6`. Chevron toggles rotate 180° on open.

### Header / Footer
- **Header**: Sticky at top (`z-40`), translucent surface background with backdrop blur, bottom border line. Logo area pairs condensed display text with a circular or pill placeholder when no logo image is available. Dark mode toggle button is a pill hit area with icon swap (sun ↔ moon).
- **Footer**: Sunken-surface background (`bg-surface-sunken`), top border, multi-column grid layout that scales from 2 to 4 columns by breakpoint. Footer links use `underline-offset-2` with hover underline on the `.link-footer` class.

### Form Inputs
- Text input: `.input` — rounded-card corners, border-line outline, white background, blue accent focus ring (`focus:border-brand-500`). Full width.
- Select: `.input-select` — identical to text input.

### Prose / Rich Text
Content body from Strapi uses `prose-lg` (Tailwind typography) with a default `.text-ink` override. Images within prose get rounded-card corners and display as block. No inline code or table overrides beyond Tailwind's defaults.

## Do's Don'ts

### Do:
- **Do** use Barlow Condensed for headings, scores, labels, and nav — never in body copy. Reserve Inter for all paragraph-level text.
- **Do** keep the accent red to ≤10% of visible area per screen. It appears on hero CTAs, live state, and match outcome badges only.
- **Do** use `rounded-card` (12px) for content containers and `pill` (999px) for badges, buttons in hero areas, and small interactive elements.
- **Do** apply shadows to cards at rest (`shadow-card`) and on hover (`shadow-lift`). Never on text, buttons, or form fields.
- **Do** wrap all page content in `.container-content` (max-width 72rem, centered with 1rem gutters).
- **Do** support dark mode — surface/ink/line tokens invert automatically via `data-theme="dark"` or `prefers-color-scheme`.

### Don't:
- **Don't** use multiple accent colors on a single screen. Navy and ice neutrals carry the palette; red is the exception, not an equal partner.
- **Don't** mix font families on the same line for body text. Condensed typefaces are display-only.
- **Don't** use pure white (#ffffff) as a page background — always `surface` (ice-50) or `raised` (card surfaces only).
- **Don't** apply borders to interactive elements that already have background color treatment (e.g., don't outline buttons with borders unless using the explicit `.btn-outline` variant).
- **Don't** hard-code hex values in components — always reference semantic tokens (`--color-surface`, `--color-ink`, etc.) so dark mode and rebrands work via single-point changes.
- **Don't** invent new token names outside the three ramps (navy, red, ice). When a new shade is needed, pick from the existing ramp at the closest step.
