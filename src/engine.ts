import type { Background, BgStyle, DecoDepth, DecoLayer, DeviceKind, DeviceLayer, Mood, PosPreset, Project, ShadowPreset, SurpriseMode } from './types';
import { clamp, DEVICE_META, isDark, makeDevice, mulberry32, PALETTES, paletteToBg, pick, rngRange, textOn, uid, DECO_PRESETS } from './templates';

export interface Slot { k: DeviceKind; x: number; y: number; w: number; t?: number }
export interface Composition { id: string; label: string; cat: 'single' | 'duo' | 'trio' | 'quad' | 'multi' | 'special'; tags: string[]; slots: Slot[] }
const C = (id: string, label: string, cat: Composition['cat'], tags: string[], slots: Slot[]): Composition => ({ id, label, cat, tags, slots });

export const COMPOSITIONS: Composition[] = [
  C('hero', 'Center hero', 'single', ['minimal', 'premium'], [{ k: 'laptop', x: 0.2, y: 0.18, w: 0.6 }]),
  C('hero-big', 'Large hero', 'single', ['premium', 'bold'], [{ k: 'laptop', x: 0.13, y: 0.14, w: 0.74 }]),
  C('hero-phone', 'Phone hero', 'single', ['mobile', 'minimal'], [{ k: 'phone', x: 0.41, y: 0.1, w: 0.18 }]),
  C('duo-lap-phone', 'Laptop + Phone', 'duo', ['responsive', 'saas'], [{ k: 'laptop', x: 0.09, y: 0.18, w: 0.58 }, { k: 'phone', x: 0.65, y: 0.3, w: 0.14 }]),
  C('trio-responsive', 'Responsive trio', 'trio', ['responsive', 'portfolio'], [{ k: 'laptop', x: 0.06, y: 0.14, w: 0.55 }, { k: 'tablet', x: 0.57, y: 0.33, w: 0.26 }, { k: 'phone', x: 0.8, y: 0.38, w: 0.12 }]),
  C('quad-grid', 'Device grid', 'quad', ['grid', 'multi'], [{ k: 'browser', x: 0.06, y: 0.1, w: 0.42 }, { k: 'browser', x: 0.52, y: 0.1, w: 0.42 }, { k: 'phone', x: 0.16, y: 0.55, w: 0.13 }, { k: 'phone', x: 0.68, y: 0.55, w: 0.13 }]),
  C('multi-wall', 'Device wall', 'multi', ['multi', 'showcase'], [{ k: 'browser', x: 0.04, y: 0.08, w: 0.3 }, { k: 'browser', x: 0.36, y: 0.08, w: 0.3 }, { k: 'browser', x: 0.68, y: 0.08, w: 0.28 }, { k: 'phone', x: 0.12, y: 0.5, w: 0.11 }, { k: 'tablet', x: 0.42, y: 0.48, w: 0.2 }, { k: 'phone', x: 0.76, y: 0.5, w: 0.11 }]),
];

interface MoodBias { palettes: number[]; styles: BgStyle[]; density: [number, number]; maxTilt: number; shadows: ShadowPreset[]; textPos: PosPreset[]; preferMulti: boolean; decoCats: string[] }
const ALL_PAL = PALETTES.map((_: unknown, i: number) => i);
const MOODS: Record<Mood, MoodBias> = {
  auto: { palettes: ALL_PAL, styles: ['studio', 'abstract', 'plain', 'grid', 'editorial', 'tech', 'glass', 'architectural'], density: [0.3, 0.8], maxTilt: 8, shadows: ['soft', 'float', 'product', 'cinematic'], textPos: ['bottom-left', 'bottom-center', 'top-left'], preferMulti: false, decoCats: ['geometric', '3d', 'abstract', 'ui'] },
  minimal: { palettes: [3, 4, 5], styles: ['studio', 'plain', 'architectural'], density: [0.1, 0.3], maxTilt: 3, shadows: ['soft', 'product'], textPos: ['bottom-center', 'bottom-left'], preferMulti: false, decoCats: ['geometric'] },
  premium: { palettes: [0, 5], styles: ['studio', 'abstract', 'glass'], density: [0.3, 0.6], maxTilt: 6, shadows: ['float', 'cinematic', 'product'], textPos: ['bottom-left', 'bottom-right'], preferMulti: false, decoCats: ['3d', 'abstract'] },
  creative: { palettes: [1, 5], styles: ['abstract', 'glass', 'editorial'], density: [0.5, 1], maxTilt: 12, shadows: ['float', 'glow', 'long'], textPos: ['top-left', 'center-left'], preferMulti: true, decoCats: ['3d', 'abstract', 'ui'] },
  developer: { palettes: [2, 5], styles: ['tech', 'grid'], density: [0.3, 0.7], maxTilt: 5, shadows: ['soft', 'product'], textPos: ['top-left', 'bottom-left'], preferMulti: false, decoCats: ['geometric', 'ui'] },
  dark: { palettes: [0, 2, 5], styles: ['studio', 'tech', 'abstract'], density: [0.3, 0.8], maxTilt: 8, shadows: ['float', 'cinematic', 'glow'], textPos: ['bottom-left', 'top-left'], preferMulti: false, decoCats: ['3d', 'abstract', 'geometric'] },
  light: { palettes: [3, 4, 5], styles: ['studio', 'plain', 'architectural', 'editorial'], density: [0.2, 0.6], maxTilt: 6, shadows: ['soft', 'product'], textPos: ['bottom-left', 'bottom-center'], preferMulti: false, decoCats: ['geometric', 'abstract'] },
  editorial: { palettes: [4, 5], styles: ['editorial', 'architectural'], density: [0.2, 0.5], maxTilt: 4, shadows: ['soft', 'long'], textPos: ['top-left', 'bottom-left'], preferMulti: false, decoCats: ['geometric'] },
  bold: { palettes: [0, 5], styles: ['abstract'], density: [0.5, 0.9], maxTilt: 10, shadows: ['hard', 'float', 'long'], textPos: ['center-left', 'bottom-left'], preferMulti: false, decoCats: ['3d', 'geometric'] },
  elegant: { palettes: [5], styles: ['studio', 'glass'], density: [0.2, 0.5], maxTilt: 5, shadows: ['float', 'cinematic'], textPos: ['bottom-right', 'bottom-center'], preferMulti: false, decoCats: ['abstract', '3d'] },
  futuristic: { palettes: [2, 5], styles: ['tech', 'glass'], density: [0.4, 0.8], maxTilt: 8, shadows: ['glow', 'float'], textPos: ['top-left', 'bottom-left'], preferMulti: false, decoCats: ['geometric', '3d'] },
  playful: { palettes: [1, 5], styles: ['abstract', 'glass'], density: [0.5, 1], maxTilt: 12, shadows: ['float', 'glow'], textPos: ['top-center', 'bottom-center'], preferMulti: true, decoCats: ['3d', 'ui', 'abstract'] },
  corporate: { palettes: [3, 4, 5], styles: ['studio', 'plain', 'grid'], density: [0.2, 0.5], maxTilt: 4, shadows: ['soft', 'product'], textPos: ['bottom-left'], preferMulti: false, decoCats: ['geometric'] },
  luxury: { palettes: [0, 5], styles: ['studio', 'glass'], density: [0.2, 0.4], maxTilt: 4, shadows: ['cinematic', 'float'], textPos: ['bottom-right', 'bottom-center'], preferMulti: false, decoCats: ['3d', 'abstract'] },
  impact: { palettes: [0, 5], styles: ['abstract', 'studio'], density: [0.6, 1.0], maxTilt: 12, shadows: ['hard', 'float'], textPos: ['center', 'center-left'], preferMulti: false, decoCats: ['geometric', '3d'] },
  technical: { palettes: [2, 5], styles: ['tech', 'grid'], density: [0.3, 0.6], maxTilt: 5, shadows: ['soft', 'product'], textPos: ['top-left', 'bottom-left'], preferMulti: false, decoCats: ['geometric', 'ui'] },
};

export function deviceBox(d: DeviceLayer) {
  const h = d.w / DEVICE_META[d.kind].aspect;
  const pad = d.w * 0.04;
  return { x: d.x - pad, y: d.y - pad, w: d.w + pad * 2, h: h + pad * 2 };
}

function overlaps(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function placeDecos(p: Project, rnd: () => number, bias: MoodBias, count: number): DecoLayer[] {
  const boxes = p.devices.filter(d => d.visible).map(deviceBox);
  const { w: cw, h: ch } = p.canvas;
  const pool = DECO_PRESETS.filter(d => bias.decoCats.includes(d.cat));
  const out: DecoLayer[] = [];
  let attempts = 0;
  while (out.length < count && attempts < count * 30) {
    attempts++;
    const preset = pick(rnd, pool.length ? pool : DECO_PRESETS);
    const corner = Math.floor(rnd() * 4);
    const m = 0.2;
    let x: number, y: number;
    if (corner === 0) { x = rngRange(rnd, 0.02, m); y = rngRange(rnd, 0.05, 0.95); }
    else if (corner === 1) { x = rngRange(rnd, 1 - m, 0.98); y = rngRange(rnd, 0.05, 0.95); }
    else if (corner === 2) { x = rngRange(rnd, 0.05, 0.95); y = rngRange(rnd, 0.02, m * 0.8); }
    else { x = rngRange(rnd, 0.05, 0.95); y = rngRange(rnd, 1 - m * 0.8, 0.98); }
    const scale = rngRange(rnd, 0.04, 0.13);
    const r = scale * Math.min(cw, ch);
    const box = { x: x * cw - r, y: y * ch - r, w: r * 2, h: r * 2 };
    if (boxes.some(b => overlaps(box, b))) continue;
    out.push({ id: uid(), preset: preset.id, x, y, scale, rotation: Math.floor(rngRange(rnd, -24, 24)), opacity: rngRange(rnd, 0.35, 0.85), blur: rnd() > 0.7 ? Math.floor(rngRange(rnd, 1, 5)) : 0, depth: (rnd() > 0.6 ? 'front' : 'back') as DecoDepth, hue: null, seed: Math.floor(rnd() * 1e9) });
  }
  return out;
}

export interface DesignScore { total: number; balance: number; spacing: number; contrast: number; visibility: number }
export function scoreDesign(p: Project): DesignScore {
  const { w: cw, h: ch } = p.canvas;
  const boxes = p.devices.filter(d => d.visible).map(deviceBox);
  let bx = 0, by = 0, area = 0;
  for (const b of boxes) { const a = b.w * b.h; bx += (b.x + b.w / 2) * a; by += (b.y + b.h / 2) * a; area += a; }
  const cx = area ? bx / area : cw / 2, cy = area ? by / area : ch / 2;
  const off = Math.hypot(cx - cw / 2, cy - ch / 2) / Math.hypot(cw / 2, ch / 2);
  const balance = Math.round(clamp(1 - off * 1.4, 0, 1) * 100);
  let spacing = 100;
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    if (overlaps(boxes[i], boxes[j])) spacing -= 30;
  }
  spacing = Math.round(clamp(spacing, 0, 100));
  const tc = p.text.autoColor ? textOn(p.background.c1) : p.text.color;
  const contrast = Math.round(Math.abs((parseInt(tc.slice(1), 16) & 0xff) - (parseInt(p.background.c1.slice(1), 16) & 0xff)) / 255 * 60 + 40);
  const covered = boxes.reduce((s, b) => s + Math.min(b.w * b.h, cw * ch), 0) / (cw * ch);
  const vis = 1 - Math.abs(covered - 0.42) * 1.8;
  const visibility = Math.round(clamp(vis, 0, 1) * 100);
  const total = Math.round(balance * 0.3 + spacing * 0.3 + contrast * 0.15 + visibility * 0.25);
  return { total, balance, spacing, contrast, visibility };
}

export interface GenOpts { mode: SurpriseMode; mood: Mood; seed: number; locks: { devices: boolean; background: boolean; decoration: boolean; text: boolean; logo: boolean }; deviceCount?: number }

export function generateDesign(base: Project, opts: GenOpts): Project {
  const rnd = mulberry32(opts.seed >>> 0);
  const bias = MOODS[opts.mood] || MOODS.auto;
  let p: Project = JSON.parse(JSON.stringify({ ...base, thumbnail: null }));
  const { w: cw, h: ch } = p.canvas;
  const doDevices = !opts.locks.devices && (opts.mode === 'all' || opts.mode === 'layout' || opts.mode === 'devices');
  const doBg = !opts.locks.background && (opts.mode === 'all' || opts.mode === 'background' || opts.mode === 'colors');
  const doDeco = !opts.locks.decoration && (opts.mode === 'all' || opts.mode === 'decor');
  const doText = !opts.locks.text && opts.mode === 'all';
  const doLogo = !opts.locks.logo && opts.mode === 'all';
  if (doBg) {
    const palIdx = pick(rnd, bias.palettes);
    const pal = PALETTES[palIdx];
    let style = pick(rnd, bias.styles);
    if (!style) style = 'studio';
    const background: Background = { ...paletteToBg(pal, Math.floor(rnd() * 1e9)), style, angle: pal.angle + Math.floor(rngRange(rnd, -18, 18)), meshPoints: 3 + Math.floor(rnd() * 4), light: { type: pal.light, intensity: rngRange(rnd, 0.4, 0.75) }, pattern: rnd() > 0.6 ? pal.pattern : 'none', patternOpacity: pal.po };
    p = { ...p, background, accents: { a1: pal.a1, a2: pal.a2 } };
  }
  if (doDevices) {
    const usable = p.assets.length;
    let count = opts.deviceCount ?? clamp(usable || 1, 1, 4);
    if (bias.preferMulti) count = clamp(Math.max(count, 2), 2, 4);
    const pool = COMPOSITIONS.filter(c => c.slots.length === count);
    const fallback = COMPOSITIONS.filter(c => Math.abs(c.slots.length - count) <= 1);
    const comp = pick(rnd, pool.length ? pool : (fallback.length ? fallback : COMPOSITIONS));
    const assets = p.assets;
    p = { ...p, devices: comp.slots.map((s, i) => { const prev = p.devices[i]; const d = makeDevice(s.k, cw, ch, assets[i % Math.max(1, assets.length)]?.id ?? null, i); return { ...d, x: s.x * cw, y: s.y * ch, w: s.w * cw, tilt: (s.t ?? 0) + Math.floor(rngRange(rnd, -bias.maxTilt / 2, bias.maxTilt / 2)), shadow: pick(rnd, bias.shadows), assetId: assets.length ? assets[i % assets.length].id : (prev?.assetId ?? null), color: prev?.color ?? d.color, z: i }; }) };
  }
  if (doDeco) {
    const [lo, hi] = bias.density;
    const density = rngRange(rnd, lo, hi);
    const count = Math.round(clamp(density * 9, 0, 10));
    p = { ...p, decos: placeDecos(p, rnd, bias, count), decoration: { ...p.decoration, density, set: 'none' } };
  }
  if (doText && p.text.enabled) p = { ...p, text: { ...p.text, position: pick(rnd, bias.textPos) } };
  if (doLogo && p.logo.enabled) { const lp: PosPreset[] = ['top-right', 'top-left', 'bottom-right', 'bottom-left']; p = { ...p, logo: { ...p.logo, position: pick(rnd, lp) } }; }
  p = { ...p, mood: opts.mood, updatedAt: Date.now() };
  return p;
}

export function generateVariations(base: Project, n: number, mood: Mood): Project[] {
  const out: { p: Project; s: number }[] = [];
  for (let i = 0; i < n; i++) {
    const seed = (Date.now() ^ (i + 1) * 2654435761 ^ Math.floor(Math.random() * 1e9)) >>> 0;
    const p = generateDesign(base, { mode: 'all', mood, seed, locks: { devices: false, background: false, decoration: false, text: false, logo: false } });
    out.push({ p, s: scoreDesign(p).total });
  }
  return out.sort((a, b) => b.s - a.s).map(x => x.p);
}

export function responsiveShowcase(p: Project, variant: number): Project {
  const { w: cw, h: ch } = p.canvas;
  const desktop = p.assets.find(a => a.w / a.h > 1.2);
  const tablet = p.assets.find(a => a.w / a.h >= 0.7 && a.w / a.h <= 1.2 && a !== desktop);
  const mobile = p.assets.find(a => a.w / a.h < 0.7);
  const pickAsset = (want: 'wide' | 'mid' | 'tall') => { if (want === 'wide') return desktop || p.assets[0]; if (want === 'mid') return tablet || desktop || p.assets[0]; return mobile || tablet || p.assets[0]; };
  const comps = COMPOSITIONS.filter(c => c.cat === 'trio');
  const comp = comps[variant % comps.length] || comps[0];
  const kinds: DeviceKind[] = ['laptop', 'tablet', 'phone'];
  return { ...p, devices: comp.slots.slice(0, 3).map((s, i) => { const d = makeDevice(kinds[i] ?? s.k, cw, ch, null, i); const a = pickAsset(i === 0 ? 'wide' : i === 1 ? 'mid' : 'tall'); return { ...d, x: s.x * cw, y: s.y * ch, w: s.w * cw, tilt: s.t ?? 0, assetId: a?.id ?? null, z: i }; }), updatedAt: Date.now() };
}

export const _internals = { isDark };
