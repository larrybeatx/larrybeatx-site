# LarryBeatX Studios — Beat Licensing & Mixing Services

A single-page site for **LarryBeatX Studios**: an Afrobeat / Amapiano / Afro-fusion
producer selling beat licenses and mixing, mastering and vocal-production services.

Built as plain HTML, CSS and JavaScript — **no build step, no dependencies, no
framework**. Open `index.html` and it runs.

---

## Running it

```bash
# any static server works
python3 -m http.server 4173
# then open http://127.0.0.1:4173
```

Or just double-click `index.html`.

To deploy, drop the whole folder on Netlify, Vercel, GitHub Pages, Cloudflare
Pages — it's all static.

---

## What actually works

| Feature | Notes |
| --- | --- |
| **Beat catalog** | 15 beats, filter by genre, sort by date / BPM / price, asymmetric 7–5 grid with a full-width closing card |
| **Previews** | Every play button makes real sound — a four-bar loop synthesised in the browser from the beat's BPM, key and pattern. No audio files are shipped. |
| **Live player bar** | Play / pause / resume, previous / next, seek by clicking the waveform, volume, mute, progress, and a real-time spectrum canvas |
| **Licence picker** | Four tiers per beat (MP3 lease → exclusive rights) with prices derived from each beat's base price |
| **Cart** | Add / remove, duplicate rejection, localStorage persistence across reloads |
| **Checkout** | Two-step flow with validation, a loading state, and an order confirmation with a generated order ID |
| **Brief form** | Name / email / service / budget / link / message with per-field validation, loading and success states |
| **Keyboard** | `Space` play-pause, `←` / `→` seek ±2s, `Esc` closes overlays |
| **Responsive** | Verified from 320px to 2560px with zero horizontal overflow at any width |

---

## Honest note on previews

The previews are **live sketches generated in your browser**, not the finished
masters — the label on the catalog says so. This keeps the repo free of large
audio files while still letting visitors hear what each beat feels like.

To use your real masters instead, see below.

---

## File map

```
index.html            markup + inline SVG icon sprite
css/styles.css        design tokens and every component
js/data.js            beats, licence tiers, services, process, testimonials
js/audio.js           Web Audio synthesiser + 16th-note scheduler + analyser
js/app.js             rendering, player, cart, checkout, forms, reveals
assets/               logo (white / black / accent), wordmark, favicons
```

---

## Customising

**Beats** — edit `BEATS` in `js/data.js`:

```js
{
  id: 'ojo-luwa',            // url-safe id
  title: 'Ojó Luwa',
  genre: 'Afrobeat',         // must exist in GENRES (built automatically)
  bpm: 104,
  key: 'F♯ min',
  root: 42,                  // MIDI note of the bass root — drives the preview
  pat: 'afrobeat',           // afrobeat | amapiano | fusion | rnb | house | drill
  price: 34.99,              // MP3 lease price; other tiers scale from this
  released: '2026-03-02',
  moods: ['Warm', 'Late night'],
  flag: 'new',               // new | hot | sold | omit
}
```

**Licence tiers** — `LICENSE_TIERS` in `js/data.js`. `mult` scales each beat's
base price, so changing one beat's price updates all four tiers for that beat.

**Services, process steps, testimonials** — `SERVICES`, `PROCESS`, `VOICES` in
`js/data.js`.

**Brand colours and type** — the `:root` block at the top of `css/styles.css`.
The single accent is `--accent: #f4592a`; everything else is neutral.

**Logo** — `assets/mark.png` (nav), `assets/mark-lockup.png` (hero),
`assets/markb.png` (footer, dark version for light backgrounds). The accent
recolour is `assets/mark-accent.png` if you want a coloured variant.

---

## Making previews play your real masters

1. Put the mp3s in `assets/beats/`.
2. Add an `audio` field to each beat in `js/data.js`.
3. In `js/audio.js`, swap `PreviewEngine.play()` for an `<audio>` element and
   keep `position` / `seek()` / `setVolume()` as the interface — the player bar
   only talks to those three, so nothing else in `app.js` needs to change.

---

## Before going live

- **Form endpoint** — `js/app.js`, `briefForm` submit handler. It currently
  validates and shows a success state but posts nowhere. Point it at Formspree,
  Basin, Netlify Forms, or your own endpoint.
- **Payments** — checkout collects the order and mints an order ID, but no money
  moves. Wire the `placeOrder` function to Stripe, Paystack or PayPal, or swap
  the button for a transfer-with-reference flow.
- **Email address** — `STUDIO.email` in `js/data.js` (it appears in the nav,
  contact section, footer and the order email handoff).
- **Legal** — pages/terms for the licence tiers you're selling.

---

## Design notes

Follows the anti-slop rules from
[tasteskill](https://github.com/tasteskill/tasteskill) (`design-taste-frontend`
and `gpt-taste`):

- Off-black base (`#0a0a0b`) with one accent — no AI purple, no neon glows,
  no pure black.
- Cabinet Grotesk for display, Satoshi for body, Geist Mono for every number.
- Left-aligned hero with a two-line H1, not a centred one.
- No generic three-card feature row — services are a zig-zag, licences are a
  horizontal accordion.
- Monospace for BPM, keys, prices and timestamps.
- Full interaction states: loading, empty, error and success everywhere.
- Motion is `transform`/`opacity` only, with spring-ish easing, and everything
  collapses under `prefers-reduced-motion`.
- Grain sits on a fixed, `pointer-events: none` layer so it never repaints on
  scroll.

Lighthouse: **Accessibility 100 · Best Practices 100 · SEO 100.**
