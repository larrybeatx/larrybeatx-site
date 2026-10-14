/* ============================================================
   LarryBeatX Studios — application logic
   ============================================================ */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (t, c, h) => {
    const n = document.createElement(t);
    if (c) n.className = c;
    if (h != null) n.innerHTML = h;
    return n;
  };
  const icon = (id, cls) =>
    `<svg class="i ${cls || ''}" aria-hidden="true"><use href="#${id}"/></svg>`;

  /* ---------------- state ---------------- */
  const LS_CART = 'lbx.cart.v1';
  const state = {
    genre: 'All',
    sort: 'newest',
    cart: [],
    playingId: null,
    modalTier: 'wav',
    checkout: { step: 1, data: {}, order: null },
  };

  const engine = new window.PreviewEngine();

  const readCart = () => {
    try { return JSON.parse(localStorage.getItem(LS_CART)) || []; }
    catch (e) { return []; }
  };
  const writeCart = () => {
    try { localStorage.setItem(LS_CART, JSON.stringify(state.cart)); } catch (e) {}
  };

  const beatById  = (id) => BEATS.find((b) => b.id === id);
  const tierById  = (id) => LICENSE_TIERS.find((t) => t.id === id);
  const cartCount = () => state.cart.reduce((n, l) => n + 1, 0);
  const cartTotal = () =>
    state.cart.reduce((s, l) => {
      const b = beatById(l.beatId); const t = tierById(l.tierId);
      return s + (b && t ? tierPrice(b, t) : 0);
    }, 0);

  /* ---------------- toast ---------------- */
  let toastTimer;
  function toast(msg, ico = 'i-check') {
    const t = $('#toast');
    t.innerHTML = `${icon(ico)}<span></span>`;
    $('span', t).textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  /* ============================================================
     NAVIGATION
     ============================================================ */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const sheet = $('#navSheet');
  const burger = $('#navBurger');
  const openSheet = () => {
    sheet.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
  };
  const closeSheet = () => {
    sheet.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
  };
  burger.addEventListener('click', openSheet);
  $('#navSheetClose').addEventListener('click', closeSheet);
  $$('.sheet__links a').forEach((a) => a.addEventListener('click', closeSheet));
  sheet.addEventListener('click', (e) => {
    if (e.target === sheet) closeSheet();
  });

  /* active section highlight */
  const navLinks = $$('[data-navlink]');
  const sections = navLinks
    .map((a) => $(a.getAttribute('href')))
    .filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) =>
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id)
        );
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ============================================================
     REVEAL ON SCROLL
     ============================================================ */
  const revealables = $$('[data-reveal]');
  revealables.forEach((n) => {
    const d = n.getAttribute('data-reveal-delay');
    if (d) n.style.setProperty('--d', d);
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        obs.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    revealables.forEach((n) => io.observe(n));
  } else {
    revealables.forEach((n) => n.classList.add('is-in'));
  }

  /* marquee: duplicate the group so the loop is seamless */
  $$('[data-marquee]').forEach((track) => {
    const g = $('.marquee__group', track);
    if (g) track.appendChild(g.cloneNode(true));
  });

  /* ============================================================
     MAGNETIC BUTTONS
     ============================================================ */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('[data-magnetic]').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        btn.style.translate = `${x * 7}px ${y * 6}px`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.translate = ''; });
    });
  }

  /* ============================================================
     SPOTLIGHT ON CARDS
     ============================================================ */
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest && e.target.closest('.beat, .licopt');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });

  /* ============================================================
     WAVEFORM  (deterministic SVG bars, generated from the beat id)
     ============================================================ */
  function waveMarkup(seed, bars, h) {
    const rnd = window.seeded(seed + bars);
    const bw = 100 / bars;
    const gap = Math.min(1.6, bw * 0.28);
    let base = '';
    for (let i = 0; i < bars; i++) {
      const t = i / bars;
      /* intro + outro quieter, loud body, gentle random variation */
      const env = 0.34 + 0.66 * Math.sin(Math.PI * Math.min(1, t * 1.08));
      const jitter = 0.55 + rnd() * 0.75;
      const bh = Math.max(1.6, Math.min(h - 1.6, env * jitter * (h - 2)));
      const y = (h - bh) / 2;
      base += `<rect x="${(i * bw).toFixed(3)}" y="${y.toFixed(2)}" width="${(bw - gap).toFixed(3)}" height="${bh.toFixed(2)}" rx="1"/>`;
    }
    const uid = 'w' + Math.random().toString(36).slice(2, 8);
    return (
      `<svg viewBox="0 0 100 ${h}" preserveAspectRatio="none" role="img" ` +
      `aria-label="Waveform preview" focusable="false">` +
      `<g class="wave__base">${base}</g>` +
      `<g class="wave__fill" data-fill="${uid}">${base}</g></svg>`
    );
  }

  function setWaveProgress(beatId, pct) {
    const card = $(`.beat[data-id="${beatId}"] .wave__fill`);
    if (card) card.style.clipPath = `inset(0 ${(100 - pct * 100).toFixed(2)}% 0 0)`;
  }
  function clearWaveProgress() {
    $$('.wave__fill').forEach((n) => { n.style.clipPath = 'inset(0 100% 0 0)'; });
  }

  /* ============================================================
     BEAT GRID
     ============================================================ */
  const grid = $('#beatGrid');

  const flagLabel = (b) => {
    if (b.flag === 'new')  return '<span class="beat__flag beat__flag--new">New</span>';
    if (b.flag === 'hot')  return '<span class="beat__flag beat__flag--hot">Moving</span>';
    if (b.flag === 'sold') return '<span class="beat__flag beat__flag--sold">Exclusive sold</span>';
    return '';
  };

  const visibleBeats = () => {
    let list = state.genre === 'All' ? BEATS.slice() : BEATS.filter((b) => b.genre === state.genre);
    const s = state.sort;
    list.sort((a, b) => {
      if (s === 'bpm-asc')  return a.bpm - b.bpm;
      if (s === 'bpm-desc') return b.bpm - a.bpm;
      if (s === 'price-asc')  return a.price - b.price;
      if (s === 'price-desc') return b.price - a.price;
      return b.released.localeCompare(a.released);
    });
    return list;
  };

  function beatCard(b, i, wide) {
    const sold = b.flag === 'sold';
    const c = el('article', 'beat' + (wide ? ' beat--wide' : ''));
    c.dataset.id = b.id;
    c.dataset.sold = String(sold);
    c.dataset.genre = b.genre;

    const info = `
      <div class="beat__top">
        <span class="beat__idx">${String(i + 1).padStart(2, '0')}</span>
        <span style="display:flex;gap:.4rem;align-items:center;flex-wrap:wrap;justify-content:flex-end">
          ${flagLabel(b)}
          <span class="beat__genre">${b.genre}</span>
        </span>
      </div>
      <h3 class="beat__title">${b.title}</h3>
      <div class="beat__specs">
        <span><b>${b.bpm}</b> BPM</span>
        <span><b>${b.key}</b></span>
        <span>${fmtDate(b.released)}</span>
      </div>`;

    const foot = `
      <div class="beat__foot">
        <div class="beat__price">
          <b>${money(b.price)}</b><span>MP3 lease</span>
        </div>
        <div class="beat__acts">
          <button class="beat__link" type="button" data-open="${b.id}">
            Licenses ${icon('i-arrow-ur')}
          </button>
          <button class="playbtn" type="button" data-play="${b.id}"
            aria-label="${sold ? 'Preview' : 'Play'} ${b.title}">
            ${icon('i-play', 'i--play')}${icon('i-pause', 'i--pause')}
          </button>
        </div>
      </div>`;

    c.innerHTML = wide
      ? `${info}<div class="beat__body"><div><div class="wave">${waveMarkup(b.id, 96, 76)}</div></div><div>${foot}</div></div>`
      : `${info}<div class="wave">${waveMarkup(b.id, 52, 46)}</div>${foot}`;

    return c;
  }

  function renderGrid() {
    const list = visibleBeats();
    grid.innerHTML = '';
    const frag = document.createDocumentFragment();
    list.forEach((b, i) => {
      const wide = i === list.length - 1 && list.length > 1;
      frag.appendChild(beatCard(b, i, wide));
    });
    grid.appendChild(frag);
    $('#beatEmpty').hidden = list.length > 0;
    grid.hidden = list.length === 0;
    clearWaveProgress();
    syncPlayButtons();
  }

  /* ---- filter chips ---- */
  function renderChips() {
    const wrap = $('#genreChips');
    wrap.innerHTML = '';
    GENRES.forEach((g) => {
      const n = g === 'All' ? BEATS.length : BEATS.filter((b) => b.genre === g).length;
      const b = el('button', 'chip', `${g}<span class="chip__n">${n}</span>`);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(state.genre === g));
      b.addEventListener('click', () => {
        state.genre = g;
        $$('.chip', wrap).forEach((x) => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        renderGrid();
      });
      wrap.appendChild(b);
    });
  }

  $('#sortSelect').addEventListener('change', (e) => {
    state.sort = e.target.value;
    renderGrid();
  });
  $('#resetFilters').addEventListener('click', () => {
    state.genre = 'All';
    state.sort = 'newest';
    $('#sortSelect').value = 'newest';
    renderChips();
    renderGrid();
  });

  /* ============================================================
     PLAYER BAR
     ============================================================ */
  const player   = $('#player');
  const playerEq = $('#heroEq');
  let raf = null;

  function syncPlayButtons() {
    $$('[data-play]').forEach((btn) => {
      const on = btn.dataset.play === state.playingId && engine.playing;
      btn.classList.toggle('is-playing', on);
    });
    $$('.beat').forEach((card) => {
      card.classList.toggle('is-playing', card.dataset.id === state.playingId && engine.playing);
    });
    player.classList.toggle('is-playing', engine.playing);
    const pp = $('#playerPlay');
    if (pp) pp.setAttribute('aria-label', engine.playing ? 'Pause' : 'Play');
  }

  function showPlayer(b) {
    player.hidden = false;
    document.body.classList.add('has-player');
    $('#playerTitle').textContent = b.title;
    $('#playerSub').textContent = `${b.genre} · ${b.bpm} BPM · ${b.key}`;
    requestAnimationFrame(() => {
      player.style.setProperty('--player-h', player.offsetHeight + 'px');
      document.documentElement.style.setProperty('--player-h', player.offsetHeight + 'px');
    });
  }

  function playBeat(id) {
    const b = beatById(id);
    if (!b) return;
    const started = engine.play(b);
    if (started) {
      state.playingId = b.id;
      showPlayer(b);
      clearWaveProgress();
      playerEq && playerEq.classList.add('is-live');
      syncPlayButtons();
      loop();
    } else {
      /* paused — keep the id so the same button can resume */
      playerEq && playerEq.classList.remove('is-live');
      syncPlayButtons();
      if (!engine.playing) {
        cancelAnimationFrame(raf);
        raf = null;
        drawWave();
      }
    }
  }

  function togglePlay() {
    if (!state.playingId) return;
    playBeat(state.playingId);
  }

  function step(dir) {
    const list = visibleBeats();
    if (!list.length) return;
    const i = list.findIndex((b) => b.id === state.playingId);
    const n = list[((i < 0 ? 0 : i + dir) + list.length) % list.length];
    engine.stop();
    playBeat(n.id);
  }

  /* rAF loop — updates progress + canvas analyser */
  const wave = $('#playerWave');
  const wctx = wave.getContext ? wave.getContext('2d') : null;
  function sizeWave() {
    if (!wave || !wctx) return;
    const r = wave.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    wave.width = Math.max(1, r.width * dpr);
    wave.height = Math.max(1, r.height * dpr);
  }
  addEventListener('resize', sizeWave);
  if (wave && 'ResizeObserver' in window) new ResizeObserver(sizeWave).observe(wave);

  function loop() {
    if (!engine.playing) { drawWave(); return; }
    const b = engine.beat;
    const pct = engine.position / engine.loopDuration;
    $('#playerProg').style.width = (pct * 100).toFixed(2) + '%';
    $('#playerTime').textContent = fmtTime(engine.position);
    $('#playerDur').textContent = fmtTime(engine.loopDuration);
    setWaveProgress(b.id, pct);
    drawWave();
    raf = requestAnimationFrame(loop);
  }

  function drawWave() {
    if (!wctx || !wave.width) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = wave.width, h = wave.height;
    wctx.clearRect(0, 0, w, h);
    const bars = Math.max(24, Math.floor(w / (5 * dpr)));
    const bw = w / bars;
    const live = engine.playing && !engine.muted;
    const lv = live ? engine.levels(bars) : new Array(bars).fill(0.04);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#f4592a';
    for (let i = 0; i < bars; i++) {
      const v = Math.max(0.03, lv[i]);
      const bh = Math.max(2 * dpr, v * h * 0.94);
      const x = i * bw + bw * 0.22;
      const ww = Math.max(1.2 * dpr, bw * 0.56);
      wctx.fillStyle = live && i / bars <= (engine.position / engine.loopDuration)
        ? accent
        : 'rgba(255,255,255,0.16)';
      wctx.fillRect(x, (h - bh) / 2, ww, bh);
    }
  }

  $('#playerPlay').addEventListener('click', togglePlay);
  $('#playerPrev').addEventListener('click', () => step(-1));
  $('#playerNext').addEventListener('click', () => step(1));
  $('#playerClose').addEventListener('click', () => {
    engine.stop();
    state.playingId = null;
    player.hidden = true;
    document.body.classList.remove('has-player');
    playerEq && playerEq.classList.remove('is-live');
    clearWaveProgress();
    syncPlayButtons();
    cancelAnimationFrame(raf); raf = null;
    drawWave();
  });
  $('#playerBuy').addEventListener('click', () => {
    if (state.playingId) openBeatModal(state.playingId);
  });

  $('#playerVol').addEventListener('input', (e) => {
    const v = +e.target.value / 100;
    engine.setVolume(v);
    player.classList.toggle('is-muted', v === 0);
    if (v > 0) engine.setMuted(false);
  });
  $('#playerMute').addEventListener('click', () => {
    const m = !player.classList.contains('is-muted');
    player.classList.toggle('is-muted', m);
    engine.setMuted(m);
  });

  /* click the big waveform to seek */
  wave && wave.addEventListener('click', (e) => {
    if (!engine.beat) return;
    const r = wave.getBoundingClientRect();
    engine.seek(((e.clientX - r.left) / r.width) * engine.loopDuration);
    if (!engine.playing) { $('#playerProg').style.width = (((e.clientX - r.left) / r.width) * 100) + '%'; drawWave(); }
    else loop();
  });

  /* delegated card clicks */
  grid.addEventListener('click', (e) => {
    const play = e.target.closest('[data-play]');
    if (play) { playBeat(play.dataset.play); return; }
    const open = e.target.closest('[data-open]');
    if (open) { openBeatModal(open.dataset.open); return; }
    const card = e.target.closest('.beat');
    if (card) openBeatModal(card.dataset.id);
  });

  /* keyboard: space toggles, arrows seek */
  document.addEventListener('keydown', (e) => {
    if (e.target && e.target.closest && e.target.closest('input, textarea, select')) return;
    if (anyOverlayOpen()) return;
    if (e.code === 'Space' && state.playingId) { e.preventDefault(); togglePlay(); }
    if (e.code === 'ArrowRight' && engine.beat) { e.preventDefault(); engine.seek(engine.position + 2); }
    if (e.code === 'ArrowLeft' && engine.beat) { e.preventDefault(); engine.seek(engine.position - 2); }
  });

  /* ============================================================
     OVERLAY PLUMBING
     ============================================================ */
  const anyOverlayOpen = () =>
    [$('#beatModal'), $('#checkoutModal'), $('#cartDrawer'), sheet].some((n) => n && !n.hidden);

  function lock(v) { document.body.classList.toggle('is-locked', v); }

  function closeOverlay(node) {
    node.hidden = true;
    if (!anyOverlayOpen()) lock(false);
  }
  $$('.modal, .drawer').forEach((m) => {
    m.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) closeOverlay(m);
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!sheet.hidden) return closeSheet();
    $$('.modal, .drawer').forEach((m) => { if (!m.hidden) closeOverlay(m); });
  });

  /* ============================================================
     BEAT MODAL
     ============================================================ */
  const bm = $('#beatModal');

  function openBeatModal(id) {
    const b = beatById(id);
    if (!b) return;
    state.modalTier = 'wav';
    renderBeatModal(b);
    bm.hidden = false;
    lock(true);
  }

  function renderBeatModal(b) {
    const sold = b.flag === 'sold';
    const body = $('#bmBody');
    const opts = LICENSE_TIERS.map((t) => `
      <button class="licopt" type="button" data-tier="${t.id}"
        aria-pressed="${state.modalTier === t.id}">
        <span class="licopt__dot"></span>
        <span>
          <span class="licopt__n">${t.name}</span>
          <span class="licopt__f">${t.files[0]}${t.files.length > 1 ? ' +' + (t.files.length - 1) + ' more' : ''}</span>
        </span>
        <span class="licopt__p">${money(tierPrice(b, t))}</span>
      </button>`).join('');

    body.innerHTML = `
      <div class="bm__top">
        <div>
          <span class="bm__genre">${b.genre}</span>
          <h2 class="bm__title" id="bmTitle">${b.title}</h2>
          <div class="bm__specs">
            <span><b>${b.bpm}</b> BPM</span>
            <span><b>${b.key}</b></span>
            <span>Released <b>${fmtDate(b.released)}</b></span>
            <span>${b.moods.join(' · ')}</span>
          </div>
        </div>
      </div>

      <div class="wave wave--bm bm__wave">${waveMarkup(b.id, 128, 76)}</div>

      <div class="bm__player">
        <button class="playbtn playbtn--lg" type="button" data-play="${b.id}"
          aria-label="${engine.playing && state.playingId === b.id ? 'Pause' : 'Play'} ${b.title}">
          ${icon('i-play', 'i--play')}${icon('i-pause', 'i--pause')}
        </button>
        <span class="bm__time" data-bmtime>0:00</span>
        <span class="bm__time" style="margin-left:auto" data-bmdur>${fmtTime(engine.beat && engine.beat.id === b.id ? engine.loopDuration : (60 / b.bpm) * 16)}</span>
      </div>

      <div class="bm__lic">
        <div class="bm__lichead"><span>Choose a license</span><span>Instant delivery</span></div>
        ${opts}
      </div>

      <button class="btn btn--primary btn--block" type="button" data-addcart ${sold ? 'disabled' : ''}>
        ${sold ? 'Exclusive rights sold' : 'Add to cart — '}
        ${sold ? '' : `<span data-cartprice>${money(tierPrice(b, tierById(state.modalTier)))}</span>`}
      </button>
      ${sold ? '<p class="form__hint">This beat left the catalog. Something close to it can be built to order — get in touch.</p>' : ''}
      <p class="form__hint">Previews are live browser sketches. Full-quality tagged/untagged files ship with the license.</p>
    `;

    body.querySelectorAll('[data-tier]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.modalTier = btn.dataset.tier;
        body.querySelectorAll('[data-tier]').forEach((x) =>
          x.setAttribute('aria-pressed', String(x.dataset.tier === state.modalTier)));
        const t = tierById(state.modalTier);
        $('[data-cartprice]', body).textContent = money(tierPrice(b, t));
      });
    });

    const add = $('[data-addcart]', body);
    add && add.addEventListener('click', () => addToCart(b.id, state.modalTier));

    const pb = $('[data-play]', body);
    if (pb) {
      pb.classList.toggle('is-playing', engine.playing && state.playingId === b.id);
      pb.addEventListener('click', () => {
        playBeat(b.id);
        pb.classList.toggle('is-playing', engine.playing && state.playingId === b.id);
        $('[aria-label]', pb).setAttribute('aria-label', (engine.playing ? 'Pause ' : 'Play ') + b.title);
      });
    }

    if (state.playingId === b.id) setWaveProgress(b.id, engine.position / engine.loopDuration);
  }

  /* keep the modal time readout fresh while open */
  setInterval(() => {
    if (bm.hidden || !engine.beat) return;
    const t = $('[data-bmtime]');
    if (t) t.textContent = fmtTime(engine.position);
    if (engine.beat) {
      setWaveProgress(engine.beat.id, engine.position / engine.loopDuration);
      const pb = $('.bm__player [data-play]');
      if (pb) pb.classList.toggle('is-playing', engine.playing && state.playingId === engine.beat.id);
    }
  }, 120);

  /* ============================================================
     LICENSING SECTION
     ============================================================ */
  function renderLicenses() {
    const row = $('#licenseRow');
    row.innerHTML = '';
    LICENSE_TIERS.forEach((t, i) => {
      const ref = BEATS[0];
      const d = el('div', 'license' + (i === 1 ? ' is-open' : ''));
      d.innerHTML = `
        <button class="license__head" type="button" aria-expanded="${i === 1}">
          <span class="license__num">0${i + 1}</span>
          <span class="license__name">${t.name}</span>
          <span class="license__price">from ${money(tierPrice(ref, t))}</span>
          <span class="license__caret">${icon('i-arrow-right')}</span>
        </button>
        <div class="license__body"><div><div class="license__inner">
          <p class="license__desc">${t.desc}</p>
          <div class="license__grid">
            ${t.stats.map(([k, v]) => `<div class="license__stat"><span>${k}</span><strong>${v}</strong></div>`).join('')}
          </div>
          <ul class="license__files">
            ${t.files.map((f) => `<li>${icon('i-check')}${f}</li>`).join('')}
          </ul>
          <div class="license__cta">
            <a class="btn ${t.best ? 'btn--primary' : 'btn--ghost'} btn--sm" href="#catalog">
              Browse beats ${icon('i-arrow-right')}
            </a>
            ${t.best ? '<span class="license__best">Most picked</span>' : ''}
          </div>
        </div></div></div>`;
      const head = $('.license__head', d);
      head.addEventListener('click', () => {
        const open = d.classList.contains('is-open');
        $$('.license', row).forEach((x) => {
          x.classList.remove('is-open');
          $('.license__head', x).setAttribute('aria-expanded', 'false');
        });
        if (!open) {
          d.classList.add('is-open');
          head.setAttribute('aria-expanded', 'true');
        }
      });
      row.appendChild(d);
    });
  }

  /* ============================================================
     CART
     ============================================================ */
  const cartDrawer = $('#cartDrawer');

  function addToCart(beatId, tierId) {
    const b = beatById(beatId);
    if (!b || b.flag === 'sold') return;
    if (state.cart.some((l) => l.beatId === beatId && l.tierId === tierId)) {
      toast('That beat and license are already in your cart', 'i-cart');
      openCart();
      return;
    }
    state.cart.push({ beatId, tierId });
    writeCart();
    renderCart();
    bumpCart();
    toast(`${b.title} — ${tierById(tierId).name} added`, 'i-check');
    closeOverlay(bm);
    openCart();
  }

  function bumpCart() {
    const n = $('#cartCount');
    n.classList.remove('is-bump');
    void n.offsetWidth;
    n.classList.add('is-bump');
    setTimeout(() => n.classList.remove('is-bump'), 420);
  }

  function renderCart() {
    const body = $('#cartBody');
    const foot = $('#cartFoot');
    const count = cartCount();
    $('#cartCount').textContent = count;
    $('#cartCount').dataset.empty = String(count === 0);
    const sr = $('#cartSr');
    if (sr) sr.textContent = count === 0 ? ' — empty' : ` — ${count} item${count === 1 ? '' : 's'}`;

    if (!count) {
      body.innerHTML = `
        <div class="emptycart">
          ${icon('i-cart')}
          <h3 style="font-size:1.1rem">Nothing here yet</h3>
          <p>Pick a beat and a license and it will show up here.</p>
        </div>`;
      foot.innerHTML = `
        <button class="btn btn--ghost btn--block" type="button" data-close>Browse the catalog</button>`;
      return;
    }

    body.innerHTML = state.cart.map((l, i) => {
      const b = beatById(l.beatId); const t = tierById(l.tierId);
      return `
        <div class="cartline">
          <span class="cartline__art">${icon('i-note')}</span>
          <span>
            <span class="cartline__t">${b.title}</span>
            <span class="cartline__s">${t.name} · ${b.bpm} BPM · ${b.key}</span>
          </span>
          <span class="cartline__move">
            <span class="cartline__p">${money(tierPrice(b, t))}</span>
            <button class="cartline__rm" type="button" data-rm="${i}">Remove</button>
          </span>
        </div>`;
    }).join('');

    foot.innerHTML = `
      <div class="totals">
        <div class="totals__row"><span>Subtotal (${count} item${count > 1 ? 's' : ''})</span><b>${money(cartTotal())}</b></div>
        <div class="totals__row"><span>Delivery</span><b>Instant</b></div>
        <div class="totals__row totals__row--g"><span>Total</span><b>${money(cartTotal())}</b></div>
      </div>
      <button class="btn btn--primary btn--block" type="button" id="checkoutBtn">Checkout</button>
      <p class="form__hint">Card, transfer or PayPal — you pick at the next step.</p>`;

    $$('[data-rm]', body).forEach((btn) => {
      btn.addEventListener('click', () => {
        state.cart.splice(+btn.dataset.rm, 1);
        writeCart();
        renderCart();
      });
    });
    $('#checkoutBtn').addEventListener('click', openCheckout);
  }

  function openCart() {
    renderCart();
    cartDrawer.hidden = false;
    lock(true);
  }
  $('#cartBtn').addEventListener('click', openCart);

  /* ============================================================
     CHECKOUT
     ============================================================ */
  const co = $('#checkoutModal');

  function openCheckout() {
    if (!state.cart.length) { toast('Your cart is empty', 'i-cart'); return; }
    closeOverlay(cartDrawer);
    state.checkout = { step: 1, data: { ...state.checkout.data }, order: null };
    renderCheckout();
    co.hidden = false;
    lock(true);
  }

  function renderCheckout() {
    const c = state.checkout;
    const body = $('#coBody');
    const rows = state.cart.map((l) => {
      const b = beatById(l.beatId); const t = tierById(l.tierId);
      return `<div class="co__sumrow"><span>${b.title} — ${t.name}</span><b>${money(tierPrice(b, t))}</b></div>`;
    }).join('');

    if (c.step === 3) {
      body.innerHTML = `
        <div class="co__ok">
          <span class="tick">${icon('i-check')}</span>
          <h3>Order received</h3>
          <span class="co__id">${c.order.id}</span>
          <p>A copy is on its way to ${c.order.email}. Your files unlock the moment payment clears — the studio has the notes too.</p>
          <div class="co__sum" style="width:100%;text-align:left">${rows}
            <div class="co__sumrow" style="border-top:1px solid var(--line);padding-top:.6rem;margin-top:.3rem">
              <span>Total</span><b>${money(cartTotal())}</b></div>
          </div>
          <div style="display:grid;gap:.5rem;width:100%">
            <a class="btn btn--primary btn--block" id="mailOrder" href="#">Email me this order</a>
            <button class="btn btn--ghost btn--block" type="button" data-close>Back to the catalog</button>
          </div>
        </div>`;
      $('#mailOrder').addEventListener('click', (e) => {
        e.preventDefault();
        const subj = encodeURIComponent(`Order ${c.order.id} — LarryBeatX Studios`);
        const txt = encodeURIComponent(orderText(c.order));
        window.location.href = `mailto:${STUDIO.email}?subject=${subj}&body=${txt}`;
      });
      return;
    }

    const d = c.data;
    const step2 = c.step === 2;

    body.innerHTML = `
      <div class="co">
        <div class="co__head">
          <div class="co__steps"><b>${step2 ? 'Review' : 'Your details'}</b><span class="co__sep"></span><span>${step2 ? 'Done' : 'Review'}</span></div>
          <h2 class="co__title" id="coTitle">${step2 ? 'Check the order' : 'Where should the files go?'}</h2>
          <p class="co__sub">${step2 ? 'One pass over it and you are done.' : 'We only use this to deliver your files and licence paperwork.'}</p>
        </div>

        <div class="co__sum">${rows}
          <div class="co__sumrow" style="border-top:1px solid var(--line);padding-top:.6rem;margin-top:.3rem">
            <span>Total</span><b>${money(cartTotal())}</b></div>
        </div>

        ${step2 ? '' : `
        <div class="field">
          <label for="c-name">Full name</label>
          <input id="c-name" type="text" value="${d.name || ''}" placeholder="Amara Osei" autocomplete="name" />
          <p class="field__err" data-err-for="cname"></p>
        </div>
        <div class="field">
          <label for="c-email">Email</label>
          <input id="c-email" type="email" value="${d.email || ''}" placeholder="you@label.com" autocomplete="email" />
          <p class="field__err" data-err-for="cemail"></p>
        </div>
        <div class="field">
          <label for="c-country">Country <span class="field__opt">for the licence paperwork</span></label>
          <div class="select select--block">
            <select id="c-country">
              ${['', 'Nigeria', 'United Kingdom', 'United States', 'Canada', 'Germany', 'France', 'South Africa', 'Ghana', 'Kenya', 'Other']
                .map((x) => `<option value="${x}" ${d.country === x ? 'selected' : ''}>${x || 'Pick one'}</option>`).join('')}
            </select>
            ${icon('i-arrow-right')}
          </div>
        </div>
        <div class="field">
          <label for="c-notes">Anything to change? <span class="field__opt">optional</span></label>
          <textarea id="c-notes" rows="3" placeholder="Key, tempo, arrangement, or which vocal take this is for…">${d.notes || ''}</textarea>
        </div>`}

        ${step2 ? `
        <div class="co__note">${icon('i-shield')}<span>Licence, delivery and revisions are covered on the confirmation. Card and transfer both supported at the counter.</span></div>
        <button class="btn btn--primary btn--block" id="placeOrder" type="button">
          <span class="btn__txt">Place order — ${money(cartTotal())}</span>
        </button>
        <button class="co__back" type="button" id="backStep">Back</button>
        ` : `
        <button class="btn btn--primary btn--block" id="toReview" type="button">
          <span class="btn__txt">Review order</span>${icon('i-arrow-right')}
        </button>
        <button class="co__back" type="button" data-close>Keep browsing</button>
        `}
      </div>`;

    if (!step2) {
      $('#toReview').addEventListener('click', () => {
        const ok = validateCheckout();
        if (!ok) return;
        state.checkout.data = {
          name: $('#c-name').value.trim(),
          email: $('#c-email').value.trim(),
          country: $('#c-country').value,
          notes: $('#c-notes').value.trim(),
        };
        state.checkout.step = 2;
        renderCheckout();
      });
    } else {
      $('#backStep').addEventListener('click', () => {
        state.checkout.step = 1;
        renderCheckout();
      });
      $('#placeOrder').addEventListener('click', placeOrder);
    }
  }

  function fieldErr(key, show, msg) {
    const p = $(`[data-err-for="${key}"]`);
    const f = p && p.closest('.field');
    if (f) f.classList.toggle('has-err', show);
    if (p) p.textContent = show && msg ? msg : '';
  }

  function validateCheckout() {
    let ok = true;
    const name = $('#c-name').value.trim();
    const email = $('#c-email').value.trim();
    if (name.length < 2) { fieldErr('cname', true, 'Tell us who the licence belongs to.'); ok = false; }
    else fieldErr('cname', false);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      fieldErr('cemail', true, 'That email will not reach you.'); ok = false;
    } else fieldErr('cemail', false);
    return ok;
  }

  function orderText(o) {
    const lines = state.cart.map((l) => {
      const b = beatById(l.beatId); const t = tierById(l.tierId);
      return `- ${b.title} — ${t.name} — ${money(tierPrice(b, t))}`;
    });
    return [
      `Order ${o.id}`,
      '',
      ...lines,
      '',
      `Total: ${money(cartTotal())}`,
      '',
      `Name: ${o.name}`,
      `Email: ${o.email}`,
      `Country: ${o.country || '—'}`,
      `Notes: ${o.notes || '—'}`,
      '',
      '— LarryBeatX Studios',
    ].join('\n');
  }

  function placeOrder() {
    const btn = $('#placeOrder');
    btn.classList.add('is-loading');
    btn.disabled = true;
    setTimeout(() => {
      const id = 'LBX-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      state.checkout.order = {
        id,
        ...state.checkout.data,
        items: state.cart.slice(),
        total: cartTotal(),
      };
      state.checkout.step = 3;
      state.cart = [];
      writeCart();
      renderCart();
      renderCheckout();
    }, 1100);
  }

  /* ============================================================
     SERVICES (with generated SVG art per row)
     ============================================================ */
  const SERVICE_ART = {
    spectrum: () => {
      let bars = '';
      for (let i = 0; i < 44; i++) {
        const h = 6 + Math.abs(Math.sin(i * 0.42)) * 46 + (i % 3) * 5;
        bars += `<rect x="${i * 4.6 + 1}" y="${60 - h}" width="2.7" height="${h}" rx="1.3" fill="rgba(255,255,255,0.2)"/>`;
      }
      return `<svg viewBox="0 0 205 84" aria-hidden="true">
        <path d="M0 22 C 30 8, 52 66, 78 40 S 126 4, 152 30 192 62 205 34" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>
        <path d="M0 22 C 30 8, 52 66, 78 40 S 126 4, 152 30 192 62 205 34 L205 84 L0 84 Z" fill="var(--accent)" opacity="0.1"/>
        <g transform="translate(0,12)">${bars}</g>
        <line x1="0" y1="72" x2="205" y2="72" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>
      </svg>`;
    },
    pitch: () => {
      let d = 'M0 52';
      const n = 26;
      for (let i = 0; i <= n; i++) {
        const target = 14 + Math.sin(i * 0.55) * 10;
        const raw = target + (i % 3 === 0 ? 13 : i % 3 === 1 ? -9 : 4);
        d += ` L${(i / n) * 205} ${raw.toFixed(1)}`;
      }
      let dots = '';
      for (let i = 0; i <= n; i += 2) {
        const target = 14 + Math.sin(i * 0.55) * 10;
        dots += `<circle cx="${(i / n) * 205}" cy="${target.toFixed(1)}" r="3" fill="var(--accent)"/>`;
      }
      return `<svg viewBox="0 0 205 84" aria-hidden="true">
        <line x1="0" y1="14" x2="205" y2="14" stroke="rgba(255,255,255,0.16)" stroke-dasharray="3 4"/>
        <line x1="0" y1="42" x2="205" y2="42" stroke="rgba(255,255,255,0.16)" stroke-dasharray="3 4"/>
        <line x1="0" y1="70" x2="205" y2="70" stroke="rgba(255,255,255,0.16)" stroke-dasharray="3 4"/>
        <path d="${d}" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1.6" stroke-linejoin="round"/>
        ${dots}
        <text x="0" y="10" fill="var(--ink-3)" font-family="Geist Mono, monospace" font-size="7">BEFORE</text>
        <text x="160" y="10" fill="var(--accent)" font-family="Geist Mono, monospace" font-size="7">AFTER</text>
      </svg>`;
    },
    stems: () => {
      const names = ['KICK', '808', 'SNARE', 'HATS', 'PERC', 'KEYS', 'LEAD', 'VOX', 'FX'];
      let cells = '';
      names.forEach((n, i) => {
        const on = i !== 3;
        cells += `<g>
          <rect x="${(i % 3) * 68 + 2}" y="${Math.floor(i / 3) * 28 + 2}" width="62" height="22" rx="4"
            fill="${on ? 'rgba(244,89,42,0.14)' : 'rgba(255,255,255,0.05)'}"
            stroke="${on ? 'rgba(244,89,42,0.4)' : 'rgba(255,255,255,0.1)'}"/>
          <text x="${(i % 3) * 68 + 9}" y="${Math.floor(i / 3) * 28 + 17}" fill="${on ? '#ffb59c' : 'var(--ink-3)'}"
            font-family="Geist Mono, monospace" font-size="7.5">${n}</text>
          <circle cx="${(i % 3) * 68 + 56}" cy="${Math.floor(i / 3) * 28 + 13}" r="2.6"
            fill="${on ? 'var(--accent)' : 'rgba(255,255,255,0.2)'}"/>
        </g>`;
      });
      return `<svg viewBox="0 0 205 88" aria-hidden="true">${cells}</svg>`;
    },
  };

  function renderServices() {
    const wrap = $('#serviceList');
    wrap.innerHTML = '';
    SERVICES.forEach((s, i) => {
      const row = el('article', 'svc__row');
      row.setAttribute('data-reveal', '');
      row.setAttribute('data-reveal-delay', String(i + 1));
      row.innerHTML = `
        <div class="svc__copy">
          <div class="svc__price"><b>${money(s.price)}</b><span>${s.unit}</span></div>
          <h3 class="svc__title">${s.title}</h3>
          <p class="svc__desc">${s.desc}</p>
          <ul class="svc__list">
            ${s.list.map((l) => `<li>${icon('i-check')}<span>${l}</span></li>`).join('')}
          </ul>
          <p class="svc__turn">${icon('i-clock')}<span>${s.turn}</span></p>
          <a class="btn btn--ghost btn--sm" href="#contact" style="margin-top:1.2rem" data-magnetic>
            Start a brief ${icon('i-arrow-right')}
          </a>
        </div>
        <div class="svc__art">
          ${SERVICE_ART[s.art]()}
          <div class="svc__artcap">${s.cap.map((c) => `<span>${c}</span>`).join('')}</div>
        </div>`;
      wrap.appendChild(row);
    });
    $$('[data-reveal]', wrap).forEach((n) => {
      if ('IntersectionObserver' in window) ioAdd(n);
      else n.classList.add('is-in');
    });
  }

  /* a tiny observer factory reused by late-rendered blocks */
  let revealIO = null;
  function ioAdd(n) {
    if (!revealIO) {
      revealIO = new IntersectionObserver((es, obs) => {
        es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    }
    const d = n.getAttribute('data-reveal-delay');
    if (d) n.style.setProperty('--d', d);
    revealIO.observe(n);
  }

  /* ============================================================
     PROCESS + VOICES
     ============================================================ */
  function renderProcess() {
    $('#processList').innerHTML = PROCESS.map((p, i) => `
      <li class="step" data-reveal data-reveal-delay="${i + 1}">
        <span class="step__n">0${i + 1}</span>
        <h3 class="step__t">${p.t}</h3>
        <p class="step__d">${p.d}</p>
      </li>`).join('');
  }

  function renderVoices() {
    $('#voiceList').innerHTML = VOICES.map((v, i) => `
      <figure class="voice" data-reveal data-reveal-delay="${i + 1}">
        ${icon('i-quote', 'voice__mark')}
        <blockquote class="voice__q">${v.q}</blockquote>
        <figcaption class="voice__who">
          <span class="avatar avatar--${v.av}">${v.initials}</span>
          <div><span class="voice__name">${v.name}</span><span class="voice__role">${v.role}</span></div>
        </figcaption>
      </figure>`).join('');
  }

  /* ============================================================
     CONTACT FORM
     ============================================================ */
  const briefForm = $('#briefForm');
  briefForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = $('#briefSubmit');
    const f = new FormData(briefForm);
    const v = {
      name: (f.get('name') || '').toString().trim(),
      email: (f.get('email') || '').toString().trim(),
      service: (f.get('service') || '').toString(),
      budget: (f.get('budget') || '').toString(),
      link: (f.get('link') || '').toString().trim(),
      message: (f.get('message') || '').toString().trim(),
    };

    let ok = true;
    const bad = (k, m) => { fieldErr(k, true, m); ok = false; };
    if (v.name.length < 2) bad('name', 'We need something to call you.');
    else fieldErr('name', false);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) bad('email', 'A working email, so the reply lands.');
    else fieldErr('email', false);
    if (!v.service) bad('service', 'Pick the closest one.');
    else fieldErr('service', false);
    if (!v.budget) bad('budget', 'A rough range is fine.');
    else fieldErr('budget', false);
    if (v.link && !/^https?:\/\/.+/.test(v.link)) bad('link', 'Needs to start with http:// or https://');
    else fieldErr('link', false);
    if (!ok) { toast('Check the highlighted fields', 'i-close'); return; }

    btn.classList.add('is-loading');
    btn.disabled = true;
    setTimeout(() => {
      btn.classList.remove('is-loading');
      btn.disabled = false;
      briefForm.innerHTML = `
        <div class="form__done">
          <span class="tick">${icon('i-check')}</span>
          <h3>Brief received</h3>
          <p>Thanks ${v.name.split(' ')[0]} — it is in the queue. Expect a reply at <strong>${v.email}</strong> inside 12 hours, usually sooner.</p>
          <button class="btn btn--ghost btn--sm" type="button" id="againBtn">Send another</button>
        </div>`;
      $('#againBtn').addEventListener('click', () => location.reload());
    }, 1100);
  });

  /* ============================================================
     INIT
     ============================================================ */
  $('#year').textContent = new Date().getFullYear();
  state.cart = readCart();
  renderChips();
  renderGrid();
  renderLicenses();
  renderServices();
  renderProcess();
  renderVoices();
  renderCart();
  sizeWave();
  drawWave();
})();
