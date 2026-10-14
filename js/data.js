/* ============================================================
   LarryBeatX Studios — site data
   No audio files are shipped. Every preview is generated live
   in the browser from the pattern + key + BPM below.
   ============================================================ */

const STUDIO = {
  name: 'LarryBeatX Studios',
  producer: 'LarryBeatX',
  signOff: 'Yobangin',
  email: 'studio@larrybeatx.com',
  instagram: '@larrybeatx',
};

/* ------------------------------------------------------------
   License tiers.
   `mult` is applied to each beat's base price, then rounded
   to the nearest whole dollar minus one cent.
   ------------------------------------------------------------ */
const LICENSE_TIERS = [
  {
    id: 'mp3',
    name: 'MP3 Lease',
    mult: 1,
    desc:
      'The entry lease. Tagged MP3, unlimited personal use, and enough clearance to put the record out and start building around it.',
    stats: [
      ['Streams', 'Up to 50,000'],
      ['Music videos', '1'],
      ['Radio', 'Non-commercial'],
      ['Term', '3 years'],
    ],
    files: ['Tagged MP3 320kbps'],
  },
  {
    id: 'wav',
    name: 'WAV Lease',
    mult: 1.75,
    desc:
      'The lease most artists end up on. Untagged, full-quality WAV plus the MP3, with the stream and video ceilings raised to release level.',
    stats: [
      ['Streams', 'Up to 500,000'],
      ['Music videos', '2'],
      ['Radio', 'Non-commercial'],
      ['Term', '5 years'],
    ],
    files: ['Untagged WAV 24-bit / 48kHz', 'Untagged MP3 320kbps'],
    best: true,
  },
  {
    id: 'trackout',
    name: 'Trackout Stems',
    mult: 4.25,
    desc:
      'Every element on its own track, bounced flat from the project — drums, bass, keys, leads, FX. Hand it to your own mixer and nothing is lost.',
    stats: [
      ['Streams', 'Unlimited'],
      ['Music videos', 'Unlimited'],
      ['Radio', 'Commercial'],
      ['Term', '10 years'],
    ],
    files: ['Full untagged WAV', 'Stems — 12+ tracks', 'FL Studio project'],
  },
  {
    id: 'exclusive',
    name: 'Exclusive Rights',
    mult: 12.9,
    desc:
      'The beat comes off the catalog permanently and every right transfers to you. Only one of these ever exists per beat.',
    stats: [
      ['Streams', 'Unlimited'],
      ['Music videos', 'Unlimited'],
      ['Radio', 'Commercial + sync'],
      ['Term', 'Perpetual'],
    ],
    files: ['Full untagged WAV', 'Stems — 12+ tracks', 'FL Studio project', 'Signed transfer'],
  },
];

/* ------------------------------------------------------------
   Beat catalog.
   root  — MIDI note of the bass root
   pat   — pattern archetype used by the preview engine
   ------------------------------------------------------------ */
const BEATS = [
  { id: 'ojo-luwa',      title: 'Ojó Luwa',        genre: 'Afrobeat',   bpm: 104, key: 'F♯ min', root: 42, pat: 'afrobeat', price: 34.99, released: '2026-03-02', moods: ['Warm', 'Late night'],  flag: 'new'  },
  { id: 'come-from',     title: 'Come From',       genre: 'Afrobeat',   bpm: 110, key: 'D min',  root: 50, pat: 'afrobeat', price: 34.99, released: '2026-02-11', moods: ['Gritty', 'Uplifting']                },
  { id: 'jekanmo',       title: 'Jekanmo',         genre: 'Afrobeat',   bpm: 102, key: 'C min',  root: 48, pat: 'afrobeat', price: 29.99, released: '2025-11-05', moods: ['Smooth', 'Late night'],  flag: 'hot'  },
  { id: 'april-voice',   title: 'April Voice',     genre: 'Afrobeat',   bpm: 104, key: 'F♯ maj', root: 42, pat: 'fusion',   price: 34.99, released: '2026-04-27', moods: ['Warm', 'Uplifting'],   flag: 'new'  },
  { id: 'phone-call',    title: 'Phone Call',      genre: 'Afrobeat',   bpm: 110, key: 'D min',  root: 50, pat: 'fusion',   price: 29.99, released: '2025-10-13', moods: ['Late night', 'Gritty']                },
  { id: 'zarbose',       title: 'Zarbose',         genre: 'Afrobeat',   bpm: 107, key: 'G min',  root: 43, pat: 'afrobeat', price: 34.99, released: '2025-05-22', moods: ['Dark', 'Gritty']                      },
  { id: 'road-tagged',   title: 'Road Tagged',     genre: 'Amapiano',   bpm: 110, key: 'B♭ min', root: 46, pat: 'amapiano', price: 39.99, released: '2026-01-19', moods: ['Late night', 'Smooth'], flag: 'new'  },
  { id: 'log-drum',      title: 'Log Drum Sunday', genre: 'Amapiano',   bpm: 112, key: 'F min',  root: 41, pat: 'amapiano', price: 39.99, released: '2026-02-24', moods: ['Uplifting', 'Warm'],    flag: 'new'  },
  { id: 'flex-tag',      title: 'Flex Tag',        genre: 'Afro-Fusion', bpm: 103, key: 'A min',  root: 45, pat: 'fusion',   price: 34.99, released: '2025-11-15', moods: ['Smooth', 'Uplifting']                },
  { id: 'starboy',       title: 'Starboy',         genre: 'Afro-Fusion', bpm: 108, key: 'E min',  root: 40, pat: 'fusion',   price: 39.99, released: '2025-10-29', moods: ['Dark', 'Late night']                 },
  { id: 'nov-16',        title: 'Nov 16',          genre: 'R&B',        bpm: 102, key: 'A maj',  root: 45, pat: 'rnb',      price: 34.99, released: '2024-12-07', moods: ['Smooth', 'Warm']                      },
  { id: 'true',          title: 'True',            genre: 'R&B',        bpm: 94,  key: 'E min',  root: 40, pat: 'rnb',      price: 34.99, released: '2024-11-06', moods: ['Late night', 'Smooth']                },
  { id: 'evening-ep',    title: 'Evening Ep',      genre: 'R&B',        bpm: 95,  key: 'C♯ min', root: 49, pat: 'rnb',      price: 34.99, released: '2025-05-27', moods: ['Warm', 'Late night']                 },
  { id: 'groove-115',    title: 'Groove 115',      genre: 'Afro-House', bpm: 115, key: 'G maj',  root: 43, pat: 'house',    price: 34.99, released: '2025-06-17', moods: ['Uplifting', 'Warm'],    flag: 'sold' },
  { id: 'run-it-up',     title: 'Run It Up',       genre: 'Drill',      bpm: 142, key: 'G min',  root: 43, pat: 'drill',    price: 34.99, released: '2026-03-18', moods: ['Dark', 'Gritty'],       flag: 'new'  },
];

/* ------------------------------------------------------------
   Studio services
   ------------------------------------------------------------ */
const SERVICES = [
  {
    id: 'mix',
    title: 'Mixing & Mastering',
    price: 149,
    unit: 'per song',
    icon: 'i-sliders',
    art: 'spectrum',
    desc:
      'A full mix on a monitored chain, then a master cut for release. Balance first — levels, EQ, compression, saturation, space — so the vocal sits forward and the low end stays controlled on every system.',
    list: [
      'Gain staging and clip-free signal path',
      'Surgical EQ, multiband and bus compression',
      'Vocal chain — de-ess, tune, doubles and ad-libs in the pocket',
      'Master to −14 LUFS (streaming) or −9 LUFS (club) on request',
      'Two rounds of revisions included',
    ],
    turn: '3 working days · 24-hour rush available',
    cap: ['−14.2 LUFS', 'True peak −1.0 dBTP', '48kHz / 24-bit'],
  },
  {
    id: 'vocal',
    title: 'Vocal Production & Tuning',
    price: 89,
    unit: 'per song',
    icon: 'i-mic',
    art: 'pitch',
    desc:
      'Turning a good take into the hook. Comping, timing and pitch handled transparently — corrected where it needs it, left alone where it should breathe.',
    list: [
      'Comping the strongest take into one performance',
      'Timing cleanup on a grid you choose',
      'Pitch correction, transparent and manual where needed',
      'Doubles, harmonies and ad-lib arrangement',
      'Vocal chain ready to drop into your mix',
    ],
    turn: '2 working days',
    cap: ['Compiled lead', 'Harmony stack', 'Tuning report'],
  },
  {
    id: 'custom',
    title: 'Custom & Exclusive Production',
    price: 299,
    unit: 'from',
    icon: 'i-layers',
    art: 'stems',
    desc:
      'Written around a reference you send, or built from scratch off a voice note. Rearranged, re-keyed, re-arranged to your artist — including 808s, percussion and a topline bed if you need one.',
    list: [
      'Built to your reference track and tempo',
      'Key change, re-arrangement and extended sections',
      'Custom 808s, percussion and FX written for the record',
      'Exclusive rights and full stem delivery',
      'Unlimited revisions until it is right',
    ],
    turn: '5–7 working days',
    cap: ['Reference-matched', 'Full stems', 'Exclusive rights'],
  },
];

/* ------------------------------------------------------------
   Process
   ------------------------------------------------------------ */
const PROCESS = [
  {
    t: 'Pick the record',
    d: 'Browse the catalog, filter by genre, BPM or mood, and preview anything that catches you. Nothing is locked behind a signup.',
  },
  {
    t: 'Choose your clearance',
    d: 'Four license levels per beat, from a tagged lease through to full exclusive rights. The limits are written out before you pay.',
  },
  {
    t: 'Checkout and add notes',
    d: 'Instant cart, clear totals, and a notes field for anything you want changed — key, tempo, arrangement, or the vocal pocket.',
  },
  {
    t: 'Files land in your inbox',
    d: 'Digital delivery the moment payment clears. Mixing briefs come back inside three working days with revisions written in.',
  },
];

/* ------------------------------------------------------------
   Testimonials
   ------------------------------------------------------------ */
const VOICES = [
  {
    q: 'I sent Larry a voice note and a rough guitar idea. What came back had a hook in it I could not get out of my head. That is the whole job.',
    name: 'Marisol Adeyemi',
    role: 'Afro-soul artist · Lagos',
    initials: 'MA',
    av: 'a',
  },
  {
    q: 'The mix translated. I played it in the car, on laptop speakers, and in the club, and the 808 sat in the same place on all three. That never happens.',
    name: 'Theo Marchetti',
    role: 'A&R · Northline Records',
    initials: 'TM',
    av: 'b',
  },
  {
    q: 'Turnaround was two days for a four-track session, and he flagged a phasing issue on the vocal before I even heard it. Proper engineer ears.',
    name: 'Rina Calloway',
    role: 'Independent artist · Manchester',
    initials: 'RC',
    av: 'd',
  },
];

const GENRES = ['All', ...Array.from(new Set(BEATS.map((b) => b.genre)))];

/* ------------------------------------------------------------
   helpers
   ------------------------------------------------------------ */
const money = (n) =>
  '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const tierPrice = (beat, tier) => {
  const v = beat.price * tier.mult;
  return Math.max(9.99, Math.round(v) - 0.01);
};

const fmtDate = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
};

const fmtTime = (s) => {
  s = Math.max(0, Math.floor(s));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
};

/* deterministic pseudo-random from a string seed */
function seeded(seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function () {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}
