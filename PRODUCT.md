# TOIK — Product Design Document

## Vision

TOIK is not a team. It's a **club** — a multi-generational community spanning children, adults, and elite players under one banner. The website must make every visitor feel **proud to belong**.

> **Motto:** _"Many teams — One club."_
>
> **Tagline:** _"We are one club of many teams, we cheer together."_

The design direction is **"Ice & Fire"** — cold ice-blue surfaces and deep navy base provide an organized, airy foundation; a vivid red accent carries energy, urgency, and pride. The contrast between cool restraint and bold expression mirrors the club itself: disciplined on the ice, passionate in the stands.

---

## Audience

| Group | Role on Site | What They Need |
|-------|-------------|----------------|
| **Young players & parents** | Primary | Find schedules, results, team info, registration paths |
| **Adult / elite players** | Primary | Fixtures, live scores, news, squad details |
| **Club members & families** | Secondary | Club history, governance, sponsor recognition, community feel |
| **Sponsors & partners** | Tertiary | Visibility page, contact info, branding alignment |

Everyone who lands on TOIK.no should be able to answer two questions within 10 seconds:
1. **When is the next game?** (schedule/results)
2. **Who are we?** (community pride — one club, many teams)

---

## Design Principles

### 1. Bold, Not Busy

Large typography and high contrast create energy without animation. The hero section should hit hard visually — big type, strong color blocks, impactful imagery. But secondary pages (club info, team rosters, news) must stay readable and calm. Energy is reserved for what matters; clarity carries the rest.

### 2. Organized & Airy

Every element earns its space. Clear grid structure, generous whitespace, strong typographic hierarchy. The site should feel open and confident — not cramped or cluttered. Content blocks breathe. Navigation is predictable and obvious.

### 3. Red Earns Attention

The rink-red accent is used sparingly so it always carries weight. It appears on:
- **Live match states** (current scores, active games)
- **Primary calls to action** (join, buy tickets, register)
- **Key data points** (scores, dates that matter today)
- **Section labels** and micro-highlights

Every other element lives in navy, ice-white, or cool gray. The red says: _this matters right now_.

### 4. Photography-Led Hero, Pattern-Led Everywhere Else

The landing page hero can carry bold imagery because it's used once. But we cannot depend on custom photography for every section — the budget doesn't allow it. Where photos aren't available, rely on **typographic treatment, color blocks, geometric patterns, and data visualization** (scores, stats, numbers) to create visual impact.

### 5. One Voice Across All Teams

No matter which team's page a visitor lands on, the experience should feel like one club. Consistent typography, spacing system, navigation structure, and the red-accent hierarchy bind everything together. A parent switching from U12 to senior fixtures should never feel like they're on a different site.

### 6. Low Maintenance, High Impact

Animations are minimal by choice. If it can be achieved with bold type, strong layout, and smart color use — that's the preferred solution. The live-match Vue island is the only client-side interaction that needs ongoing maintenance. Everything else is server-rendered and fast.

---

## Visual Style

### Color Strategy

| Token | Role | Where It Lives |
|-------|------|---------------|
| `brand` (navy ramp) | Base & structure | Backgrounds, text, nav, cards — the "ice at dusk" foundation |
| `accent` (rink red ramp) | Energy & urgency | Live states, CTAs, scores, section labels — rare but potent |
| `ice` (cool neutrals) | Surface & breathing room | Page backgrounds, card surfaces, muted text, lines |

Dark mode follows the same hierarchy: navy base becomes darker (`brand-950`), ice neutrals invert to light text on dark surface, red retains its role as the sole energy color.

### Typography

| Role | Font | Treatment |
|------|------|-----------|
| **Display / Headings** | Barlow Condensed | Uppercase, tight tracking, bold weight. Used for all headings and section labels. Carries the club's voice — confident, athletic, sharp. |
| **Body / UI** | Inter | Clean, readable at small sizes. News text, forms, tables, metadata. |

Type is the primary decorative element. Before reaching for imagery, ask: can type carry this?

### Layout

- **Full-width hero sections** on the landing page — big type over large static images
- **Grid-based content areas** with a max width of `72rem` (the existing container token)
- **Section breaks** defined by color or subtle line rules, not heavy dividers
- **Card-based components** for fixtures and news — consistent, skimmable, responsive
- **Clear visual hierarchy**: Hero title → Section label → Data/content

### Shapes & Depth

- Cards use `rounded-card` (0.75rem) — modern but not playful
- Buttons use `rounded-pill` — friendly, approachable CTAs
- Subtle shadows for elevation only on cards; no decorative shadows elsewhere ("The No-Shadow Rule")

---

## Information Architecture

### Priority Sections (Landing Page)

| Priority | Section | Notes |
|----------|---------|-------|
| **1** | Live match / Next fixture | Above the fold. Red accent for live state. Immediate utility. |
| **2** | Hero + community statement | Bold type, hero image (when available), "One club — Many teams" identity |
| **3** | News highlights | Card grid, 3-4 most recent or featured articles |
| **4** | Schedule overview | Upcoming fixtures with quick links to individual team pages |
| **5** | Sponsor recognition | Tiered grid, builds community trust and commercial sustainability |

### Site Structure

```
/                          Landing page (bold, expressive)
├── /kamper                Fixtures & results (text-heavy, data-dense)
├── /lag                   Team listing → individual team pages with rosters
├── /nyheter               News archive → individual articles
├── /klubben/[slug]        Club info pages (governance, history, etc.) — text-heavy
├── /sponsorer             Sponsor listing
└── /kontakt               Contact page
```

The landing page can be bold and expressive. Inner pages prioritize clarity and scannability for information-dense content. The navigation and visual system remain identical across all pages.

---

## Tone of Voice

The website speaks with the voice of a community that takes hockey seriously but values togetherness above everything else.

| In | Out |
|----|-----|
| _"Vi er én klubb med mange lag."_ | _"Welcome to TOIK hockey!"_ (generic) |
| Team photos showing real players & families | Stock imagery or overly polished shots |
| Numbers that matter: schedules, scores, dates | Filler content with no clear purpose |
| Direct, warm Norwegian (bokmål) | Corporate tone or excessive English |

The site should feel like walking into the rink: cold air, bright boards, the sound of skates. Familiar if you're a member, welcoming if you're new.

---

## Do's and Don'ts

### ✅ Do
- **Lead with type.** Big headings, strong hierarchy, confident spacing.
- **Use red sparingly.** Every red element should feel intentional.
- **Design for parents first.** They check schedules, results, and dates — make that effortless.
- **Let photos breathe.** Full-bleed hero images on the landing page; smaller cards elsewhere.
- **Keep navigation predictable.** Same structure, same place, every page.
- **Design in dark mode too.** The navy base was chosen specifically because it works both ways.

### ❌ Don't
- **Animate for animation's sake.** If it doesn't help a user find information faster, skip it.
- **Overuse custom photography.** Rely on type and color for sections where photos aren't available.
- **Mix fonts.** Display headings are uppercase Barlow Condensed only. Body is Inter only. No exceptions.
- **Use red on background.** Accent color is for text, borders, buttons, and small elements — never large surface areas.
- **Break the grid.** Inconsistent spacing or misaligned cards signal disorganization, not creativity.

---

## Component Inventory

The site's visual system is built from a small set of reusable components. Each has one clear job:

| Component | Purpose | Visual Treatment |
|-----------|---------|-----------------|
| **Hero** | Landing page opener | Full-width imagery + large condensed heading, red accent word |
| **LiveMatch** | Real-time score widget | Red background border or badge when active; calm gray otherwise |
| **ArticleCard** | News preview | Image top, title in display font, excerpt in body, subtle shadow on hover |
| **FixtureList** | Match schedule/results | Tabular layout with team names, dates, scores; red highlight for live/today |
| **SponsorGrid** | Tiered sponsor logos | Responsive grid, tier-aware sizing, clean white/neutral background |
| **SectionLabel** | Section divider text | Small, uppercase, tracked-out, always `accent-500` — the subtle red signal |
| **Card** (base) | Container for structured content | Rounded corners, subtle shadow, raised surface on ice background |
| **Button** (primary/accent) | Calls to action | Pill shape, solid fill; accent variant uses rink red |
| **Badge / Tag** | Status labels (LIVE, TODAY, etc.) | Pill shape, compact, red for urgent states |

---

## Success Criteria

A design decision is "good" if it passes these tests:

1. **Can a parent find tomorrow's game in under 3 seconds?** (Utility)
2. **Does the site feel like one club, not many disconnected pages?** (Cohesion)
3. **Would someone feel proud to share this link?** (Pride)
4. **Is it maintainable without a dedicated designer or animator on staff?** (Sustainability)
5. **Does the red accent stand out because everything else is calm?** (Restraint)

If a design passes all five, it's ready. If it fails any one, rethink it.
