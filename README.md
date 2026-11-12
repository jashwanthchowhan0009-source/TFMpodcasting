# The Founder Mafia — website

Static site for **The Founder Mafia** podcast, hosted by Phanindra Aarav. No build step.

The look is "the office": one dark wine desk with paper grain, smoked-glass pills, and paper objects
(notebook, wax seal, cigar, playing cards, matchbook, polaroids) pinned on top — several of them draggable.
Between sections sit scroll-driven 3D spaces: a tunnel of pills, a ring of cards, a flipping coin and a cube.

Fonts: Poppins (headings) and Open Sans (body), self-hosted in `fonts/`.

Palette: Burgundy `#93032E` · Wine Red `#7F011F` · Night `#151515` · Light Sand `#F5EBD0`.

## Pages

| Page | File |
|---|---|
| Home | `index.html` — hero collage, what this is, tunnel, road to Season 01, who you sit with, card ring, trailer, five pillars, three tracks, episode index, glimpse inside, coin, join |
| About Us | `about.html` — info sheet, profile, host, cube, how a sit-down works, house rules, team |
| Enter the Mafia | `enter.html` — guest dossier form, what we look for, tunnel, FAQs |
| Community | `community.html` — membership card, channels, meetups, family code, card ring |

## Edit content

Everything you'll normally change lives in **`content.js`**. Put photos and videos in `media/` and point to them from there:

- `table[0].photo` — host portrait for "Who you sit with matters" (e.g. `media/host.jpg`)
- `links.trailerVideo` — intro video that loops inside the TV (e.g. `media/intro.mp4`)
- `team` — About Us team cards (name, role, bio, optional photo)
- `payment.razorpayLink` / `payment.amount` — where "Send pitch & pay" goes, and the fee shown in the note
- `links.startupitch` — Community "Join" button

Also in `content.js`: links (socials, trailer, pitch email),
whether pitches are open, the Season 01 timeline, the people at the table, tracks, episodes, meetups, FAQs
and the "last update" date. Placeholders read "To be announced".

## Files

```
index.html, about.html, enter.html, community.html
styles.css     all styles, the 3D spaces and the sticker animations
main.js        loader, nav, spacebar scrolling, draggable objects, 3D spaces, page content
stickers.js    every illustration, as original SVG
content.js     the content you edit
fonts/         Poppins + Open Sans (SIL OFL), self-hosted
vendor/        Lenis smooth scrolling (MIT)
img/           logo, wordmark banner, favicons
```

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

GitHub Pages: Settings → Pages → Deploy from a branch → `main` / root.
Vercel: import the repo, framework preset **Other**, no build command.
