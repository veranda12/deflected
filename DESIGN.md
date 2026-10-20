# DESIGN.md: DEFLECTED (DFLCTD)

Design direction for deflected.id. Sources: the client's brand sheet (`brand-assets/Collor Pallate dflctd.pdf`),
Corporate Deck, Katalog DFLCTD, the colour palette of the client's earlier DFLCTD web draft (colours only, as
instructed), and a hands-on inspection of hellolandbouw.id for structure, interaction, and quality bar.

**Design read:** corporate apparel and merchandise vendor site for HR, procurement, event committees and
communities, in a product-first editorial style with sporty poster typography.
**Dials:** ENERGY 2 / RHYTHM 3 / MOTION 2.

## Identity

| Decision | Choice | Reason (one line) |
|---|---|---|
| Display type | Bebas Neue (caps, OFL) | Named in the client's brand sheet; condensed caps match the DFLCTD wordmark and the jersey/catalog look. |
| Text type | Plus Jakarta Sans (OFL) | Indonesian-made grotesk with open shapes; the brand sheet's Arial is a fallback, and the reference site uses it for display, so it already reads as "Indonesian corporate". |
| Monospace | Not used for UI | Brand sheet lists Consolas for subheadings; dropped because the brief forbids monospace/terminal type for primary display. |
| Core colours | Ink navy `#0A1128`, blue `#0066FF`, white | Navy and blue are the client's DFLCTD palette; blue is the brand's `#0000FD` family tuned for screen contrast. |
| Accent | Amber `#FFB703`, used only on the closing full stop of headlines, step numbers on dark, and focus rings on dark | One deliberate accent from the client's web palette; never used for body text on white (contrast 1.6:1). |
| Text blue | `#0052D6` for links and small blue text | `#0066FF` fails 4.5:1 on the mist surface; `#0052D6` passes on all light surfaces (6.6:1 on white). |
| Surfaces | White + cool mist `#F2F5FA` + navy blocks | Mirrors the corporate deck (light slides, navy emphasis slides). No cream, no dark-by-default. |
| Identity motif | Angled cut on one image corner (`cut-corner`) | Taken from the angled top-left edge of the DFLCTD "D" mark; repeated on hero, category cards, product galleries. |
| Second motif | Amber full stop after display headlines | Short, confident sign-off borrowed from poster typography; keeps the accent to one gesture. |
| Logo | Vector paths extracted from `LOGO D.pdf` | Client-supplied vector; rendered inline so it is crisp and recolourable (blue mark on light, white on dark). |
| Icons | Small custom set, square caps | Echoes the angular wordmark; only icons that name an action (WhatsApp, mail, map, search, menu). |
| Theme | Light only | Brand materials are light with navy blocks; a dark theme has no brand or audience reason here. |

### Contrast (checked with antislop-human `contrast-check.py`)

| Pair | Ratio |
|---|---|
| Text `#0F172A` on white | 17.85:1 |
| Secondary `#475569` on mist `#F2F5FA` | 6.93:1 |
| Tertiary `#5A6A80` on mist | 5.05:1 |
| White on blue `#0066FF` (buttons, CTA band) | 4.83:1 |
| Link `#0052D6` on white | 6.61:1 |
| `#A9B8D0` on ink (secondary text on dark) | 9.30:1 |
| Amber on ink | 10.70:1 |

## Layout system

- Container 1280px, gutter `clamp(16px, 4vw, 40px)`, 12-column grid on desktop.
- Section rhythm `clamp(72px, 10vw, 136px)`; sections alternate composition, not only background:
  hero split 7/5, asymmetric category mosaic (one tall card), dark material section, sticky-title process list,
  staggered portfolio grid, image collage plus numbered list, two-column FAQ, full-bleed blue CTA.
- Radii: 6 / 10 / 14 / 20 / 28px. Buttons 10px (not pills), cards 20px, form chips are the only pills
  because they are toggles.
- Shadow only on the scrolled header bar and dropdown (elevation above content). Everything else is flat.
- No glassmorphism, no gradient blobs, no background grids, no eyebrow pills above headlines.

## Motion

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.16, 1, .3, 1)` | All entrances and hovers (same curve the reference uses as its spring easing). |
| `--ease-standard` | `cubic-bezier(.2, 0, 0, 1)` | Colour/button state changes. |
| Fast / base / slow | 150 / 240 / 700ms | Buttons / menus / reveals. |

Choreography:
- **Hero:** each headline line rises out of its own mask (90ms stagger), paragraph and CTAs fade up after,
  hero photo opens from the bottom into the cut-corner shape while the image settles from 1.12 to 1.0 scale.
- **Scroll reveal:** headings and card groups fade up 28px, staggered 70ms per item, once.
  Photo blocks use a clip reveal instead, so images and text don't move the same way.
- **Hover:** card images zoom to 1.045 over 900ms; product cards crossfade to the second production photo;
  portfolio cards slide up a material caption.
- **Header:** transparent at top, solid white bar with hairline border after 12px scroll.
- **Dropdown:** 220ms fade + 6px drop + scale .98. **Mobile menu:** clip-path wipe with staggered links.
- **FAQ:** grid-row height animation, no JS measuring.
- `prefers-reduced-motion` disables all of the above; content is never hidden without JS.

## Copy

Indonesian, plain and specific. No em dashes, no buzzwords, no invented numbers, testimonials, or policies.
Facts come from the deck and catalog; unknown policies (minimum order, lead time) are answered honestly as
"confirmed during consultation".
