# Player Profile — DESIGN.md

> **Status:** Shaped · **Date:** 2026-10-13  
> Surface: new player detail pages at `/player/[slug]`  
> Design language: existing TOIK system (navy + rink red, M PLUS 2 display, Rubik body, Phosphor Icons)

---

## Problem

Players are only shown as tiny list cards inside team pages. No individual profile exists to tell the player's story or give them a shareable link. Fans can't discover who's on the roster beyond name and position.

---

## Strapi Schema Changes (Minimal Additions)

The current `player` schema already has: `name`, `number`, `position`, `shoots`, `birthYear`, `photo`, `bio`, `note`, `team`, `active`, `sortOrder`.

### Add these fields — just 3 new ones:

| Field | Type | Why | Notes |
|-------|------|-----|-------|
| **slug** | uid (derived from name) | Shareable URL, SEO | Auto-generated on create |
| **socialLinks** | component (repeatable) | Social presence — Instagram, LinkedIn, etc. | Matches existing `SharedSocialLinkEntry` pattern already in the codebase |
| **careerHighlights** | blocks (rich text) | Tell the player's story beyond one-liner bio | Same rich-text editor used for articles; allows coaches to add quotes, achievements, fun facts |

### Rationale — what NOT to add:

- ~~birthDate~~ → `birthYear` already gives age context for hockey categories
- ~~height / weight~~ → irrelevant at this level, data-entry friction high
- ~~stats (goals, assists)~~ → not tracked in Strapi; would require a separate system or match integration
- ~~nationality~~ → rarely relevant for a local club site

### Component: `SharedSocialLinkEntry` (re-use existing)

Already defined in generated types at line 956. No new schema component needed — it's already shared across the codebase (`platform`: facebook, instagram, twitter, youtube, tiktok + url + icon). If not registered as a global component yet, add one with `icon: 'socialLink'` containing `platform` and `url`.

---

## Page Layout

```
┌───────────────────────────────────────────────┐
│  BACK → Team name (link)                     │
│                                              │
│  ┌─────────────┐                             │
│  │             │                             │
│  │    PHOTO    │     NAME, NUMBER            │
│  │   HERO      │     POSITION                │
│  │  (large)    │     SHOOTING HAND           │
│  │             │                             │
│  └─────────────┘     BIRTH YEAR              │
│                     ──────────────────       │
│                                              │
│  CAREER & HIGHLIGHTS                         │
│  (rich text — paragraphs, quotes, etc.)      │
│                                              │
│  ┌─────────────┐                             │
│  │  SOCIAL     │   Instagram · LinkedIn · .. │
│  │  LINKS      │                             │
│  └─────────────┘                             │
│                                              │
│  ← Back to team roster                       │
└───────────────────────────────────────────────┘
```

### Layout Details (responsive breakpoints)

**Mobile (< sm / 640px):**  
Single column, photo full-width hero at top. Name + meta stacked vertically.

**Desktop (>= lg / 1024px):**  
Two-column layout — left side is the hero photo (sticky as you scroll), right side has name/meta, career highlights, and social links. Photo area uses a bold navy card-invert background for visual impact.

**Tablet (< lg):**  
Same single-column as mobile but photo narrower, positioned above content with centered alignment.

---

### Component: `PlayerCard` (for team roster pages)

Replace the inline player list on `/lag/[slug]` with this new component for consistency. Larger photo, clickable to profile.

```
┌─────────────────┐
│   PHOTO         │  (#23) Name Lastname
│  (rounded-xl)   │     Position · Born YYYY
└─────────────────┘
```

Hover: subtle lift with shadow transition. Links to `/player/[slug]`.

---

## Visual Hierarchy

1. **Hero Photo** — Full-width at mobile, tall left panel on desktop. Uses `medium` format from Strapi. Placeholder/fallback avatar using Phosphor's `UserCircle` icon in brand color.
2. **Name + Number** — Hero text size, navy. Jersey number in accent red with `#` prefix (existing pattern).
3. **Meta Row** — Position badge, shooting hand, birth year in a pill-style inline row (subtle background, muted text).
4. **Career Highlights** — Prose-toik rich text, max-width 65ch for readability.
5. **Social Links** — Icon-only horizontal strip using Phosphor brand icons (Instagram: `InstagramLogo`, etc.).

---

## Dark Mode

All tokens are already designed with dark variants via the semantic layer. Photo area uses `surface-invert` on light mode and inverts to a subtle pattern or gradient. No changes needed.

---

## Performance

- Photo uses `loading="lazy"` unless above the fold (hero image gets eager on desktop since it's top-of-page).
- Media format: `medium` for profile, `small` for roster cards.
- Preload hero photo on desktop via `<link rel="preload">` in head.
- No client-side JS — pure Astro SSR.

---

## Accessibility

- Photo has proper `alt` from Strapi media or descriptive fallback ("Photo of [name]").
- Skip-nav link preserved via Base layout.
- All interactive elements are native links (`<a>`), no custom JS click handlers.
- Color contrast: accent red on white/brand passes WCAG AA at 14px+.
