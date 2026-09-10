import type {
  Background, BgStyle, DecoDepth, DecoLayer, DeviceKind, DeviceLayer, Mood, PosPreset,
  Project, ShadowPreset, SurpriseMode,
} from './types';
import {
  clamp, DEVICE_META, isDark, makeDevice, mulberry32, PALETTES, paletteToBg,
  pick, rngRange, textOn, uid,
} from './templates';
import { DECO_PRESETS } from './templates';
import { IMAGE_ASSETS } from './imageAssets';
import type { ThemeVariation } from './utils/colorExtraction';
import { ICONS } from './iconLibrary';

/* =========================================================================
   PROCEDURAL COMPOSITION ENGINE
   Reusable rules + constraints + seeded randomization → unlimited, always
   professional compositions. No AI, fully deterministic per seed.
   ========================================================================= */

/* ---------------- composition library (50+) ---------------- */
export interface Slot { k: DeviceKind; x: number; y: number; w: number; t?: number }
export interface Composition {
  id: string; label: string;
  cat: 'single' | 'duo' | 'trio' | 'quad' | 'multi' | 'special';
  tags: string[];
  slots: Slot[];
}
const C = (id: string, label: string, cat: Composition['cat'], tags: string[], slots: Slot[]): Composition =>
  ({ id, label, cat, tags, slots });

export const COMPOSITIONS: Composition[] = [
  /* single */
  C('hero', 'Center hero', 'single', ['minimal', 'premium', 'saas'], [{ k: 'laptop', x: 0.2, y: 0.18, w: 0.6 }]),
  C('hero-big', 'Large hero', 'single', ['premium', 'bold'], [{ k: 'laptop', x: 0.13, y: 0.14, w: 0.74 }]),
  C('hero-phone', 'Phone hero', 'single', ['mobile', 'minimal'], [{ k: 'phone', x: 0.41, y: 0.1, w: 0.18 }]),
  C('hero-tilt-l', 'Tilt left', 'single', ['creative'], [{ k: 'laptop', x: 0.2, y: 0.2, w: 0.6, t: -6 }]),
  C('hero-tilt-r', 'Tilt right', 'single', ['creative'], [{ k: 'laptop', x: 0.2, y: 0.2, w: 0.6, t: 6 }]),
  C('hero-bottom', 'Bottom anchored', 'single', ['editorial', 'minimal'], [{ k: 'laptop', x: 0.22, y: 0.3, w: 0.56 }]),
  C('hero-browser', 'Browser hero', 'single', ['saas', 'developer'], [{ k: 'browser', x: 0.17, y: 0.16, w: 0.66 }]),
  C('hero-monitor', 'Desktop hero', 'single', ['developer', 'dashboard'], [{ k: 'monitor', x: 0.24, y: 0.14, w: 0.52 }]),
  C('hero-tablet', 'Tablet hero', 'single', ['minimal'], [{ k: 'tablet', x: 0.35, y: 0.16, w: 0.3 }]),
  C('hero-float', 'Floating laptop', 'single', ['premium', 'creative'], [{ k: 'laptop', x: 0.21, y: 0.13, w: 0.58, t: -3 }]),
  C('side-hero-l', 'Left focus', 'single', ['editorial', 'asymmetric'], [{ k: 'laptop', x: 0.07, y: 0.2, w: 0.52 }]),
  C('side-hero-r', 'Right focus', 'single', ['editorial', 'asymmetric'], [{ k: 'laptop', x: 0.41, y: 0.2, w: 0.52 }]),

  /* duo */
  C('duo-lap-phone', 'Laptop + Phone', 'duo', ['responsive', 'saas'], [{ k: 'laptop', x: 0.09, y: 0.18, w: 0.58 }, { k: 'phone', x: 0.65, y: 0.3, w: 0.14 }]),
  C('duo-lap-tab', 'Laptop + Tablet', 'duo', ['responsive'], [{ k: 'laptop', x: 0.08, y: 0.17, w: 0.56 }, { k: 'tablet', x: 0.63, y: 0.3, w: 0.26 }]),
  C('duo-lap-browser', 'Laptop + Browser', 'duo', ['saas', 'developer'], [{ k: 'laptop', x: 0.07, y: 0.2, w: 0.52 }, { k: 'browser', x: 0.55, y: 0.14, w: 0.4, t: 3 }]),
  C('duo-phones', 'Two phones', 'duo', ['mobile', 'creative'], [{ k: 'phone', x: 0.27, y: 0.1, w: 0.18 }, { k: 'phone', x: 0.55, y: 0.2, w: 0.18, t: 4 }]),
  C('duo-phone-ui', 'Phone + UI card', 'duo', ['mobile', 'premium'], [{ k: 'phone', x: 0.14, y: 0.12, w: 0.19 }, { k: 'tablet', x: 0.5, y: 0.28, w: 0.3, t: -3 }]),
  C('duo-compare', 'Before / After', 'duo', ['comparison', 'saas'], [{ k: 'browser', x: 0.05, y: 0.22, w: 0.43 }, { k: 'browser', x: 0.52, y: 0.22, w: 0.43 }]),
  C('duo-desk-phone', 'Desktop + Phone', 'duo', ['responsive', 'dashboard'], [{ k: 'monitor', x: 0.07, y: 0.14, w: 0.55 }, { k: 'phone', x: 0.68, y: 0.3, w: 0.13 }]),
  C('duo-lap-lap', 'Laptop pair', 'duo', ['creative', 'comparison'], [{ k: 'laptop', x: 0.05, y: 0.24, w: 0.46, t: -4 }, { k: 'laptop', x: 0.5, y: 0.2, w: 0.46, t: 4 }]),
  C('duo-tab-tab', 'Tablet pair', 'duo', ['creative'], [{ k: 'tablet', x: 0.12, y: 0.2, w: 0.32, t: -5 }, { k: 'tablet', x: 0.56, y: 0.24, w: 0.32, t: 5 }]),

  /* trio */
  C('trio-responsive', 'Responsive trio', 'trio', ['responsive', 'portfolio'], [{ k: 'laptop', x: 0.06, y: 0.14, w: 0.55 }, { k: 'tablet', x: 0.57, y: 0.33, w: 0.26 }, { k: 'phone', x: 0.8, y: 0.38, w: 0.12 }]),
  C('trio-lap-2phone', 'Laptop + 2 phones', 'trio', ['responsive', 'mobile'], [{ k: 'laptop', x: 0.07, y: 0.16, w: 0.55 }, { k: 'phone', x: 0.63, y: 0.2, w: 0.14 }, { k: 'phone', x: 0.78, y: 0.3, w: 0.14, t: 5 }]),
  C('trio-pyramid', 'Device pyramid', 'trio', ['premium', 'symmetric'], [{ k: 'monitor', x: 0.3, y: 0.08, w: 0.4 }, { k: 'tablet', x: 0.12, y: 0.42, w: 0.26 }, { k: 'phone', x: 0.66, y: 0.4, w: 0.13 }]),
  C('trio-3phones', 'Three phones', 'trio', ['mobile', 'creative'], [{ k: 'phone', x: 0.18, y: 0.14, w: 0.16, t: -6 }, { k: 'phone', x: 0.42, y: 0.08, w: 0.17 }, { k: 'phone', x: 0.66, y: 0.14, w: 0.16, t: 6 }]),
  C('trio-arc', 'Phone arc', 'trio', ['mobile', 'creative'], [{ k: 'phone', x: 0.2, y: 0.22, w: 0.15, t: -9 }, { k: 'phone', x: 0.43, y: 0.12, w: 0.16 }, { k: 'phone', x: 0.66, y: 0.22, w: 0.15, t: 9 }]),
  C('trio-desk-lap-phone', 'Desktop ecosystem', 'trio', ['responsive', 'developer'], [{ k: 'monitor', x: 0.05, y: 0.1, w: 0.48 }, { k: 'laptop', x: 0.45, y: 0.34, w: 0.42, t: -4 }, { k: 'phone', x: 0.85, y: 0.4, w: 0.11 }]),
  C('trio-vertical', 'Vertical stack', 'trio', ['editorial', 'minimal'], [{ k: 'laptop', x: 0.3, y: 0.05, w: 0.4 }, { k: 'tablet', x: 0.36, y: 0.42, w: 0.28 }, { k: 'phone', x: 0.44, y: 0.78, w: 0.12 }]),
  C('trio-horizontal', 'Horizontal line', 'trio', ['minimal', 'symmetric'], [{ k: 'phone', x: 0.12, y: 0.3, w: 0.13 }, { k: 'laptop', x: 0.32, y: 0.28, w: 0.36 }, { k: 'phone', x: 0.75, y: 0.3, w: 0.13 }]),
  C('trio-overlap', 'Overlapping depth', 'trio', ['creative', 'premium'], [{ k: 'laptop', x: 0.12, y: 0.16, w: 0.52 }, { k: 'tablet', x: 0.55, y: 0.3, w: 0.27, t: -5 }, { k: 'phone', x: 0.74, y: 0.36, w: 0.13, t: 6 }]),

  /* quad */
  C('quad-lap-3phone', 'Laptop + 3 phones', 'quad', ['responsive', 'multi'], [{ k: 'laptop', x: 0.06, y: 0.16, w: 0.52 }, { k: 'phone', x: 0.6, y: 0.14, w: 0.12 }, { k: 'phone', x: 0.73, y: 0.22, w: 0.12 }, { k: 'phone', x: 0.86, y: 0.3, w: 0.12 }]),
  C('quad-ecosystem', 'Product ecosystem', 'quad', ['premium', 'multi'], [{ k: 'monitor', x: 0.06, y: 0.1, w: 0.44 }, { k: 'laptop', x: 0.44, y: 0.3, w: 0.4, t: -3 }, { k: 'tablet', x: 0.82, y: 0.36, w: 0.16 }, { k: 'phone', x: 0.05, y: 0.5, w: 0.1 }]),
  C('quad-grid', 'Device grid', 'quad', ['grid', 'multi'], [{ k: 'browser', x: 0.06, y: 0.1, w: 0.42 }, { k: 'browser', x: 0.52, y: 0.1, w: 0.42 }, { k: 'phone', x: 0.16, y: 0.55, w: 0.13 }, { k: 'phone', x: 0.68, y: 0.55, w: 0.13 }]),
  C('quad-arc', 'Four device arc', 'quad', ['creative', 'multi'], [{ k: 'phone', x: 0.1, y: 0.3, w: 0.12, t: -10 }, { k: 'tablet', x: 0.3, y: 0.18, w: 0.2, t: -4 }, { k: 'tablet', x: 0.55, y: 0.18, w: 0.2, t: 4 }, { k: 'phone', x: 0.79, y: 0.3, w: 0.12, t: 10 }]),
  C('quad-stack', 'Depth stack', 'quad', ['premium', 'layered'], [{ k: 'monitor', x: 0.2, y: 0.06, w: 0.5 }, { k: 'laptop', x: 0.28, y: 0.3, w: 0.44 }, { k: 'tablet', x: 0.62, y: 0.5, w: 0.22 }, { k: 'phone', x: 0.12, y: 0.52, w: 0.1 }]),

  /* multi / special */
  C('multi-wall', 'Device wall', 'multi', ['multi', 'showcase'], [{ k: 'browser', x: 0.04, y: 0.08, w: 0.3 }, { k: 'browser', x: 0.36, y: 0.08, w: 0.3 }, { k: 'browser', x: 0.68, y: 0.08, w: 0.28 }, { k: 'phone', x: 0.12, y: 0.5, w: 0.11 }, { k: 'tablet', x: 0.42, y: 0.48, w: 0.2 }, { k: 'phone', x: 0.76, y: 0.5, w: 0.11 }]),
  C('multi-showcase', 'Portfolio showcase', 'multi', ['portfolio', 'premium'], [{ k: 'laptop', x: 0.22, y: 0.1, w: 0.56 }, { k: 'phone', x: 0.08, y: 0.4, w: 0.12, t: -6 }, { k: 'phone', x: 0.8, y: 0.4, w: 0.12, t: 6 }]),
  C('bento', 'Bento grid', 'special', ['bento', 'modern'], [{ k: 'laptop', x: 0.05, y: 0.08, w: 0.55 }, { k: 'phone', x: 0.64, y: 0.08, w: 0.14 }, { k: 'tablet', x: 0.64, y: 0.45, w: 0.28 }, { k: 'browser', x: 0.05, y: 0.62, w: 0.5 }]),
  C('case-study', 'Case study', 'special', ['case-study', 'editorial'], [{ k: 'browser', x: 0.06, y: 0.12, w: 0.6 }, { k: 'phone', x: 0.72, y: 0.18, w: 0.15 }]),
  C('split', 'Split showcase', 'special', ['comparison', 'split'], [{ k: 'laptop', x: 0.05, y: 0.2, w: 0.42 }, { k: 'phone', x: 0.6, y: 0.16, w: 0.16 }]),
];

/* add generated grid/cascade families to push past 50 */
(function generatedCompositions() {
  const kinds: DeviceKind[] = ['phone', 'tablet', 'browser'];
  for (const k of kinds) {
    for (const n of [3, 4]) {
      const slots: Slot[] = [];
      const w = k === 'phone' ? 0.14 : k === 'tablet' ? 0.2 : 0.26;
      const gap = (0.92 - w * n) / (n - 1);
      for (let i = 0; i < n; i++) slots.push({ k, x: 0.04 + i * (w + gap), y: k === 'phone' ? 0.22 : 0.3, w });
      COMPOSITIONS.push(C(`gen-${k}-${n}`, `${n}× ${DEVICE_META[k].label} row`, 'multi', ['grid', 'multi', 'symmetric'], slots));
    }
  }
  // cascade (staggered diagonal)
  for (const k of ['phone', 'tablet'] as DeviceKind[]) {
    const slots: Slot[] = [];
    const w = k === 'phone' ? 0.15 : 0.22;
    for (let i = 0; i < 4; i++) slots.push({ k, x: 0.08 + i * 0.21, y: 0.12 + i * 0.15, w, t: i % 2 ? 4 : -4 });
    COMPOSITIONS.push(C(`gen-cascade-${k}`, `${DEVICE_META[k]} cascade`, 'multi', ['cascade', 'creative', 'diagonal'], slots));
  }
})();

/* ---------------- mood biases ---------------- */
interface MoodBias {
  palettes: number[];
  styles: BgStyle[];
  density: [number, number];
  maxTilt: number;
  shadows: ShadowPreset[];
  textPos: PosPreset[];
  preferMulti: boolean;
  decoCats: string[];
}
const ALL_PAL = PALETTES.map((_, i) => i);
const MOODS: Record<Mood, MoodBias> = {
  auto:       { palettes: ALL_PAL, styles: ['studio', 'abstract', 'plain', 'grid', 'editorial', 'tech', 'glass', 'architectural'], density: [0.3, 0.8], maxTilt: 8, shadows: ['soft', 'float', 'product', 'cinematic'], textPos: ['bottom-left', 'bottom-center', 'top-left'], preferMulti: false, decoCats: ['geometric', '3d', 'abstract', 'ui'] },
  minimal:    { palettes: [3, 4, 7, 10, 13, 15], styles: ['studio', 'plain', 'architectural'], density: [0.1, 0.3], maxTilt: 3, shadows: ['soft', 'product'], textPos: ['bottom-center', 'bottom-left'], preferMulti: false, decoCats: ['geometric'] },
  premium:    { palettes: [0, 5, 11, 12, 15], styles: ['studio', 'abstract', 'glass'], density: [0.3, 0.6], maxTilt: 6, shadows: ['float', 'cinematic', 'product'], textPos: ['bottom-left', 'bottom-right'], preferMulti: false, decoCats: ['3d', 'abstract'] },
  creative:   { palettes: [1, 8, 9, 12, 13], styles: ['abstract', 'glass', 'editorial'], density: [0.5, 1], maxTilt: 12, shadows: ['float', 'glow', 'long'], textPos: ['top-left', 'center-left'], preferMulti: true, decoCats: ['3d', 'abstract', 'ui'] },
  developer:  { palettes: [2, 6, 8, 14], styles: ['tech', 'grid'], density: [0.3, 0.7], maxTilt: 5, shadows: ['soft', 'product'], textPos: ['top-left', 'bottom-left'], preferMulti: false, decoCats: ['geometric', 'ui'] },
  dark:       { palettes: [0, 2, 5, 6, 8, 11, 12, 14], styles: ['studio', 'tech', 'abstract'], density: [0.3, 0.8], maxTilt: 8, shadows: ['float', 'cinematic', 'glow'], textPos: ['bottom-left', 'top-left'], preferMulti: false, decoCats: ['3d', 'abstract', 'geometric'] },
  light:      { palettes: [3, 4, 7, 10, 13, 15], styles: ['studio', 'plain', 'architectural', 'editorial'], density: [0.2, 0.6], maxTilt: 6, shadows: ['soft', 'product'], textPos: ['bottom-left', 'bottom-center'], preferMulti: false, decoCats: ['geometric', 'abstract'] },
  editorial:  { palettes: [4, 10, 13, 15], styles: ['editorial', 'architectural'], density: [0.2, 0.5], maxTilt: 4, shadows: ['soft', 'long'], textPos: ['top-left', 'bottom-left'], preferMulti: false, decoCats: ['geometric'] },
  bold:       { palettes: [0, 8, 9, 12], styles: ['abstract'], density: [0.5, 0.9], maxTilt: 10, shadows: ['hard', 'float', 'long'], textPos: ['center-left', 'bottom-left'], preferMulti: false, decoCats: ['3d', 'geometric'] },
  elegant:    { palettes: [5, 11, 15, 13], styles: ['studio', 'glass'], density: [0.2, 0.5], maxTilt: 5, shadows: ['float', 'cinematic'], textPos: ['bottom-right', 'bottom-center'], preferMulti: false, decoCats: ['abstract', '3d'] },
  futuristic: { palettes: [2, 12, 14, 8], styles: ['tech', 'glass'], density: [0.4, 0.8], maxTilt: 8, shadows: ['glow', 'float'], textPos: ['top-left', 'bottom-left'], preferMulti: false, decoCats: ['geometric', '3d'] },
  playful:    { palettes: [1, 7, 9, 10], styles: ['abstract', 'glass'], density: [0.5, 1], maxTilt: 12, shadows: ['float', 'glow'], textPos: ['top-center', 'bottom-center'], preferMulti: true, decoCats: ['3d', 'ui', 'abstract'] },
  corporate:  { palettes: [3, 4, 5, 12], styles: ['studio', 'plain', 'grid'], density: [0.2, 0.5], maxTilt: 4, shadows: ['soft', 'product'], textPos: ['bottom-left'], preferMulti: false, decoCats: ['geometric'] },
  luxury:     { palettes: [0, 5, 11, 15], styles: ['studio', 'glass'], density: [0.2, 0.4], maxTilt: 4, shadows: ['cinematic', 'float'], textPos: ['bottom-right', 'bottom-center'], preferMulti: false, decoCats: ['3d', 'abstract'] },
  impact:     { palettes: [0, 8, 9], styles: ['abstract', 'studio'], density: [0.6, 1.0], maxTilt: 12, shadows: ['hard', 'float'], textPos: ['center', 'center-left'], preferMulti: false, decoCats: ['geometric', '3d'] },
  technical:  { palettes: [2, 6, 8, 14], styles: ['tech', 'grid'], density: [0.3, 0.6], maxTilt: 5, shadows: ['soft', 'product'], textPos: ['top-left', 'bottom-left'], preferMulti: false, decoCats: ['geometric', 'ui'] },
};

/* ---------------- geometry helpers ---------------- */
export function deviceBox(d: DeviceLayer) {
  const h = d.w / DEVICE_META[d.kind].aspect;
  const pad = d.w * 0.04;
  return { x: d.x - pad, y: d.y - pad, w: d.w + pad * 2, h: h + pad * 2 };
}
function overlaps(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/* ---------------- decoration placement (constraint-aware, role-based) ---------------- */
export function placeDecos(p: Project, rnd: () => number, bias: MoodBias, count: number): DecoLayer[] {
  const boxes = p.devices.filter(d => d.visible).map(deviceBox);
  const { w: cw, h: ch } = p.canvas;
  
  // Role-based selection: pick diverse roles for professional composition
  const roles = ['frame', 'depth', 'structure', 'texture', 'motion', 'tech', 'luxury', 'soft'];
  const selectedRoles: string[] = [];
  
  // Always include at least 2 different roles for variety
  const minRoles = Math.min(3, count);
  while (selectedRoles.length < minRoles) {
    const role = pick(rnd, roles);
    if (!selectedRoles.includes(role)) selectedRoles.push(role);
  }
  
  // Fill remaining with random roles
  while (selectedRoles.length < count) {
    selectedRoles.push(pick(rnd, roles));
  }
  
  const out: DecoLayer[] = [];
  let attempts = 0;
  
  for (const role of selectedRoles) {
    if (attempts >= count * 30) break;
    
    // Get presets for this role
    const rolePresets = DECO_PRESETS.filter(d => d.role === role);
    if (rolePresets.length === 0) continue;
    
    const preset = pick(rnd, rolePresets);
    attempts++;
    
    // Position based on role
    let x: number, y: number;
    const corner = Math.floor(rnd() * 4);
    const m = 0.2;
    
    if (role === 'frame') {
      // Frames go near edges to frame devices
      if (corner === 0) { x = rngRange(rnd, 0.05, 0.15); y = rngRange(rnd, 0.1, 0.3); }
      else if (corner === 1) { x = rngRange(rnd, 0.85, 0.95); y = rngRange(rnd, 0.1, 0.3); }
      else if (corner === 2) { x = rngRange(rnd, 0.05, 0.15); y = rngRange(rnd, 0.7, 0.9); }
      else { x = rngRange(rnd, 0.85, 0.95); y = rngRange(rnd, 0.7, 0.9); }
    } else if (role === 'depth') {
      // Depth objects go behind devices
      x = rngRange(rnd, 0.1, 0.9);
      y = rngRange(rnd, 0.1, 0.9);
    } else if (role === 'texture') {
      // Textures spread across background
      x = rngRange(rnd, 0.05, 0.95);
      y = rngRange(rnd, 0.05, 0.95);
    } else {
      // Other roles go near edges
      if (corner === 0) { x = rngRange(rnd, 0.02, m); y = rngRange(rnd, 0.05, 0.95); }
      else if (corner === 1) { x = rngRange(rnd, 1 - m, 0.98); y = rngRange(rnd, 0.05, 0.95); }
      else if (corner === 2) { x = rngRange(rnd, 0.05, 0.95); y = rngRange(rnd, 0.02, m * 0.8); }
      else { x = rngRange(rnd, 0.05, 0.95); y = rngRange(rnd, 1 - m * 0.8, 0.98); }
    }
    
    // Scale based on role
    let scale: number;
    if (role === 'texture') scale = rngRange(rnd, 0.08, 0.15);
    else if (role === 'frame') scale = rngRange(rnd, 0.1, 0.18);
    else if (role === 'depth') scale = rngRange(rnd, 0.06, 0.12);
    else scale = rngRange(rnd, 0.05, 0.13);
    
    const r = scale * Math.min(cw, ch);
    const box = { x: x * cw - r, y: y * ch - r, w: r * 2, h: r * 2 };
    
    // Constraint: never cover devices (except for texture which can be subtle)
    if (role !== 'texture' && boxes.some(b => overlaps(box, b))) continue;
    
    out.push({
      id: uid(), preset: preset.id, x, y, scale,
      rotation: Math.floor(rngRange(rnd, -24, 24)),
      opacity: rngRange(rnd, 0.35, 0.85),
      blur: rnd() > 0.7 ? Math.floor(rngRange(rnd, 1, 5)) : 0,
      depth: (role === 'depth' ? 'back' : rnd() > 0.6 ? 'front' : 'back') as DecoDepth,
      hue: null, seed: Math.floor(rnd() * 1e9),
    });
  }
  
  return out;
}

/* ---------------- scoring ---------------- */
export interface DesignScore { total: number; balance: number; spacing: number; contrast: number; visibility: number }
export function scoreDesign(p: Project): DesignScore {
  const { w: cw, h: ch } = p.canvas;
  const boxes = p.devices.filter(d => d.visible).map(deviceBox);
  // balance: device mass center vs canvas center
  let bx = 0, by = 0, area = 0;
  for (const b of boxes) { const a = b.w * b.h; bx += (b.x + b.w / 2) * a; by += (b.y + b.h / 2) * a; area += a; }
  const cx = area ? bx / area : cw / 2, cy = area ? by / area : ch / 2;
  const off = Math.hypot(cx - cw / 2, cy - ch / 2) / Math.hypot(cw / 2, ch / 2);
  const balance = Math.round(clamp(1 - off * 1.4, 0, 1) * 100);
  // spacing: devices not colliding + reasonable margins
  let spacing = 100;
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    if (overlaps(boxes[i], boxes[j])) spacing -= 30;
  }
  for (const b of boxes) {
    if (b.x < -b.w * 0.3 || b.y < -b.h * 0.3 || b.x + b.w > cw + b.w * 0.3 || b.y + b.h > ch + b.h * 0.3) spacing -= 20;
  }
  spacing = Math.round(clamp(spacing, 0, 100));
  // contrast: text vs background
  const tc = p.text.autoColor ? textOn(p.background.c1) : p.text.color;
  const contrast = Math.round(Math.abs((parseInt(tc.slice(1), 16) & 0xff) - (parseInt(p.background.c1.slice(1), 16) & 0xff)) / 255 * 60 + 40);
  // visibility: negative space ratio in a healthy band
  const covered = boxes.reduce((s, b) => s + Math.min(b.w * b.h, cw * ch), 0) / (cw * ch);
  const vis = 1 - Math.abs(covered - 0.42) * 1.8;
  const visibility = Math.round(clamp(vis, 0, 1) * 100);
  const total = Math.round(balance * 0.3 + spacing * 0.3 + contrast * 0.15 + visibility * 0.25);
  return { total, balance, spacing, contrast, visibility };
}

/* ---------------- main generator ---------------- */
export interface GenOpts {
  mode: SurpriseMode;
  mood: Mood;
  seed: number;
  locks: { devices: boolean; background: boolean; decoration: boolean; text: boolean; logo: boolean };
  deviceCount?: number;
  bgType?: 'auto' | 'vector' | 'image' | 'hybrid';
  includeIcons?: boolean;
  iconCount?: number;
  includeDeco?: boolean;
  decoIntensity?: number;
  includeText?: boolean;
}

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
  const doIcons = opts.includeIcons !== false && opts.mode === 'all';

  /* palette / background */
  if (doBg) {
    const bgType = opts.bgType || 'auto';
    const useImage = bgType === 'image' || (bgType === 'auto' && rnd() > 0.5) || bgType === 'hybrid';
    
    if (useImage) {
      // Generate image background
      const compatibleImages = IMAGE_ASSETS.filter((img) => 
        img.mood.includes(opts.mood) || img.mood.includes('auto')
      );
      const selectedImage = compatibleImages.length > 0 
        ? pick(rnd, compatibleImages)
        : pick(rnd, IMAGE_ASSETS);
      
      const background: Background = {
        ...p.background,
        kind: 'image',
        image: {
          kind: 'image',
          imageId: selectedImage.id,
          customSrc: null,
          fit: 'cover',
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          opacity: 1,
          brightness: 1,
          contrast: 1,
          saturation: 1,
          blur: 0,
          hue: 0,
          colorFilter: 'original',
          tint: null,
          tintOpacity: 0,
          overlay: 'none',
          overlayColor: '#000000',
          overlayOpacity: 0,
          blend: 'source-over',
          mask: 'none',
        },
      };
      p = { ...p, background };
    } else {
      // Generate vector background
      const palIdx = pick(rnd, bias.palettes);
      const pal = PALETTES[palIdx];
      let style = pick(rnd, bias.styles);
      if (!style) style = 'studio';
      const background: Background = {
        ...paletteToBg(pal, Math.floor(rnd() * 1e9)),
        style,
        angle: pal.angle + Math.floor(rngRange(rnd, -18, 18)),
        meshPoints: 3 + Math.floor(rnd() * 4),
        light: { type: pal.light, intensity: rngRange(rnd, 0.4, 0.75) },
        pattern: rnd() > 0.6 ? pal.pattern : 'none',
        patternOpacity: pal.po,
      };
      p = { ...p, background, accents: { a1: pal.a1, a2: pal.a2 } };
    }
  }

  /* device arrangement */
  if (doDevices) {
    const usable = p.assets.length;
    let count = opts.deviceCount ?? clamp(usable || 1, 1, 4);
    if (bias.preferMulti) count = clamp(Math.max(count, 2), 2, 4);
    if (opts.mode === 'devices') count = clamp(usable || p.devices.length || 1, 1, 5);
    const pool = COMPOSITIONS.filter(c => c.slots.length === count);
    const fallback = COMPOSITIONS.filter(c => Math.abs(c.slots.length - count) <= 1);
    const comp = pick(rnd, pool.length ? pool : (fallback.length ? fallback : COMPOSITIONS));
    const assets = p.assets;
    p = {
      ...p,
      devices: comp.slots.map((s, i) => {
        const prev = p.devices[i];
        const d = makeDevice(s.k, cw, ch, assets[i % Math.max(1, assets.length)]?.id ?? null, i);
        return {
          ...d,
          x: s.x * cw, y: s.y * ch, w: s.w * cw,
          tilt: (s.t ?? 0) + Math.floor(rngRange(rnd, -bias.maxTilt / 2, bias.maxTilt / 2)),
          shadow: pick(rnd, bias.shadows),
          assetId: assets.length ? assets[i % assets.length].id : (prev?.assetId ?? null),
          color: prev?.color ?? d.color,
          z: i,
        };
      }),
    };
  }

  /* decorations */
  if (doDeco && opts.includeDeco !== false) {
    const intensity = (opts.decoIntensity ?? 50) / 100;
    const [lo, hi] = bias.density;
    const density = rngRange(rnd, lo, hi) * intensity;
    const count = Math.round(clamp(density * 9, 0, 10));
    p = { ...p, decos: placeDecos(p, rnd, bias, count), decoration: { ...p.decoration, density, set: 'none' } };
  }

  /* icons */
  if (doIcons) {
    const iconCount = opts.iconCount ?? 3;
    const icons: import('./types').IconLayer[] = [];
    const deviceBoxes = p.devices.filter(d => d.visible).map(deviceBox);
    
    // Place icons around devices
    for (let i = 0; i < iconCount; i++) {
      const iconDef = pick(rnd, ICONS);
      
      // Find a position near a device but not overlapping
      let x = 0, y = 0;
      let attempts = 0;
      let valid = false;
      
      while (!valid && attempts < 20) {
        attempts++;
        if (deviceBoxes.length > 0) {
          const device = pick(rnd, deviceBoxes);
          const side = Math.floor(rnd() * 4); // 0: top, 1: right, 2: bottom, 3: left
          const offset = 0.08 + rnd() * 0.06;
          
          if (side === 0) { x = device.x + device.w * (0.2 + rnd() * 0.6); y = device.y - device.h * offset; }
          else if (side === 1) { x = device.x + device.w + device.w * offset; y = device.y + device.h * (0.2 + rnd() * 0.6); }
          else if (side === 2) { x = device.x + device.w * (0.2 + rnd() * 0.6); y = device.y + device.h + device.h * offset; }
          else { x = device.x - device.w * offset; y = device.y + device.h * (0.2 + rnd() * 0.6); }
        } else {
          x = rnd() * cw;
          y = rnd() * ch;
        }
        
        // Check if position is valid (within canvas and not overlapping devices)
        const iconBox = { x: x - 20, y: y - 20, w: 40, h: 40 };
        valid = x > 0 && x < cw && y > 0 && y < ch && !deviceBoxes.some(db => overlaps(iconBox, db));
      }
      
      if (valid) {
        icons.push({
          id: uid(),
          iconId: iconDef.id,
          x: x / cw,
          y: y / ch,
          size: 0.06 + rnd() * 0.03,
          color: p.accents.a1,
          opacity: 0.7 + rnd() * 0.3,
          rotation: Math.floor(rnd() * 30 - 15),
          bgStyle: 'none',
          bgColor: null,
          shadow: false,
          glow: false,
        });
      }
    }
    
    p = { ...p, icons };
  }

  /* text & logo placement */
  if (doText && opts.includeText !== false && p.text.enabled) {
    const fontFamilies = ['space-grotesk', 'ibm-plex', 'system', 'mono', 'serif', 'rounded', 'playfair', 'roboto', 'open-sans', 'lato', 'montserrat', 'poppins', 'raleway', 'oswald', 'merriweather', 'source-code', 'fira-code', 'inter', 'work-sans', 'nunito-sans'];
    p = { 
      ...p, 
      text: { 
        ...p.text, 
        position: pick(rnd, bias.textPos),
        fontFamily: pick(rnd, fontFamilies),
      } 
    };
  }
  if (doLogo && p.logo.enabled) {
    const lp: PosPreset[] = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
    p = { ...p, logo: { ...p.logo, position: pick(rnd, lp) } };
  }

  p = { ...p, mood: opts.mood, updatedAt: Date.now() };
  return p;
}

/** Generate n scored variations of the base design (best-first). */
export function generateVariations(base: Project, n: number, mood: Mood, bgType?: 'vector' | 'image' | 'hybrid', themeVariations?: ThemeVariation[]): Project[] {
  const out: { p: Project; s: number }[] = [];
  const moods: Mood[] = ['auto', 'minimal', 'premium', 'creative', 'developer', 'dark', 'light', 'editorial', 'bold', 'elegant', 'futuristic', 'playful', 'corporate', 'luxury', 'impact', 'technical'];
  
  for (let i = 0; i < n; i++) {
    const seed = (Date.now() ^ (i + 1) * 2654435761 ^ Math.floor(Math.random() * 1e9)) >>> 0;
    
    // Determine background type for this variation
    let variationBgType: 'auto' | 'vector' | 'image' | 'hybrid' = 'auto';
    if (bgType === 'vector') variationBgType = 'vector';
    else if (bgType === 'image') variationBgType = 'image';
    else if (bgType === 'hybrid') variationBgType = 'hybrid';
    else {
      // Mix of types for variety
      const types: ('vector' | 'image' | 'hybrid')[] = ['vector', 'image', 'hybrid'];
      variationBgType = types[i % 3];
    }
    
    // Vary mood for each variation to get different font styles
    const variationMood = mood === 'auto' ? moods[i % moods.length] : mood;
    
    const p = generateDesign(base, { 
      mode: 'all', 
      mood: variationMood, 
      seed, 
      locks: { devices: false, background: false, decoration: false, text: false, logo: false },
      bgType: variationBgType,
      includeIcons: true,
      iconCount: 3 + (i % 5), // Vary icon count: 3-7
      includeDeco: true,
      decoIntensity: 40 + (i % 4) * 15, // Vary intensity: 40-85%
      includeText: true,
    });
    
    // Apply theme variation colors if available
    if (themeVariations && themeVariations.length > 0) {
      const themeVar = themeVariations[i % themeVariations.length];
      p.background = {
        ...p.background,
        c1: themeVar.background,
        c2: themeVar.accent,
      };
      p.accents = {
        a1: themeVar.accent,
        a2: themeVar.colors[0] || themeVar.accent,
      };
    }
    
    // Also vary text position for more variety
    const positions: Array<'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'> = 
      ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center'];
    p.text = { ...p.text, position: positions[i % positions.length] };
    
    out.push({ p, s: scoreDesign(p).total });
  }
  return out.sort((a, b) => b.s - a.s).map(x => x.p);
}

/* ---------------- responsive showcase ---------------- */
export function responsiveShowcase(p: Project, variant: number): Project {
  const rnd = mulberry32((variant * 7919 + 13) >>> 0);
  const { w: cw, h: ch } = p.canvas;
  const desktop = p.assets.find(a => a.w / a.h > 1.2);
  const tablet = p.assets.find(a => a.w / a.h >= 0.7 && a.w / a.h <= 1.2 && a !== desktop);
  const mobile = p.assets.find(a => a.w / a.h < 0.7);
  const pickAsset = (want: 'wide' | 'mid' | 'tall') => {
    if (want === 'wide') return desktop || p.assets[0];
    if (want === 'mid') return tablet || desktop || p.assets[0];
    return mobile || tablet || p.assets[0];
  };
  const comps = COMPOSITIONS.filter(c => ['trio-responsive', 'trio-vertical', 'trio-horizontal', 'trio-overlap', 'trio-pyramid'].includes(c.id));
  const comp = comps[variant % comps.length] || comps[0];
  const kinds: DeviceKind[] = ['laptop', 'tablet', 'phone'];
  void rnd;
  return {
    ...p,
    devices: comp.slots.slice(0, 3).map((s, i) => {
      const d = makeDevice(kinds[i] ?? s.k, cw, ch, null, i);
      const a = pickAsset(i === 0 ? 'wide' : i === 1 ? 'mid' : 'tall');
      return { ...d, x: s.x * cw, y: s.y * ch, w: s.w * cw, tilt: s.t ?? 0, assetId: a?.id ?? null, z: i };
    }),
    updatedAt: Date.now(),
  };
}

/* keep isDark referenced for tree-shaking friendliness */
export const _internals = { isDark };
