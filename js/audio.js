/* ============================================================
   PreviewEngine — generates a real, audible sketch of each beat
   in the browser. No audio files, no network.

   Each pattern is a 4-bar / 64-step grid of 16th notes.
   Sounds are synthesised: analog-style kick, noise snare/clap,
   filtered hats, a slidable 808 bass, detuned pads and plucks.
   ============================================================ */

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

/* ---------- 64-step drum grids ('x' = hit, '.' = rest) -------- */
const P = (a, b, c, d) => a + b + c + d;

const PATTERNS = {
  afrobeat: {
    kick:  P('x..x..x...x.....', 'x..x..x...x.....', 'x..x..x...x.x...', 'x..x..x...x..x..'),
    snare: P('....x.......x...', '....x.......x...', '....x.......x...', '....x.......x.x.'),
    clap:  P('................', '................', '................', '....x.......x...'),
    hat:   P('..x...x...x...x.', '..x...x...x...x.', '..x...x...x...x.', '..x...x...x.xxx.'),
    shaker:P('x.x.x.x.x.x.x.x.', 'x.x.x.x.x.x.x.x.', 'x.x.x.x.x.x.x.x.', 'x.x.x.x.x.x.xxx'),
    conga: P('....x.....x.....', '......x.....x...', '....x.....x.....', '..x.....x.......'),
    rim:   P('................', '................', '............x...', '................'),
    bass: [
      [0, 0, 3, false], [3, 0, 2, false], [6, 0, 2, false], [8, -2, 2, true],
      [11, 0, 3, false], [14, 0, 1, false],
      [16, 3, 3, false], [19, 3, 2, false], [22, 3, 2, false], [25, 5, 3, true],
      [28, 3, 2, false], [31, 0, 1, false],
      [32, 0, 3, false], [35, 0, 2, false], [38, 0, 2, false], [41, -2, 2, true],
      [44, 0, 3, false], [47, 0, 1, false],
      [48, 7, 3, false], [51, 5, 2, false], [54, 3, 2, false], [57, 0, 6, true],
    ],
    chords: [
      [0, [0, 3, 7, 10], 13], [16, [0, 3, 7, 10], 13], [32, [0, 3, 7, 10], 13], [48, [5, 3, 7, 10], 15],
    ],
    lead: [
      [40, 12, 1.6], [44, 15, 1.6], [47, 19, 3.2], [52, 17, 1.6], [55, 15, 1.6], [58, 12, 3.2],
    ],
  },

  amapiano: {
    kick:  P('x...x...x...x...', 'x...x...x...x...', 'x...x...x...x...', 'x...x...x...x..x'),
    snare: P('................', '................', '................', '............x...'),
    clap:  P('....x.......x...', '....x.......x...', '....x.......x...', '....x.......x..x'),
    hat:   P('..x...x...x...x.', '..x...x...x...x.', '..x...x...x...x.', '..x...x...x.xxx.'),
    shaker:P('x.x.x.x.x.x.x.x.', 'x.x.x.x.x.x.x.x.', 'x.x.x.x.x.x.x.x.', 'x.x.x.x.x.x.xxx'),
    conga: P('........x.......', '........x.......', '........x.......', '......x.....x...'),
    rim:   P('................', '................', '................', '................'),
    bass: [
      [0, 0, 12, true], [12, 0, 3, false],
      [16, 3, 12, true], [28, 3, 3, false],
      [32, 5, 12, true], [44, 3, 3, false],
      [48, 7, 14, true],
    ],
    chords: [
      [0, [0, 4, 7, 11], 15], [16, [0, 4, 7, 11], 15], [32, [2, 5, 9, 12], 15], [48, [0, 4, 7, 11], 15],
    ],
    lead: [
      [8, 19, 1.2], [12, 24, 1.2], [16, 22, 1.2], [20, 19, 1.2],
      [24, 22, 1.2], [28, 26, 1.2], [32, 24, 1.2], [36, 22, 1.2],
      [40, 19, 1.2], [44, 24, 1.2], [48, 27, 2.4], [52, 24, 2.4],
    ],
  },

  fusion: {
    kick:  P('x.....x...x.....', 'x.......x.......', 'x.....x...x.....', 'x.......x.....x.'),
    snare: P('....x.......x...', '....x.......x...', '....x.......x...', '....x.......x.x.'),
    clap:  P('................', '................', '................', '............x...'),
    hat:   P('..x...x...x...x.', 'x.x...x...x...x.', '..x...x...x...x.', 'x.x...x...x.xxx.'),
    shaker:P('....x.......x...', '....x.......x...', '....x.......x...', '....x.......x...'),
    conga: P('......x.........', '......x.........', '......x.....x...', '......x........x'),
    rim:   P('................', '................', '...............x', '................'),
    bass: [
      [0, 0, 4, false], [6, 0, 2, false],
      [14, -2, 2, true],
      [16, 0, 4, false], [22, 3, 2, false],
      [32, 0, 4, false], [38, 5, 2, false],
      [47, 7, 4, true],
      [52, 5, 3, false], [56, 3, 4, false],
    ],
    chords: [
      [0, [0, 3, 7, 14], 14], [16, [0, 3, 7, 14], 14], [32, [0, 3, 7, 10], 14], [48, [0, 3, 7, 10], 15],
    ],
    lead: [
      [24, 15, 2.4], [28, 19, 2.4], [36, 22, 2.4], [44, 19, 2.4], [48, 24, 3.2], [56, 22, 3.2],
    ],
  },

  rnb: {
    kick:  P('x.......x.x.....', 'x.......x.......', 'x.......x.x.....', 'x.......x.......'),
    snare: P('....x.......x...', '....x.......x...', '....x.......x...', '....x.......x..x'),
    clap:  P('................', '................', '................', '................'),
    hat:   P('..x..x..x.x..x..', '..x..x..x.x..x..', '..x..x..x.x..x..', '..x..x..x.x.xxx.'),
    shaker:P('................', '................', '................', '................'),
    conga: P('................', '................', '................', '................'),
    rim:   P('..............x.', '..............x.', '..............x.', '..............x.'),
    bass: [
      [0, 0, 5, false], [8, 0, 2, false],
      [14, 3, 2, false],
      [16, 0, 5, false], [24, 5, 2, false],
      [32, 0, 5, false], [40, 3, 2, false],
      [47, 7, 3, false],
      [52, 5, 5, false], [60, 7, 4, false],
    ],
    chords: [
      [0, [0, 4, 7, 11], 8], [8, [0, 4, 7, 11], 8],
      [16, [0, 4, 7, 11], 8], [24, [0, 4, 7, 11], 8],
      [32, [2, 5, 9, 12], 8], [40, [2, 5, 9, 12], 8],
      [48, [0, 4, 7, 11], 8], [56, [0, 4, 7, 11], 8],
    ],
    lead: [
      [16, 19, 1.4], [20, 22, 1.4], [24, 26, 2.8],
      [40, 24, 1.4], [44, 22, 1.4], [48, 26, 2.8], [56, 24, 3.6],
    ],
  },

  house: {
    kick:  P('x...x...x...x...', 'x...x...x...x...', 'x...x...x...x...', 'x...x...x...x...'),
    snare: P('................', '................', '................', '................'),
    clap:  P('....x.......x...', '....x.......x...', '....x.......x...', '....x.......x...'),
    hat:   P('..x...x...x...x.', '..x...x...x...x.', '..x...x...x...x.', '..x...x...x.xxx.'),
    shaker:P('....x.......x...', '....x.......x...', '....x.......x...', '....x.......x...'),
    conga: P('........x.......', '........x.......', '........x.......', '........x.......'),
    rim:   P('................', '................', '................', '................'),
    bass: [
      [0, 0, 3, false], [4, 0, 2, false], [8, 0, 3, false], [12, 0, 2, false],
      [16, 0, 3, false], [20, 0, 2, false], [24, 0, 3, false], [28, 0, 2, false],
      [32, 3, 3, false], [36, 3, 2, false], [40, 3, 3, false], [44, 3, 2, false],
      [48, 5, 3, false], [52, 5, 2, false], [56, 5, 3, false], [60, 7, 4, false],
    ],
    chords: [
      [0, [0, 4, 7, 11], 14], [16, [0, 4, 7, 11], 14],
      [32, [2, 5, 9, 12], 14], [48, [0, 4, 7, 11], 15],
    ],
    lead: [
      [4, 12, 1], [12, 12, 1], [20, 12, 1], [28, 12, 1],
      [36, 15, 1], [44, 15, 1], [52, 19, 2], [56, 17, 2],
    ],
  },

  drill: {
    kick:  P('x.......x.......', 'x.......x.....x.', 'x.......x.......', 'x.......x.......'),
    snare: P('....x.......x...', '....x.......x...', '....x.......x...', '....x.......x.x.'),
    clap:  P('................', '................', '................', '................'),
    hat:   P('xxxxxxxxxxxxxxxx', 'xxxxxxxxxxxxxxxx', 'xxxxxxxxxxxxxxxx', 'xxxxxxxxxxxxxxxx'),
    shaker:P('..x...x...x...x.', '..x...x...x...x.', '..x...x...x...x.', '..x...x...x.xxx.'),
    conga: P('................', '................', '................', '................'),
    rim:   P('..............x.', '..............x.', '..............x.', '..............x.'),
    bass: [
      [0, 0, 2, true], [4, 0, 1, false], [8, 0, 4, true],
      [14, -2, 2, true],
      [16, 0, 2, true], [20, 0, 1, false], [24, 0, 4, true],
      [32, 0, 2, true], [36, 3, 1, false], [40, 0, 4, true],
      [48, 7, 3, true], [52, 5, 2, true], [56, 3, 4, true],
    ],
    chords: [
      [0, [0, 3, 7, 10], 14], [16, [0, 3, 7, 10], 14],
      [32, [0, 3, 7, 10], 14], [48, [0, 3, 7, 10], 15],
    ],
    lead: [],
  },
};

/* ============================================================ */
class PreviewEngine {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.bus = null;
    this.noise = null;
    this.beat = null;
    this.queue = [];
    this.step = 0;
    this.nextT = 0;
    this.timer = null;
    this.startedAt = 0;
    this.pausedAt = 0;
    this.playing = false;
    this.volume = 0.78;
    this.muted = false;
    this.onTick = null;
  }

  /* ---- lazy context (must follow a user gesture) ---- */
  ensure() {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const ctx = new AC();
    this.ctx = ctx;

    // master chain: gain -> soft-clip -> gentle glue comp -> analyser -> out
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : this.volume;

    const shaper = ctx.createWaveShaper();
    shaper.curve = this._softCurve(1.6);
    shaper.oversample = '2x';

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -15;
    comp.knee.value = 22;
    comp.ratio.value = 3.2;
    comp.attack.value = 0.006;
    comp.release.value = 0.22;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.72;

    // shared reverb send
    const verb = ctx.createConvolver();
    verb.buffer = this._ir(ctx, 1.9, 2.6);
    const verbGain = ctx.createGain();
    verbGain.gain.value = 0.2;

    master.connect(shaper);
    shaper.connect(comp);
    comp.connect(analyser);
    analyser.connect(ctx.destination);

    const send = ctx.createGain();
    send.gain.value = 1;
    send.connect(verb);
    verb.connect(verbGain);
    verbGain.connect(master);

    this.bus = master;
    this.analyser = analyser;
    this.sendBus = send;

    // white-noise buffer reused by every percussive voice
    const len = ctx.sampleRate * 2;
    const nb = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = nb.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
    this.noise = nb;

    return ctx;
  }

  _softCurve(k) {
    const n = 1024, c = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      c[i] = Math.tanh(x * k) / Math.tanh(k);
    }
    return c;
  }

  _ir(ctx, dur, decay) {
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * 0.6;
      }
    }
    return buf;
  }

  /* ---- voices ---- */
  _env(g, t, a, d, peak) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  _noiseSrc(t, dur) {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noise;
    s.loop = true;
    s.playbackRate.value = 1;
    s.start(t);
    s.stop(t + dur + 0.05);
    return s;
  }

  kick(t) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(168, t);
    o.frequency.exponentialRampToValueAtTime(44, t + 0.13);
    const g = ctx.createGain();
    this._env(g, t, 0.004, 0.3, 0.95);
    o.connect(g); g.connect(this.bus);
    o.start(t); o.stop(t + 0.36);

    const n = this._noiseSrc(t, 0.03);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 2600;
    const ng = ctx.createGain();
    this._env(ng, t, 0.001, 0.025, 0.16);
    n.connect(hp); hp.connect(ng); ng.connect(this.bus);
  }

  snare(t) {
    const ctx = this.ctx;
    const n = this._noiseSrc(t, 0.25);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1850; bp.Q.value = 0.85;
    const g = ctx.createGain();
    this._env(g, t, 0.002, 0.17, 0.5);
    n.connect(bp); bp.connect(g); g.connect(this.bus);
    const s = this.sendBus ? ctx.createGain() : null;
    if (s) { s.gain.value = 0.25; g.connect(s); s.connect(this.sendBus); }

    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(210, t);
    o.frequency.exponentialRampToValueAtTime(150, t + 0.08);
    const og = ctx.createGain();
    this._env(og, t, 0.002, 0.09, 0.3);
    o.connect(og); og.connect(this.bus);
    o.start(t); o.stop(t + 0.14);
  }

  clap(t) {
    const ctx = this.ctx;
    [0, 0.011, 0.023].forEach((d, i) => {
      const n = this._noiseSrc(t + d, 0.2);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 1350; bp.Q.value = 1.5;
      const g = ctx.createGain();
      this._env(g, t + d, 0.001, i === 2 ? 0.16 : 0.05, i === 2 ? 0.42 : 0.3);
      n.connect(bp); bp.connect(g); g.connect(this.bus);
    });
  }

  hat(t, v) {
    const ctx = this.ctx;
    const n = this._noiseSrc(t, 0.09);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 7600;
    const g = ctx.createGain();
    this._env(g, t, 0.001, 0.048, 0.14 * v);
    n.connect(hp); hp.connect(g); g.connect(this.bus);
  }

  shaker(t, v) {
    const ctx = this.ctx;
    const n = this._noiseSrc(t, 0.12);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 6200; bp.Q.value = 1.4;
    const g = ctx.createGain();
    this._env(g, t, 0.003, 0.07, 0.1 * v);
    n.connect(bp); bp.connect(g); g.connect(this.bus);
  }

  conga(t) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(400, t);
    o.frequency.exponentialRampToValueAtTime(260, t + 0.06);
    const g = ctx.createGain();
    this._env(g, t, 0.002, 0.13, 0.24);
    o.connect(g); g.connect(this.bus);
    o.start(t); o.stop(t + 0.18);
  }

  rim(t) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.value = 1700;
    const g = ctx.createGain();
    this._env(g, t, 0.001, 0.03, 0.07);
    o.connect(g); g.connect(this.bus);
    o.start(t); o.stop(t + 0.05);
  }

  bass808(t, midi, steps, slide) {
    const ctx = this.ctx;
    const f = mtof(midi);
    const o = ctx.createOscillator();
    o.type = 'sine';
    if (slide) {
      o.frequency.setValueAtTime(f * 0.42, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.11);
    } else {
      o.frequency.setValueAtTime(f, t);
    }
    const o2 = ctx.createOscillator();
    o2.type = 'triangle';
    o2.frequency.value = f * 2;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1100; lp.Q.value = 0.6;

    const g = ctx.createGain();
    const dur = Math.max(0.14, steps * this._stepDur()) * 0.92;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.014);
    g.gain.setValueAtTime(0.5, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    const o2g = ctx.createGain();
    o2g.gain.value = 0.1;

    o.connect(g); o2.connect(o2g); o2g.connect(g);
    g.connect(lp); lp.connect(this.bus);
    o.start(t); o2.start(t);
    o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }

  pad(t, root, ivs, steps) {
    const ctx = this.ctx;
    const dur = Math.max(0.4, steps * this._stepDur()) * 0.95;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(700, t);
    lp.frequency.linearRampToValueAtTime(1600, t + dur * 0.5);
    lp.frequency.linearRampToValueAtTime(800, t + dur);
    lp.Q.value = 0.7;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.075, t + 0.22);
    g.gain.setValueAtTime(0.075, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    lp.connect(g); g.connect(this.bus);
    const s = ctx.createGain();
    s.gain.value = 0.5; g.connect(s); s.connect(this.sendBus);

    ivs.forEach((iv, i) => {
      [-6, 0, 7].forEach((det) => {
        const o = ctx.createOscillator();
        o.type = i === ivs.length - 1 ? 'triangle' : 'sawtooth';
        o.frequency.value = mtof(root + 12 + iv);
        o.detune.value = det;
        o.connect(lp);
        o.start(t); o.stop(t + dur + 0.1);
      });
    });
  }

  pluck(t, midi, steps) {
    const ctx = this.ctx;
    const dur = Math.max(0.2, steps * this._stepDur());
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.value = mtof(midi + 12);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3200, t);
    lp.frequency.exponentialRampToValueAtTime(700, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.075, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(this.bus);
    const s = ctx.createGain();
    s.gain.value = 0.4; g.connect(s); s.connect(this.sendBus);
    o.start(t); o.stop(t + dur + 0.05);
  }

  /* ---- transport ---- */
  _stepDur() {
    return 60 / this.beat.bpm / 4;
  }

  get loopDuration() {
    return (60 / this.beat.bpm) * 16;
  }

  get position() {
    if (!this.playing) return this.pausedAt % this.loopDuration;
    return (this.ctx.currentTime - this.startedAt) % this.loopDuration;
  }

  play(beat) {
    const ctx = this.ensure();
    if (!ctx) return false;
    if (ctx.state === 'suspended') ctx.resume();
    if (this.beat && this.beat.id === beat.id && this.playing) {
      this.pause();
      return false;
    }
    if (!this.beat || this.beat.id !== beat.id) this.pausedAt = 0;
    this.beat = beat;
    this.startedAt = ctx.currentTime - this.pausedAt;
    this.step = Math.floor(this.pausedAt / this._stepDur()) % 64;
    this.nextT = ctx.currentTime + 0.05;
    this.playing = true;
    clearInterval(this.timer);
    this.timer = setInterval(() => this._schedule(), 25);
    this._schedule();
    return true;
  }

  pause() {
    if (!this.playing) return;
    this.pausedAt = this.position;
    this.playing = false;
    clearInterval(this.timer);
    this.timer = null;
  }

  stop() {
    this.pause();
    this.pausedAt = 0;
    this.step = 0;
  }

  toggle(beat) {
    return this.play(beat);
  }

  seek(sec) {
    this.pausedAt = Math.max(0, Math.min(this.loopDuration - 0.05, sec));
    if (this.playing) {
      this.startedAt = this.ctx.currentTime - this.pausedAt;
      this.step = Math.floor(this.pausedAt / this._stepDur()) % 64;
      this.nextT = this.ctx.currentTime + 0.02;
    }
  }

  setVolume(v) {
    this.volume = v;
    if (this.bus && !this.muted) {
      this.bus.gain.setTargetAtTime(v, this.ctx.currentTime, 0.02);
    }
  }

  setMuted(m) {
    this.muted = m;
    if (this.bus) {
      this.bus.gain.setTargetAtTime(m ? 0 : this.volume, this.ctx.currentTime, 0.02);
    }
  }

  /* ---- 16th-note lookahead scheduler ---- */
  _schedule() {
    if (!this.playing) return;
    const sd = this._stepDur();
    while (this.nextT < this.ctx.currentTime + 0.12) {
      this._fireStep(this.step, this.nextT);
      this.nextT += sd;
      this.step = (this.step + 1) % 64;
    }
  }

  _fireStep(s, t) {
    const b = this.beat;
    const pat = PATTERNS[b.pat] || PATTERNS.afrobeat;
    const c = (str, i) => str[i] === 'x';

    if (c(pat.kick, s)) this.kick(t);
    if (c(pat.snare, s)) this.snare(t);
    if (c(pat.clap, s)) this.clap(t);
    if (c(pat.hat, s)) this.hat(t, 0.7 + ((s * 7) % 5) / 10);
    if (c(pat.shaker, s)) this.shaker(t, 1);
    if (c(pat.conga, s)) this.conga(t);
    if (c(pat.rim, s)) this.rim(t);

    for (const [bs, semi, dur, slide] of pat.bass) {
      if (bs === s) this.bass808(t, b.root + semi, dur, slide);
    }
    for (const [bs, ivs, dur] of pat.chords) {
      if (bs === s) this.pad(t, b.root, ivs, dur);
    }
    for (const [bs, semi, dur] of pat.lead) {
      if (bs === s) this.pluck(t, b.root + semi, dur);
    }
  }

  /* analyser frames for the player canvas */
  levels(bars) {
    if (!this.analyser) return new Array(bars).fill(0);
    const buf = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(buf);
    const out = [];
    const usable = Math.floor(buf.length * 0.62);
    for (let i = 0; i < bars; i++) {
      const a = Math.floor((i / bars) * usable);
      const b2 = Math.max(a + 1, Math.floor(((i + 1) / bars) * usable));
      let sum = 0;
      for (let j = a; j < b2; j++) sum += buf[j];
      out.push(Math.min(1, sum / (b2 - a) / 190));
    }
    return out;
  }
}

window.PreviewEngine = PreviewEngine;
window.PATTERNS = PATTERNS;
