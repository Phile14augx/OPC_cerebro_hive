// ─────────────────────────────────────────────────────────────────────────────
// CerebroHive HeroEngine — Living AI Ecosystem Animation
// 9-scene 30-second orchestrated canvas engine → infinite ambient loop
// ─────────────────────────────────────────────────────────────────────────────

export type Phase =
  | 'INIT'       // 0–3s   : Particles awaken
  | 'NEURAL'     // 3–6s   : Neural connections form
  | 'STREAMS'    // 6–10s  : Intelligence streams
  | 'CORE'       // 10–14s : CerebroHive logo assembles
  | 'RINGS'      // 14–18s : Concentric data-sync rings
  | 'ECOSYSTEM'  // 18–22s : Service node ecosystem
  | 'DATASTREAM' // 22–25s : Floating holographic panels
  | 'PULSE'      // 25–28s : Core energy wave
  | 'TEXTREVEAL' // 28–30s : Text materializes
  | 'AMBIENT';   // 30s+   : Perpetual living state

// ─── Colour palette ───────────────────────────────────────────────────────────
export const C = {
  BLUE:   [0,   229, 255] as Triple,
  VIOLET: [123,  97, 255] as Triple,
  ORANGE: [255, 138,   0] as Triple,
  AMBER:  [255, 186,   0] as Triple,
  PINK:   [255,  46, 209] as Triple,
  WHITE:  [245, 247, 250] as Triple,
};

type Triple = [number, number, number];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rgba = (rgb: Triple, a: number) =>
  `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`;

const lerp  = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const ease  = (t: number) => t < .5 ? 2*t*t : -1+(4-2*t)*t;

const bezier3 = (t: number, p0: number, p1: number, p2: number, p3: number) => {
  const m = 1 - t;
  return m*m*m*p0 + 3*m*m*t*p1 + 3*m*t*t*p2 + t*t*t*p3;
};

// ─── Particle interfaces ──────────────────────────────────────────────────────
interface Micro   { x:number; y:number; vx:number; vy:number; sz:number; rgb:Triple; a:number; maxA:number; ph:number; ps:number; }
interface Node    { x:number; y:number; vx:number; vy:number; r:number;  rgb:Triple; a:number; ph:number; }
interface Stream  { t:number; spd:number; side:'L'|'R'; rgb:Triple; a:number; sz:number; }
interface SvcNode { x:number; y:number; label:string; sub:string; rgb:Triple; a:number; ph:number; scan:number; idx:number; }
interface Panel   { x:number; y:number; w:number; h:number; a:number; fo:number; fs:number; rot:number; rs:number; dep:number; }
interface Wave    { r:number; maxR:number; a:number; rgb:Triple; spd:number; alive:boolean; }

// ─────────────────────────────────────────────────────────────────────────────
export class HeroEngine {
  private ctx: CanvasRenderingContext2D;
  private W  = 0;
  private H  = 0;
  private t  = 0;        // seconds since start
  private T0 = 0;        // performance.now() at start
  private id = 0;
  private mobile = false;

  // Input
  private mx = -9999;
  private my = -9999;

  // Systems
  private micros:   Micro[]   = [];
  private nodes:    Node[]    = [];
  private streams:  Stream[]  = [];
  private svcs:     SvcNode[] = [];
  private panels:   Panel[]   = [];
  private waves:    Wave[]    = [];

  // Scene state
  private logoA        = 0;    // logo alpha 0→1
  private brainDash    = 0;    // circuit self-draw 0→1
  private hexProg      = new Array(7).fill(0);
  private rings        = [0, 0, 0] as [number,number,number];
  private corePulse    = 0;
  private pulseFired   = false;
  private ambientLoop  = false;

  // Callback — fires with progress 0→1 during text-reveal phase
  onReveal?: (p: number) => void;

  // ─── Constructor ────────────────────────────────────────────────────────────
  constructor(canvas: HTMLCanvasElement, onReveal?: (p: number) => void) {
    this.ctx      = canvas.getContext('2d')!;
    this.onReveal = onReveal;
    this.resize(canvas.width, canvas.height);
    this.build();
  }

  // ─── Public API ─────────────────────────────────────────────────────────────
  resize(w: number, h: number) {
    this.W = w; this.H = h;
    this.mobile = w < 768;
    this.positionSvcs();
  }

  setMouse(x: number, y: number) { this.mx = x; this.my = y; }

  start() {
    this.T0 = performance.now();
    this.id = requestAnimationFrame(this.tick);
  }

  stop() { cancelAnimationFrame(this.id); }

  // ─── Getters ────────────────────────────────────────────────────────────────
  private get cx() { return this.W / 2; }
  private get cy() { return this.H * 0.42; }

  // ─── Build all sub-systems ───────────────────────────────────────────────────
  private build() {
    this.buildMicros();
    this.buildNodes();
    this.buildSvcs();
    this.buildPanels();
    this.hexProg = new Array(7).fill(0);
  }

  private buildMicros() {
    const n = this.mobile ? 2500 : 12000;
    const pool: Triple[] = [C.BLUE, C.VIOLET, C.ORANGE, C.AMBER, C.PINK, C.BLUE, C.BLUE];
    this.micros = Array.from({ length: n }, () => {
      const rgb = pool[Math.floor(Math.random() * pool.length)];
      return {
        x: Math.random() * this.W,
        y: Math.random() * this.H,
        vx: (Math.random() - .5) * .35,
        vy: (Math.random() - .5) * .35,
        sz: Math.random() < .75 ? 1 : 1.5,
        rgb, a: 0,
        maxA: Math.random() * .35 + .04,
        ph: Math.random() * Math.PI * 2,
        ps: Math.random() * .02 + .005,
      };
    });
  }

  private buildNodes() {
    const n = this.mobile ? 55 : 110;
    const pool: Triple[] = [C.BLUE, C.BLUE, C.VIOLET, C.ORANGE, C.PINK];
    this.nodes = Array.from({ length: n }, () => {
      const rgb = pool[Math.floor(Math.random() * pool.length)];
      return {
        x: Math.random() * this.W,
        y: Math.random() * this.H,
        vx: (Math.random() - .5) * .22,
        vy: (Math.random() - .5) * .22,
        r: Math.random() * 2 + 1.5,
        rgb, a: 0,
        ph: Math.random() * Math.PI * 2,
      };
    });
  }

  private buildSvcs() {
    this.svcs = [
      { x:0, y:0, label:'AI AUTOMATION', sub:'Intelligent Workflows · Scalable Solutions', rgb:C.ORANGE, a:0, ph:0,           scan:0, idx:0 },
      { x:0, y:0, label:'AI CONSULTING',  sub:'Strategy. Transformation. Real Impact.',     rgb:C.BLUE,   a:0, ph:Math.PI*.5,  scan:0, idx:1 },
      { x:0, y:0, label:'AI EDUCATION',   sub:'Empowering Minds · Building AI Skills',      rgb:C.VIOLET, a:0, ph:Math.PI,     scan:0, idx:2 },
      { x:0, y:0, label:'AI AGENTS',      sub:'Autonomous. Adaptive. Always On.',            rgb:C.BLUE,   a:0, ph:Math.PI*1.5, scan:0, idx:3 },
    ];
    this.positionSvcs();
  }

  private positionSvcs() {
    if (!this.svcs.length) return;
    const sp = Math.min(this.W, this.H) * (this.mobile ? .32 : .38);
    const positions = [
      [this.cx - sp,  this.cy - sp * .6],
      [this.cx + sp,  this.cy - sp * .6],
      [this.cx - sp,  this.cy + sp * .6],
      [this.cx + sp,  this.cy + sp * .6],
    ];
    positions.forEach(([x, y], i) => {
      if (this.svcs[i]) { this.svcs[i].x = x; this.svcs[i].y = y; }
    });
  }

  private buildPanels() {
    const n = this.mobile ? 3 : 7;
    this.panels = Array.from({ length: n }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      return {
        x: this.cx + side * (this.W * .28 + Math.random() * this.W * .1),
        y: this.H * .15 + Math.random() * this.H * .6,
        w: 130 + Math.random() * 70,
        h:  75 + Math.random() * 55,
        a: 0,
        fo: Math.random() * Math.PI * 2,
        fs: .003 + Math.random() * .003,
        rot: (Math.random() - .5) * .12,
        rs:  (Math.random() - .5) * .0004,
        dep: Math.random(),
      };
    });
  }

  // ─── Tick ────────────────────────────────────────────────────────────────────
  private tick = (now: number) => {
    this.t = (now - this.T0) / 1000;
    this.update();
    this.render();
    this.id = requestAnimationFrame(this.tick);
  };

  // ─── Update ─────────────────────────────────────────────────────────────────
  private update() {
    const t = this.t;
    const mx = this.mx, my = this.my;

    // ── Micro-particles (Scene 1 awakening) ─────────────────────────────────
    const initP = clamp(t / 3, 0, 1);
    for (const p of this.micros) {
      p.ph += p.ps;
      const target = p.maxA * initP * (.8 + Math.sin(p.ph) * .2);
      p.a += (target - p.a) * .04;

      // Mouse magnetic pull
      const dx = mx - p.x, dy = my - p.y;
      const d  = Math.sqrt(dx*dx + dy*dy);
      if (d < 110 && d > 0) {
        const f = ((110 - d) / 110) * .018;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
      p.vx *= .985; p.vy *= .985;
      p.x  += p.vx;  p.y  += p.vy;
      if (p.x < 0) p.x = this.W; else if (p.x > this.W) p.x = 0;
      if (p.y < 0) p.y = this.H; else if (p.y > this.H) p.y = 0;
    }

    // ── Neural nodes (Scene 2) ───────────────────────────────────────────────
    const neuP = clamp((t - 3) / 3, 0, 1);
    for (const n of this.nodes) {
      n.ph += .018;
      const target = neuP * (.5 + Math.sin(n.ph) * .3);
      n.a += (target - n.a) * .04;
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0) n.x = this.W; else if (n.x > this.W) n.x = 0;
      if (n.y < 0) n.y = this.H; else if (n.y > this.H) n.y = 0;
    }

    // ── Intelligence streams (Scene 3) ───────────────────────────────────────
    if (t >= 6) {
      const sP = clamp((t - 6) / 4, 0, 1);
      const rate = Math.ceil(sP * (this.mobile ? 2 : 5));
      for (let i = 0; i < rate; i++) {
        this.spawnStream(Math.random() < .5 ? 'L' : 'R');
      }
    }
    // Ambient stream maintenance
    if (t >= 30 && Math.random() < .25) {
      this.spawnStream(Math.random() < .5 ? 'L' : 'R');
    }

    const maxStreams = this.mobile ? 600 : 2400;
    for (let i = this.streams.length - 1; i >= 0; i--) {
      const sp = this.streams[i];
      sp.t += sp.spd;
      if (sp.t > .88) sp.a *= .88;
      if (sp.t >= 1 || sp.a < .02) { this.streams.splice(i, 1); }
    }
    if (this.streams.length > maxStreams) this.streams.splice(0, 50);

    // ── Logo assembly (Scene 4) ──────────────────────────────────────────────
    if (t >= 10) {
      const cP = clamp((t - 10) / 4, 0, 1);
      this.logoA     = ease(cP);
      this.brainDash = cP;
      for (let i = 0; i < 7; i++) {
        this.hexProg[i] = ease(clamp((t - 10 - i * .18) / 1.8, 0, 1));
      }
    }

    // ── Rings (Scene 5) ──────────────────────────────────────────────────────
    if (t >= 14) {
      this.rings[0] += .006;
      this.rings[1] -= .003;
      this.rings[2] += .0015;
    }

    // ── Core glow pulse (always) ────────────────────────────────────────────
    this.corePulse += .028;

    // ── Service nodes (Scene 6) ──────────────────────────────────────────────
    if (t >= 18) {
      for (const sn of this.svcs) {
        const snStart = 18 + sn.idx * .45;
        sn.a    = ease(clamp((t - snStart) / 1.6, 0, 1));
        sn.ph  += .038;
        sn.scan += .055;
      }
    }

    // ── Panels (Scene 7) ─────────────────────────────────────────────────────
    if (t >= 22) {
      for (let i = 0; i < this.panels.length; i++) {
        const dp = this.panels[i];
        const target = Math.min(ease(clamp((t - 22 - i * .3) / 1.2, 0, 1)) * .55, .55);
        dp.a  += (target - dp.a) * .04;
        dp.fo += dp.fs;
        dp.rot += dp.rs;
      }
    }

    // ── Energy pulse (Scene 8) ──────────────────────────────────────────────
    if (t >= 25 && !this.pulseFired) {
      this.pulseFired = true;
      this.spawnWave(C.BLUE,   0);
      this.spawnWave(C.ORANGE, 320);
      this.spawnWave(C.VIOLET, 640);
    }
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const w = this.waves[i];
      w.r   += w.spd;
      w.a    = (1 - w.r / w.maxR) * .45;
      w.alive = w.r < w.maxR;
      if (!w.alive) this.waves.splice(i, 1);
    }

    // ── Text reveal (Scene 9) ────────────────────────────────────────────────
    if (t >= 28) {
      const rP = clamp((t - 28) / 2, 0, 1);
      this.onReveal?.(rP);
    }
  }

  private spawnStream(side: 'L' | 'R') {
    const isL = side === 'L';
    const rgb  = isL
      ? (Math.random() < .6 ? C.BLUE : C.VIOLET)
      : (Math.random() < .6 ? C.ORANGE : C.AMBER);
    this.streams.push({
      t: 0,
      spd: .003 + Math.random() * .0045,
      side,
      rgb,
      a: Math.random() * .7 + .3,
      sz: Math.random() * 2.5 + .5,
    });
  }

  private spawnWave(rgb: Triple, delayMs: number) {
    setTimeout(() => {
      this.waves.push({
        r: 0,
        maxR: Math.sqrt(this.W*this.W + this.H*this.H) * .9,
        a: .5,
        rgb,
        spd: 9,
        alive: true,
      });
    }, delayMs);
  }

  // Stream bezier evaluation (two independent spline paths)
  private evalStream(t: number, side: 'L' | 'R'): [number, number] {
    const wt = this.t; // world time for wave shape
    if (side === 'L') {
      const x = bezier3(t, -this.W*.05, this.W*.12, this.W*.32, this.cx);
      const y = bezier3(t,
        this.cy + Math.sin(t * Math.PI * 3 + wt * .6) * this.H * .28,
        this.cy - this.H * .12,
        this.cy + this.H * .06,
        this.cy
      );
      return [x, y];
    } else {
      const x = bezier3(t, this.W*1.05, this.W*.88, this.W*.68, this.cx);
      const y = bezier3(t,
        this.cy - Math.sin(t * Math.PI * 3 + wt * .6) * this.H * .28,
        this.cy + this.H * .12,
        this.cy - this.H * .06,
        this.cy
      );
      return [x, y];
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  private render() {
    const ctx = this.ctx;
    const W = this.W, H = this.H, cx = this.cx, cy = this.cy;

    // 1. Deep-space background
    ctx.fillStyle = '#080B14';
    ctx.fillRect(0, 0, W, H);
    const bg = ctx.createRadialGradient(cx, cy * .8, 0, cx, cy, W * .75);
    bg.addColorStop(0,   'rgba(14,20,48,0.85)');
    bg.addColorStop(.5,  'rgba(8,11,20,0.6)');
    bg.addColorStop(1,   'rgba(4,6,12,0.9)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 2. Hex grid
    this.rHexGrid();

    // 3. Micro-particles
    this.rMicros();

    // 4. Intelligence streams
    this.rStreams();

    // 5. Neural connections
    this.rConnections();

    // 6. Neural nodes
    this.rNodes();

    // 7. Core ambient glow (always present, intensifies with logo)
    this.rCoreGlow();

    // 8. Logo
    if (this.logoA > .01) this.rLogo();

    // 9. Rings
    if (this.t >= 14) this.rRings();

    // 10. Service ecosystem
    if (this.t >= 18) this.rEcosystem();

    // 11. Data panels
    if (this.t >= 22) this.rPanels();

    // 12. Energy waves
    this.rWaves();

    // 13. Mouse halo
    this.rMouseHalo();
  }

  // ── Hex grid ────────────────────────────────────────────────────────────────
  private rHexGrid() {
    const ctx = this.ctx;
    const sz = 42;
    const rh = sz * Math.sqrt(3);
    ctx.strokeStyle = 'rgba(0,229,255,0.022)';
    ctx.lineWidth = .5;
    ctx.beginPath();
    for (let row = -1; row * rh < this.H + rh; row++) {
      for (let col = -1; col * sz * 1.5 < this.W + sz; col++) {
        const x = col * sz * 1.5;
        const y = row * rh + (col % 2 === 0 ? 0 : rh / 2);
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          const px = x + sz * Math.cos(a);
          const py = y + sz * Math.sin(a);
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();
      }
    }
    ctx.stroke();
  }

  // ── Micro-particles ─────────────────────────────────────────────────────────
  private rMicros() {
    const ctx = this.ctx;
    for (const p of this.micros) {
      if (p.a < .005) continue;
      ctx.fillStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${p.a.toFixed(3)})`;
      ctx.fillRect(p.x - p.sz * .5, p.y - p.sz * .5, p.sz, p.sz);
    }
  }

  // ── Intelligence streams ─────────────────────────────────────────────────────
  private rStreams() {
    const ctx = this.ctx;
    for (const sp of this.streams) {
      if (sp.a < .01) continue;
      const [x, y] = this.evalStream(sp.t, sp.side);

      // Glow halo
      const glow = ctx.createRadialGradient(x, y, 0, x, y, sp.sz * 5);
      glow.addColorStop(0, rgba(sp.rgb, sp.a * .55));
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(x, y, sp.sz * 5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(x, y, sp.sz, 0, Math.PI * 2);
      ctx.fillStyle = rgba(sp.rgb, sp.a);
      ctx.fill();
    }
  }

  // ── Neural connections ───────────────────────────────────────────────────────
  private rConnections() {
    const ctx = this.ctx;
    const maxD = this.mobile ? 95 : 145;

    for (let i = 0; i < this.nodes.length; i++) {
      const a = this.nodes[i];
      if (a.a < .01) continue;
      for (let j = i + 1; j < this.nodes.length; j++) {
        const b = this.nodes[j];
        if (b.a < .01) continue;
        const dx = a.x - b.x, dy = a.y - b.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d >= maxD) continue;

        const str  = (1 - d / maxD);
        const alph = str * Math.min(a.a, b.a) * .45;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = rgba(a.rgb, alph * .5);
        ctx.lineWidth   = .5;
        ctx.stroke();

        // Travelling energy spark
        if (str > .55 && Math.random() < .015) {
          const bT = (this.t * .7) % 1;
          ctx.beginPath();
          ctx.arc(a.x + (b.x-a.x)*bT, a.y + (b.y-a.y)*bT, 1.5, 0, Math.PI*2);
          ctx.fillStyle = rgba(a.rgb, alph * 2.5);
          ctx.fill();
        }
      }
    }
  }

  // ── Neural nodes ─────────────────────────────────────────────────────────────
  private rNodes() {
    const ctx = this.ctx;
    for (const n of this.nodes) {
      if (n.a < .01) continue;
      const gr = n.r * 7;
      const g  = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, gr);
      g.addColorStop(0,   rgba(n.rgb, n.a * .9));
      g.addColorStop(.35, rgba(n.rgb, n.a * .3));
      g.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(n.x, n.y, gr, 0, Math.PI*2);
      ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
      ctx.fillStyle = rgba(n.rgb, n.a); ctx.fill();
    }
  }

  // ── Core ambient glow ────────────────────────────────────────────────────────
  private rCoreGlow() {
    const ctx = this.ctx;
    const p   = clamp(this.t / 3, 0, 1);
    const pulse = Math.sin(this.corePulse) * .025;
    const baseA = .04 * p + this.logoA * .09;
    const g = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, Math.min(this.W, this.H) * .5);
    g.addColorStop(0,   `rgba(0,229,255,${(baseA + pulse).toFixed(3)})`);
    g.addColorStop(.45, `rgba(123,97,255,${(baseA * .5).toFixed(3)})`);
    g.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.W, this.H);
  }

  // ── CerebroHive logo ─────────────────────────────────────────────────────────
  private rLogo() {
    const ctx = this.ctx;
    const sc  = Math.min(this.W, this.H) * (this.mobile ? .1 : .115);

    ctx.save();
    ctx.translate(this.cx, this.cy);
    ctx.globalAlpha = this.logoA;

    // — Left: brain circuit —
    this.rBrainCircuit(sc);

    // — Right: hive hexagons —
    this.rHiveHexes(sc);

    // — Divider line —
    ctx.strokeStyle = 'rgba(200,210,230,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -sc * 1.25);
    ctx.lineTo(0,  sc * 1.25);
    ctx.stroke();

    // — Logo aura —
    const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, sc * 3.2);
    const pulse = .07 + Math.sin(this.corePulse) * .025;
    aura.addColorStop(0,   `rgba(0,229,255,${pulse.toFixed(3)})`);
    aura.addColorStop(.4,  'rgba(123,97,255,0.035)');
    aura.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.globalAlpha = this.logoA;
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(0, 0, sc * 3.2, 0, Math.PI*2); ctx.fill();

    ctx.restore();
  }

  private rBrainCircuit(sc: number) {
    const ctx  = this.ctx;
    const dash = this.brainDash;

    ctx.save();
    // Clip to left half
    ctx.beginPath();
    ctx.rect(-sc * 2.5, -sc * 2.5, sc * 2.5, sc * 5);
    ctx.clip();

    // Brain silhouette outline — self-drawing via lineDash
    ctx.beginPath();
    ctx.moveTo(0, -sc * .92);
    ctx.bezierCurveTo(-sc*.28, -sc*1.12, -sc*1.02, -sc*1.0, -sc*1.02, -sc*.28);
    ctx.bezierCurveTo(-sc*1.12, sc*.12,  -sc*.92,  sc*.52,  -sc*.68, sc*.72);
    ctx.bezierCurveTo(-sc*.48,  sc*.9,   -sc*.22,  sc*.82,  0,       sc*.82);

    const approxLen = sc * 9;
    ctx.setLineDash([approxLen * dash, approxLen]);
    ctx.strokeStyle = 'rgba(0,229,255,0.92)';
    ctx.lineWidth   = 2;
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur  = 10;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur  = 0;

    // Circuit traces (self-drawing, staggered)
    const traces: [number,number][][] = [
      [[-sc*.82,-sc*.42],[-sc*.5,-sc*.42],[-sc*.5,-sc*.1],[-sc*.2,-sc*.1]],
      [[-sc*.92, sc*.04],[-sc*.58,sc*.04],[-sc*.58,sc*.35],[-sc*.3,sc*.35]],
      [[-sc*.75,-sc*.65],[-sc*.42,-sc*.65],[-sc*.42,-sc*.32]],
      [[-sc*.28, sc*.55],[-sc*.6, sc*.55],[-sc*.6,  sc*.72]],
      [[-sc*.65,-sc*.1], [-sc*.38,-sc*.1],[-sc*.38, sc*.18],[-sc*.12,sc*.18]],
    ];

    traces.forEach((trace, tidx) => {
      const tp = clamp(dash * 4 - tidx * .35, 0, 1);
      if (tp < .01) return;

      ctx.beginPath();
      ctx.moveTo(trace[0][0], trace[0][1]);
      const drawN = tp * trace.length;
      for (let i = 1; i < trace.length; i++) {
        if (i < drawN) {
          ctx.lineTo(trace[i][0], trace[i][1]);
        } else if (i - 1 < drawN) {
          const frac = drawN - (i - 1);
          ctx.lineTo(lerp(trace[i-1][0],trace[i][0],frac), lerp(trace[i-1][1],trace[i][1],frac));
        }
      }
      ctx.strokeStyle = 'rgba(0,229,255,0.55)';
      ctx.lineWidth   = .9;
      ctx.stroke();

      // Junction dots
      trace.forEach((pt, pi) => {
        if (pi / trace.length < tp) {
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], 2.2, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(0,229,255,0.85)';
          ctx.fill();
        }
      });
    });

    ctx.restore();
  }

  private rHiveHexes(sc: number) {
    const ctx = this.ctx;
    const hr  = sc * .33;
    const hh  = hr * Math.sqrt(3);

    // 7-hex honeycomb: center + 6 surrounding
    const offsets: [number,number][] = [
      [0, 0],
      [hr*1.5,  hh*.5], [hr*1.5, -hh*.5],
      [0,      -hh],
      [-hr*1.5, -hh*.5], [-hr*1.5, hh*.5],
      [0,       hh],
    ];

    offsets.forEach(([ox, oy], i) => {
      const prog = this.hexProg[i] || 0;
      if (prog < .01) return;
      const r     = hr * prog;
      const pulse = .7 + Math.sin(this.corePulse + i * .9) * .3;

      ctx.save();
      ctx.translate(ox, oy);

      ctx.beginPath();
      for (let j = 0; j < 6; j++) {
        const a  = (Math.PI/3) * j - Math.PI/6;
        if (j === 0) {
          ctx.moveTo(r * Math.cos(a), r * Math.sin(a));
        } else {
          ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
        }
      }
      ctx.closePath();

      // Fill
      const hfg = ctx.createRadialGradient(0,0,0,0,0,r);
      hfg.addColorStop(0, rgba(C.ORANGE, .18 * pulse * prog));
      hfg.addColorStop(1, rgba(C.AMBER,  .05 * prog));
      ctx.fillStyle = hfg; ctx.fill();

      // Stroke
      ctx.strokeStyle = rgba(C.ORANGE, .92 * pulse * prog);
      ctx.lineWidth   = 1.6;
      ctx.shadowColor = '#FF8A00';
      ctx.shadowBlur  = 10 * prog;
      ctx.stroke();
      ctx.shadowBlur  = 0;

      ctx.restore();
    });
  }

  // ── Rotating rings ───────────────────────────────────────────────────────────
  private rRings() {
    const ctx = this.ctx;
    const ringP = clamp((this.t - 14) / 2.5, 0, 1);
    const sc    = Math.min(this.W, this.H);

    const defs = [
      { rx: sc*.20, ry: sc*.112, ang: this.rings[0], rgb: C.BLUE,   a: .38*ringP, ticks: 8  },
      { rx: sc*.29, ry: sc*.162, ang: this.rings[1], rgb: C.VIOLET, a: .22*ringP, ticks: 12 },
      { rx: sc*.37, ry: sc*.207, ang: this.rings[2], rgb: C.ORANGE, a: .17*ringP, ticks: 6  },
    ];

    defs.forEach(ring => {
      ctx.save();
      ctx.translate(this.cx, this.cy);
      ctx.rotate(ring.ang);

      ctx.beginPath();
      ctx.ellipse(0, 0, ring.rx, ring.ry, 0, 0, Math.PI*2);
      ctx.strokeStyle = rgba(ring.rgb, ring.a);
      ctx.lineWidth   = .9;
      ctx.setLineDash([18, 12]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Bright tick markers
      for (let i = 0; i < ring.ticks; i++) {
        const a  = (Math.PI*2 / ring.ticks) * i;
        const tx = ring.rx * Math.cos(a);
        const ty = ring.ry * Math.sin(a);
        ctx.beginPath();
        ctx.arc(tx, ty, 2.8, 0, Math.PI*2);
        ctx.fillStyle = rgba(ring.rgb, ring.a * 2.8);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  // ── Service ecosystem ────────────────────────────────────────────────────────
  private rEcosystem() {
    const ctx = this.ctx;

    for (const sn of this.svcs) {
      if (sn.a < .01) continue;

      const dx = this.cx - sn.x;
      const dy = this.cy - sn.y;

      // Light beam to center
      const beam = ctx.createLinearGradient(sn.x, sn.y, this.cx, this.cy);
      beam.addColorStop(0,   rgba(sn.rgb, sn.a * .38));
      beam.addColorStop(.75, rgba(sn.rgb, sn.a * .1));
      beam.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.moveTo(sn.x, sn.y);
      ctx.lineTo(this.cx, this.cy);
      ctx.strokeStyle = beam;
      ctx.lineWidth   = 1.2;
      ctx.stroke();

      // Travelling spark along beam
      const bT = (this.t * .65 + sn.idx * .25) % 1;
      ctx.beginPath();
      ctx.arc(sn.x + dx*bT, sn.y + dy*bT, 2.5, 0, Math.PI*2);
      ctx.fillStyle = rgba(sn.rgb, sn.a * .9);
      ctx.fill();

      const nr    = 38;
      const pulse = .7 + Math.sin(sn.ph) * .3;

      // Outer pulse ring
      ctx.beginPath();
      ctx.arc(sn.x, sn.y, nr + 10 * pulse, 0, Math.PI*2);
      ctx.strokeStyle = rgba(sn.rgb, sn.a * .18 * pulse);
      ctx.lineWidth   = 10;
      ctx.stroke();

      // Node glow
      const ng = ctx.createRadialGradient(sn.x, sn.y, 0, sn.x, sn.y, nr);
      ng.addColorStop(0, rgba(sn.rgb, sn.a * .22));
      ng.addColorStop(1, rgba(sn.rgb, sn.a * .04));
      ctx.beginPath(); ctx.arc(sn.x, sn.y, nr, 0, Math.PI*2);
      ctx.fillStyle = ng; ctx.fill();

      // Node border
      ctx.beginPath(); ctx.arc(sn.x, sn.y, nr, 0, Math.PI*2);
      ctx.strokeStyle = rgba(sn.rgb, sn.a * .82);
      ctx.lineWidth   = 1.6; ctx.stroke();

      // Scanning arc (AI Agents = idx 3)
      if (sn.idx === 3) {
        ctx.save(); ctx.translate(sn.x, sn.y); ctx.rotate(sn.scan);
        ctx.beginPath();
        ctx.arc(0, 0, nr + 3, 0, Math.PI * .45);
        ctx.strokeStyle = rgba(sn.rgb, sn.a * .7);
        ctx.lineWidth   = 2.5; ctx.stroke();
        ctx.restore();
      }

      // Icon text
      ctx.save();
      ctx.translate(sn.x, sn.y);
      ctx.fillStyle    = rgba(sn.rgb, sn.a * .95);
      ctx.font         = `${Math.round(nr * .5)}px monospace`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      // Simple unicode icons
      const icons = ['⚡','◈','◉','◎'];
      ctx.fillText(icons[sn.idx], 0, 0);

      // Label
      ctx.font      = `bold ${Math.round(nr * .26)}px "Orbitron",monospace`;
      ctx.fillStyle = rgba(sn.rgb, sn.a * .92);
      ctx.fillText(sn.label, 0, nr + 16);

      ctx.font      = `${Math.round(nr * .22)}px "Exo 2",sans-serif`;
      ctx.fillStyle = rgba(C.WHITE, sn.a * .5);
      // wrap subtitle into max 24 chars per line
      ctx.fillText(sn.sub.slice(0, 32), 0, nr + 30);

      ctx.restore();
    }
  }

  // ── Data panels ──────────────────────────────────────────────────────────────
  private rPanels() {
    const ctx = this.ctx;

    for (const dp of this.panels) {
      if (dp.a < .01) continue;

      const fy = Math.sin(dp.fo) * 14;
      const x  = dp.x + (dp.dep - .5) * Math.sin(this.t * .08) * 6;
      const y  = dp.y + fy;

      ctx.save();
      ctx.translate(x + dp.w*.5, y + dp.h*.5);
      ctx.rotate(dp.rot);
      ctx.translate(-dp.w*.5, -dp.h*.5);

      // Glass card
      ctx.fillStyle   = `rgba(255,255,255,${(dp.a * .045).toFixed(3)})`;
      ctx.strokeStyle = `rgba(0,229,255,${(dp.a * .3).toFixed(3)})`;
      ctx.lineWidth   = .8;
      ctx.beginPath();
      ctx.roundRect(0, 0, dp.w, dp.h, 7);
      ctx.fill(); ctx.stroke();

      // Header strip
      ctx.fillStyle = `rgba(0,229,255,${(dp.a * .1).toFixed(3)})`;
      ctx.fillRect(0, 0, dp.w, 16);

      // Title dots
      [C.BLUE, C.ORANGE, C.VIOLET].forEach((c, ci) => {
        ctx.beginPath();
        ctx.arc(8 + ci*10, 8, 3, 0, Math.PI*2);
        ctx.fillStyle = rgba(c, dp.a * .7);
        ctx.fill();
      });

      // Fake data lines
      const lineRgbs: Triple[] = [C.BLUE, C.VIOLET, C.ORANGE];
      for (let li = 0; li < 3; li++) {
        const lw = (.35 + Math.sin(this.t * 1.2 + li) * .25) * (dp.w - 16);
        ctx.fillStyle = rgba(lineRgbs[li], dp.a * .45);
        ctx.fillRect(8, 24 + li * 14, Math.max(10, lw), 6);
      }

      // Mini bar chart
      for (let bi = 0; bi < 5; bi++) {
        const bh = 8 + Math.abs(Math.sin(this.t * 1.8 + bi * .7)) * 18;
        const bx = 8 + bi * 18;
        const by = dp.h - 10 - bh;
        const bc = bi % 2 === 0 ? C.BLUE : C.VIOLET;
        ctx.fillStyle = rgba(bc, dp.a * .55);
        ctx.fillRect(bx, by, 12, bh);
      }

      ctx.restore();
    }
  }

  // ── Energy waves ─────────────────────────────────────────────────────────────
  private rWaves() {
    const ctx = this.ctx;
    for (const w of this.waves) {
      if (w.a < .003) continue;
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, w.r, 0, Math.PI*2);
      ctx.strokeStyle = rgba(w.rgb, w.a);
      ctx.lineWidth   = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(this.cx, this.cy, w.r * .96, 0, Math.PI*2);
      ctx.strokeStyle = rgba(w.rgb, w.a * .4);
      ctx.lineWidth   = 7;
      ctx.stroke();
    }
  }

  // ── Mouse halo ───────────────────────────────────────────────────────────────
  private rMouseHalo() {
    if (this.mx < 0) return;
    const ctx  = this.ctx;
    const halo = ctx.createRadialGradient(this.mx, this.my, 0, this.mx, this.my, 90);
    halo.addColorStop(0, 'rgba(0,229,255,0.05)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(this.mx, this.my, 90, 0, Math.PI*2);
    ctx.fill();
  }
}
