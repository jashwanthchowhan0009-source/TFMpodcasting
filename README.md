# The Founder Mafia — website

Static site for **The Founder Mafia** podcast, hosted by Aarav Phanindra. No build step.

## Pages

| Page | File | What's on it |
|---|---|---|
| Home | `index.html` | Noir street at dusk → scroll walks you into the club → the Don at his table → the episode deck (3D room) → house rules → reserved-seat CTA |
| About Us | `about.html` | The show, how a sit-down works, the host, house rules — all in the 3D room |
| Enter the Mafia | `enter.html` | Guest pitch form with the "Your seat" card |
| Community | `community.html` | Channel invitations, meetups, the family code |

## Edit content

Everything you'll normally change lives in **`content.js`**:

- `links` — YouTube, Spotify, Instagram, LinkedIn, WhatsApp invite, and the email that receives guest pitches. Empty links are hidden or shown as "Opening soon".
- `episodes` — newest first. Add `url` to make "Watch episode" appear; add `image` (e.g. `images/guest-04.jpg`) to replace the silhouette on the card.
- `meetups` — shown on the Community page.

Page copy is plain HTML in each page file.

## Files

```
index.html, about.html, enter.html, community.html
styles.css     all styles + illustration animations
main.js        page boot: nav, hero, deck, forms, community
art.js         the illustrations (street, the Don, the reserved seat), as SVG
fx.js          scroll scenes, parallax, embers, tilt, page transitions
deck.js        the flip-card episode deck
room.js        the 3D room (Three.js): table, mics, swinging lamp
vendor/three/  Three.js r169 (MIT) — vendored, no CDN needed
fonts/         Big Shoulders Display + Newsreader (OFL), self-hosted
```

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening the HTML file directly won't work — ES modules need a server.)

## Deploy on Vercel

Import the repo in Vercel → Framework preset **Other** → no build command, output directory `.` → Deploy.

## Notes

- All illustrations are original SVG artwork made for this site.
- Respects `prefers-reduced-motion`: scroll zoom, particles and loops switch off.
- The 3D room falls back to a flat background on devices without WebGL2.
