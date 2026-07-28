# Healcia Design System

> **Health, understood.**

Healcia is a consumer health-information company that demystifies medicine for everyday people. The product surfaces are a marketing/content website (where people read articles, browse conditions, and check symptoms) and a companion mobile app (daily check-ins, save articles for later, and ask a vetted "Ask Healcia" assistant). The brand sits between *editorial publication* and *trusted clinic* — warm, plainspoken, and unafraid of complexity, but never cold or clinical.

## ⚠️ Source materials

**No source materials were provided** (no codebase, no Figma, no slide decks, no existing logos). This design system was **designed from scratch** based on the brief: *"healthcare company giving health information to people."*

That means everything here — logo, palette, type, voice, components — is a committed first draft, not a recreation. When you have real brand assets (logo files, Figma library, an existing site to look at), please attach them and I'll re-skin this system against your actual look.

Specifically flagged for replacement:
- **Logo** — placeholder wordmark + leaf-cross glyph (SVG, in `assets/`). Drawn here because no source existed.
- **Fonts** — using Google Fonts (Instrument Serif, Geist, JetBrains Mono). If you have proprietary fonts, drop the files into `fonts/` and I'll swap.
- **Iconography** — using Lucide via CDN. If you have a custom icon set, replace.
- **Photography** — placeholders only; no real imagery was provided.

---

## Brand at a glance

| | |
|---|---|
| **Name** | Healcia |
| **Tagline** | Health, understood. |
| **Promise** | Clear, evidence-based health information that respects you as an adult. |
| **Voice** | Calm, knowledgeable, plainspoken. Like a doctor friend, not a textbook. |
| **Look** | Editorial. Warm parchment backgrounds, deep sage greens, coral accents, generous serif headlines. |
| **Anti-patterns** | Sterile hospital blue. Wellness-bro neon. Corporate pharma gradient. |

---

## Index

Files in the root:

- **`README.md`** *(this file)* — context, content fundamentals, visual foundations, iconography
- **`colors_and_type.css`** — CSS custom properties for color + type tokens, plus base element styles
- **`components.css`** — component primitives (buttons, inputs, chips, callouts)
- **`SKILL.md`** — Claude/Agent Skill manifest, so this system can be invoked as a skill

Folders:

- **`assets/`** — logo (wordmark + glyph), favicon — *placeholder, replace*
- **`fonts/`** — *(empty — using Google Fonts; replace with proprietary files when available)*
- **`preview/`** — Design System tab cards (type specimens, color swatches, components, etc.)
- **`ui_kits/web/`** — Marketing + content website UI kit (homepage, article, symptom-checker, account)
- **`ui_kits/app/`** — Mobile app UI kit (today, read, ask, you)

---

## Content fundamentals

How Healcia writes.

### Voice in one line
**Calm, knowledgeable, plainspoken — like a doctor friend who respects your intelligence.**

### Person & address
- Talk to the reader directly as **"you."** Use **"we"** for Healcia.
- "Here's what you can do tonight." ✅
- "Patients are advised to…" ❌ (clinical, distancing)
- "Your body is amazing!!" ❌ (wellness-bro)

### Tone register
- **Confident, never hedging into jargon.** Translate medicine into kitchen-table language without dumbing down.
- **Calm in the face of scary topics.** Acknowledge the worry, then deliver the facts.
- **Specific over vague.** "About 1 in 12 adults" beats "many people."
- **Honest about uncertainty.** "We don't fully know why" is fine — and trust-building.

### Casing & punctuation
- **Sentence case everywhere** — headlines, buttons, nav. (No Title Case Like This.)
- **Oxford commas.** Em-dashes are welcome — they read like a thoughtful pause.
- **No exclamation points** outside of genuine celebration moments (account created, streak hit).
- **Numbers as numerals** in body copy ("4 hours of sleep," not "four hours"). Spell out only at sentence start.

### Headlines
Editorial, declarative, occasionally curious. Avoid clickbait and listicles.

✅ "What a headache is really telling you"
✅ "The quiet science of feeling rested"
✅ "Eight glasses of water? It's complicated."
❌ "10 SHOCKING facts about hydration!"
❌ "Unlock Your Best Self"

### Buttons & CTAs
Verbs, sentence case, short. They describe what happens.

- "Read the article" / "Check my symptoms" / "Save for later" / "Talk to a doctor"
- Avoid: "Submit", "Click here", "Learn more", "Get started" (vague)

### Emoji
**No emoji in product UI or marketing copy.** Healcia is editorial, not chatty. The single exception: a user's own notes, journals, or messages — what *they* write is theirs.

### Sample voice in the wild

> **Headline:** Why a sore throat in the morning isn't always a cold
>
> **Lede:** You wake up, swallow, and there it is — the rasp. Before you stockpile lozenges, it's worth asking what your throat did overnight. Most of the time, the answer isn't a virus.

> **Push notification:** Your weekly check-in is ready. Three minutes, no pressure.

> **Error state:** We couldn't load this. Tap to try again — your draft is safe.

---

## Visual foundations

### Palette
Warm, editorial, grounded. No bluish-purple gradients, no neon, no clinical hospital blue.

- **Sage** is primary — `#2F4A3A`, a deep forest green. Used for brand marks, primary buttons, links, key headlines.
- **Coral** is accent — `#D9684F`, warm and human. Used sparingly for "important and warm" moments: a heart on a saved article, a streak badge, a single CTA on a marketing page.
- **Parchment** is canvas — `#F7F2E8`, a warm off-white. Default page background. Never pure white.
- **Ink** is text — `#1B1F1C`, a near-black with a green undertone. Pairs warm.
- **Mist** is divider/quiet — `#E4DED1`, parchment's slightly darker sibling.
- **Semantic** — Healcia uses muted, brand-aligned versions of caution/danger/success rather than the default web red/green/yellow. See `colors_and_type.css`.

### Type
Modern editorial pairing — a contemporary grotesque headline with an italic serif accent for warmth.

- **Display:** *Bricolage Grotesque* — variable grotesque with optical sizes (12–96). Used for h1/h2/h3, large numerals, page-level marks. Tightly tracked (-0.02em), weight 500.
- **Accent:** *Instrument Serif Italic* — kept as the editorial italic accent. Used in **pull quotes, article ledes, and italic emphasis inside body copy**. Provides the human, hand-written warmth against the modern grotesque headlines.
- **Body:** *Geist* — modern humanist sans, excellent at small sizes. Used for everything else.
- **Mono:** *JetBrains Mono* — for dosage strings, lab values, code (rare).

Line height is generous (1.55 body, 1.06 display). Measure is constrained on long-form articles (~65ch) — Healcia is a place to *read*.

### Spacing
4px base scale: `2, 4, 8, 12, 16, 20, 24, 32, 40, 56, 80, 120`. Generous on marketing pages, tight in app shells.

### Radii
Soft but not pill-y. Cards and inputs use **12px**; small chips and badges use **8px**; buttons use **10px**; one signature shape — the "saved" pill on article cards — uses **999px**. Hero containers and feature cards occasionally use **20px**. Never sharp 0px corners — even tables get 2px rounding.

### Shadows & elevation
Soft, warm, never harsh. Two-layer shadows that read as gentle depth, not floating UI.

- **`shadow-1`** (cards at rest): `0 1px 2px rgba(27,31,28,0.04), 0 2px 8px rgba(27,31,28,0.04)`
- **`shadow-2`** (cards on hover, menus): `0 4px 12px rgba(27,31,28,0.06), 0 12px 32px rgba(27,31,28,0.08)`
- **`shadow-3`** (modals): `0 24px 64px rgba(27,31,28,0.18)`

No inner shadows. No colored shadows.

### Borders
1px, color `--mist` (parchment-adjacent). On dark surfaces, 1px `rgba(255,255,255,0.08)`. Borders are *quiet* — never used for emphasis, only for separation.

### Backgrounds
- **Default:** flat parchment (`--cream`).
- **Sections:** alternating bands of `--cream` and `--cream-deep` (a half-shade darker) on marketing pages, never gradients.
- **Hero / occasional feature:** one signature treatment — a tight grain texture overlaid at 6% opacity on a sage panel. (Texture is a PNG in `assets/grain.png`; if absent, the design tolerates its absence.)
- **No full-bleed photography by default.** When imagery is used, it's bordered and contained inside a card with rounded corners — editorial, not splashy.

### Imagery vibe
*If/when real imagery is added:* warm, slightly desaturated, natural light, real people in unposed moments. Avoid stock-photo grins, stethoscopes-around-the-neck, white-coat clichés, and "diverse hands holding"  imagery. Tend toward still-life and hands-doing-things over face-shots.

### Hover & press states
- **Hover (buttons):** background darkens ~6% (use `color-mix(in oklab, var(--sage) 94%, black)`). Never opacity dimming.
- **Hover (cards, links):** `--mist` to `--cream-deep` background; underline grows from `text-decoration-thickness: 1px → 2px`.
- **Press:** translateY(1px) + slightly tighter shadow. No scale-down; this is a serious-feeling brand.
- **Focus:** 2px solid `--sage` with 2px offset. Always visible, never `outline: none`.

### Animation
**Restrained.** Healcia doesn't bounce. No spring physics on UI elements.
- **Easing:** `cubic-bezier(0.2, 0.6, 0.2, 1)` (a gentle ease-out) is the only easing curve.
- **Durations:** 150ms (hover/state), 220ms (panel/menu reveal), 360ms (page-level transitions). Nothing longer.
- **Fades over slides.** Modals fade in; sheets slide up with the same gentle ease.
- **No parallax. No on-scroll reveals.** If something is on the page, it's there from the start.

### Transparency & blur
Used surgically: app sticky headers blur the parchment beneath at `backdrop-filter: blur(12px) saturate(1.1)`. No frosted-everywhere; no glassmorphism cards.

### Cards
- Background: white (`--paper`, slightly whiter than canvas) on cream pages, or cream on white pages.
- 1px `--mist` border + `shadow-1`.
- 12px radius. 20–24px inner padding for content cards; 16px for compact list items.
- Article cards have a small parchment "saved" pill in the top-right corner when saved (the one place we go full 999px radius).

### Layout
- **Web max content width:** 1200px. Article body: 680px. Reading is sacred — don't stretch lines.
- **App max width on tablet/desktop:** 440px, centered on parchment, with the app shell visually framed but not phone-bezel'd.
- **Sticky elements:** marketing nav at top; app tab bar at bottom; everything else scrolls. No floating chat bubbles, no scroll-triggered popups.

### Protection / readability over imagery
When text must sit on imagery (rare), use a **bottom-anchored linear gradient** from `rgba(27,31,28,0.6)` to transparent, not a capsule chip. Capsules are reserved for tags and counts.

---

## Iconography

Healcia uses **Lucide** — clean, consistent 1.75px stroke icons that match the editorial-but-modern feel. Loaded from CDN (`https://unpkg.com/lucide-static@latest/icons/`) and inlined as needed.

Why Lucide: stroke style matches the warm-modern voice; the set is broad enough to cover both marketing (heart, bookmark, search, menu) and medical-adjacent UI (pill, activity, thermometer, droplet, stethoscope). It's also MIT-licensed.

**Substitution flag:** since no custom icon system was provided, Lucide is a stand-in. If/when Healcia has its own set, replace `assets/icons/` and update `colors_and_type.css` icon size tokens. **Please supply a real icon set when available.**

### Rules
- **Always 1.75–2px stroke**, never filled, never duotone.
- **Always sized in the token scale:** 16, 20, 24 (default), 32. Never in-between.
- **Always `currentColor`** — icons inherit text color so they pair with whatever they sit next to. Default to `--ink` on parchment, `--sage` for primary actions.
- **Always paired with a label or accessible name.** No floating icon-only buttons in marketing; in app navigation, icons in the tab bar always have a label below.
- **Never decorative-only.** If an icon doesn't add meaning beyond the text it sits with, remove it.

### Emoji
Not used in UI. Reserved for user-generated content only (notes, journal entries).

### Unicode
Used sparingly for **·** (mid-dot) as a metadata separator ("4 min read · Updated June 2025"), **→** in inline links ("Read more →"), and the section glyph **§** on long-form articles. Never for decoration.

### Logo / brand mark
- **Wordmark:** "Healcia" set in Instrument Serif Italic, single weight, no logotype customization. (Placeholder — replace.)
- **Glyph:** a stylized leaf-cross — the medical cross softened into a leaf. (Placeholder SVG, in `assets/healcia-glyph.svg`. Replace with the real mark when available.)
- **Favicon:** the glyph at 32×32, sage on parchment.

---

*Last updated: design-system v0.1 — first pass, no source materials yet.*
