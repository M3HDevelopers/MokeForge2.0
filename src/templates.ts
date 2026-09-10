import type {
  Asset, Background, BgStyle, BgType, DecoCat, DecoLayer, DecoPrim, DecoSet, DecoShape,
  DeviceKind, DeviceLayer, FitMode, LightType, Material, Mood, PatternKind, PosPreset,
  Project, ScreenRect, ShadowPreset, TextBlock,
} from './types';

/* ---------------- utils ---------------- */
export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = <T,>(r: () => number, a: T[]): T => a[Math.floor(r() * a.length)];
export const rngRange = (r: () => number, min: number, max: number) => min + r() * (max - min);

export function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)); }

export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const c = (v: number) => clamp(Math.round(v + amt), 0, 255);
  const r = c((n >> 16) & 255), g = c((n >> 8) & 255), b = c(n & 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function rgba(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
export const isDark = (hex: string) => luminance(hex) < 0.5;
export const textOn = (hex: string) => (luminance(hex) > 0.56 ? '#15171c' : '#f2f0ea');

/* ---------------- devices ---------------- */
export const DEVICE_META: Record<DeviceKind, { label: string; aspect: number; defFw: number; colors: { name: string; hex: string }[] }> = {
  laptop:  { label: 'Laptop',  aspect: 1.56, defFw: 0.62, colors: [
    { name: 'Graphite', hex: '#33363c' }, { name: 'Silver', hex: '#d8dade' }, { name: 'Midnight', hex: '#20242c' }, { name: 'Sand', hex: '#c9b8a3' }] },
  phone:   { label: 'Phone',   aspect: 0.485, defFw: 0.16, colors: [
    { name: 'Black', hex: '#1a1c20' }, { name: 'Silver', hex: '#dfe1e6' }, { name: 'Gold', hex: '#e3cfa8' }, { name: 'Deep Blue', hex: '#2e4057' }, { name: 'Forest', hex: '#2f4a3e' }] },
  tablet:  { label: 'Tablet',  aspect: 1.38, defFw: 0.30, colors: [
    { name: 'Space Gray', hex: '#33363c' }, { name: 'Silver', hex: '#dcdfe4' }, { name: 'Slate Blue', hex: '#3d4a5c' }] },
  browser: { label: 'Browser', aspect: 1.47, defFw: 0.55, colors: [
    { name: 'Dark', hex: '#22262d' }, { name: 'Light', hex: '#eef0f3' }] },
  monitor: { label: 'Monitor', aspect: 1.68, defFw: 0.56, colors: [
    { name: 'Charcoal', hex: '#23262b' }, { name: 'Silver', hex: '#d3d6db' }] },
};

export const MATERIALS: { id: Material; label: string }[] = [
  { id: 'matte', label: 'Matte' }, { id: 'glossy', label: 'Glossy' },
  { id: 'glass', label: 'Glass' }, { id: 'metallic', label: 'Metallic' },
];

/** Screen opening inside a device box of size w×h — shared by preview AND export renderer. */
export function deviceGeometry(kind: DeviceKind, w: number, h: number, radiusMul = 1): ScreenRect {
  switch (kind) {
    case 'laptop': {
      const baseH = h * 0.062;
      const lidH = h - baseH;
      const x = w * 0.062, y = lidH * 0.06;
      return { x, y, w: w - x * 2, h: lidH - y - lidH * 0.055, r: Math.min(w, h) * 0.014 * radiusMul };
    }
    case 'phone': {
      const pad = w * 0.052;
      return { x: pad, y: pad * 1.12, w: w - pad * 2, h: h - pad * 2.24, r: w * 0.088 * radiusMul };
    }
    case 'tablet': {
      const pad = Math.min(w, h) * 0.048;
      return { x: pad, y: pad, w: w - pad * 2, h: h - pad * 2, r: Math.min(w, h) * 0.035 * radiusMul };
    }
    case 'browser': {
      const chrome = Math.max(h * 0.09, 26);
      return { x: 0, y: chrome, w, h: h - chrome, r: Math.min(w, h) * 0.02 * radiusMul };
    }
    case 'monitor': {
      const standH = h * 0.15;
      const screenH = h - standH;
      const pad = screenH * 0.028;
      return { x: pad, y: pad, w: w - pad * 2, h: screenH - pad * 2, r: Math.min(w, h) * 0.01 * radiusMul };
    }
  }
}

/** Where the screenshot image lands inside the screen rect (fit + zoom + pan). */
export function computeFit(s: ScreenRect, iw: number, ih: number, fit: FitMode, zoom: number, panX: number, panY: number) {
  let dw: number, dh: number;
  
  // Calculate aspect ratios
  const screenAspect = s.w / s.h;
  const imageAspect = iw / ih;
  
  if (fit === 'stretch') {
    // Stretch to fill - may distort aspect ratio
    dw = s.w;
    dh = s.h;
  } else if (fit === 'cover') {
    // Cover: scale to fill entire screen, may crop
    const scale = Math.max(s.w / iw, s.h / ih);
    dw = iw * scale;
    dh = ih * scale;
  } else {
    // Contain: scale to fit within screen, may have gaps
    const scale = Math.min(s.w / iw, s.h / ih);
    dw = iw * scale;
    dh = ih * scale;
  }
  
  // Apply zoom (maintains aspect ratio) - CRITICAL FIX
  // Zoom should scale from center, not from top-left
  const baseW = dw;
  const baseH = dh;
  dw = baseW * zoom;
  dh = baseH * zoom;
  
  // Calculate center position with pan offset
  // Pan should be relative to screen size, not image size
  const centerX = s.x + s.w / 2;
  const centerY = s.y + s.h / 2;
  const panOffsetX = panX * s.w * 0.5; // Max 50% of screen width
  const panOffsetY = panY * s.h * 0.5; // Max 50% of screen height
  
  const cx = centerX + panOffsetX;
  const cy = centerY + panOffsetY;
  
  // Position image centered at (cx, cy)
  const dx = cx - dw / 2;
  const dy = cy - dh / 2;
  
  return { dx, dy, dw, dh };
}

// Helper function to suggest best fit mode based on aspect ratios
export function suggestFitMode(screenAspect: number, imageAspect: number): FitMode {
  const ratio = screenAspect / imageAspect;
  
  // If aspect ratios are very close, use contain (no gaps, no cropping)
  if (ratio > 0.9 && ratio < 1.1) {
    return 'contain';
  }
  
  // If screen is much wider than image, use cover to fill
  if (ratio > 1.3) {
    return 'cover';
  }
  
  // If image is much wider than screen, use cover to fill
  if (ratio < 0.77) {
    return 'cover';
  }
  
  // Default to cover for best visual result
  return 'cover';
}

/* ---------------- canvas / aspect ---------------- */
export const CANVAS_PRESETS = [
  { label: 'Showcase', w: 1600, h: 1000 },
  { label: 'MacBook', w: 1440, h: 900 },
  { label: 'Portfolio', w: 1200, h: 800 },
  { label: 'LinkedIn', w: 1200, h: 628 },
  { label: 'Square', w: 1080, h: 1080 },
  { label: 'IG Portrait', w: 1080, h: 1350 },
  { label: 'Story', w: 1080, h: 1920 },
  { label: 'Full HD', w: 1920, h: 1080 },
];

export const ASPECTS = [
  { label: '16:9', w: 1600, h: 900 }, { label: '4:3', w: 1440, h: 1080 },
  { label: '1:1', w: 1200, h: 1200 }, { label: '4:5', w: 1080, h: 1350 },
  { label: '9:16', w: 1080, h: 1920 }, { label: '3:2', w: 1500, h: 1000 },
];

export const PROJECT_TYPES = ['Website', 'Web App', 'Mobile App', 'Dashboard', 'Landing Page', 'E-commerce', 'Portfolio', 'Desktop App', 'Custom'];

export const EXPORT_PRESETS = [
  { id: 'original', label: 'Original', w: 0, h: 0 },
  { id: 'portfolio', label: 'Portfolio', w: 1200, h: 800 },
  { id: 'portfolio-wide', label: 'Portfolio Wide', w: 1600, h: 900 },
  { id: 'case-study', label: 'Case Study', w: 1440, h: 1080 },
  { id: 'linkedin', label: 'LinkedIn Post', w: 1200, h: 627 },
  { id: 'linkedin-cover', label: 'LinkedIn Cover', w: 1584, h: 396 },
  { id: 'upwork', label: 'Upwork', w: 1280, h: 960 },
  { id: 'square', label: 'IG Square', w: 1080, h: 1080 },
  { id: 'portrait', label: 'IG Portrait', w: 1080, h: 1350 },
  { id: 'story', label: 'IG Story', w: 1080, h: 1920 },
  { id: 'hd', label: 'Full HD', w: 1920, h: 1080 },
  { id: '4k', label: '4K', w: 3840, h: 2160 },
];

/* ---------------- background factory ---------------- */
export const bg = (
  type: BgType, c1: string, c2: string, c3: string, angle: number,
  pattern: PatternKind, po: number, style: BgStyle = 'plain',
): Background => ({
  type, c1, c2, c3, angle, pattern, patternOpacity: po,
  style, seed: 7, light: { type: 'none', intensity: 0.5 }, meshPoints: 4,
});

export interface BgPreset { id: string; name: string; cat: string; sw: [string, string]; bg: Background }

export const BG_PRESETS: BgPreset[] = [
  { id: 'studio-dark', name: 'Studio Dark', cat: 'Studio', sw: ['#17191e', '#17191e'], bg: bg('solid', '#17191e', '#17191e', '#17191e', 0, 'grid', 0.05, 'studio') },
  { id: 'paper', name: 'Paper', cat: 'Minimal', sw: ['#f4f4f1', '#f4f4f1'], bg: bg('solid', '#f4f4f1', '#f4f4f1', '#f4f4f1', 0, 'none', 0) },
  { id: 'porcelain', name: 'Porcelain Grid', cat: 'Grid', sw: ['#fbfbf9', '#fbfbf9'], bg: bg('solid', '#fbfbf9', '#fbfbf9', '#fbfbf9', 0, 'grid', 0.08) },
  { id: 'slate', name: 'Slate', cat: 'Studio', sw: ['#2b313b', '#2b313b'], bg: bg('solid', '#2b313b', '#2b313b', '#2b313b', 0, 'noise', 0.05) },
  { id: 'ink', name: 'Ink Noise', cat: 'Dark', sw: ['#101114', '#101114'], bg: bg('solid', '#101114', '#101114', '#101114', 0, 'noise', 0.09) },
  { id: 'ember', name: 'Ember Fade', cat: 'Gradient', sw: ['#1c1d22', '#3a241b'], bg: bg('linear', '#1c1d22', '#3a241b', '#3a241b', 135, 'none', 0) },
  { id: 'tide', name: 'Deep Tide', cat: 'Gradient', sw: ['#0f1c22', '#1d4149'], bg: bg('linear', '#0f1c22', '#1d4149', '#1d4149', 120, 'none', 0) },
  { id: 'glacier', name: 'Glacier', cat: 'Light', sw: ['#eaf2f5', '#c9dde5'], bg: bg('linear', '#eaf2f5', '#c9dde5', '#c9dde5', 160, 'none', 0) },
  { id: 'dawn', name: 'Soft Dawn', cat: 'Light', sw: ['#fdf3e7', '#f3d9c6'], bg: bg('linear', '#fdf3e7', '#f3d9c6', '#f3d9c6', 145, 'none', 0) },
  { id: 'mint', name: 'Mint Wash', cat: 'Light', sw: ['#ecf5ef', '#d2e7db'], bg: bg('linear', '#ecf5ef', '#d2e7db', '#d2e7db', 150, 'none', 0) },
  { id: 'spotlight', name: 'Spotlight', cat: 'Studio', sw: ['#262a32', '#101216'], bg: bg('radial', '#262a32', '#101216', '#101216', 0, 'none', 0, 'studio') },
  { id: 'halo', name: 'Warm Halo', cat: 'Studio', sw: ['#2a2118', '#120f0c'], bg: bg('radial', '#2a2118', '#120f0c', '#120f0c', 0, 'noise', 0.05) },
  { id: 'deepmesh', name: 'Deep Mesh', cat: 'Mesh', sw: ['#0e1116', '#1d3a38'], bg: bg('mesh', '#0e1116', '#ff6b3d', '#45d6c8', 0, 'none', 0) },
  { id: 'solar-mesh', name: 'Solar Mesh', cat: 'Mesh', sw: ['#f6f1e8', '#ffd9c4'], bg: bg('mesh', '#f6f1e8', '#ff8a5c', '#7fd8cd', 0, 'none', 0) },
  { id: 'terminal', name: 'Terminal', cat: 'Developer', sw: ['#0b0f0d', '#0b0f0d'], bg: bg('solid', '#0b0f0d', '#0b0f0d', '#0b0f0d', 0, 'grid', 0.07, 'tech') },
  { id: 'blueprint', name: 'Blueprint', cat: 'Developer', sw: ['#0f2036', '#0f2036'], bg: bg('solid', '#0f2036', '#0f2036', '#0f2036', 0, 'grid', 0.1, 'grid') },
];

export const PATTERNS: { id: PatternKind; label: string }[] = [
  { id: 'none', label: 'None' }, { id: 'dots', label: 'Dots' }, { id: 'grid', label: 'Grid' },
  { id: 'rings', label: 'Rings' }, { id: 'diag', label: 'Diag' }, { id: 'noise', label: 'Noise' },
];

export const LIGHTING: { id: LightType; label: string }[] = [
  { id: 'none', label: 'None' }, { id: 'top', label: 'Top light' }, { id: 'bottom', label: 'Riser glow' },
  { id: 'left', label: 'Left key' }, { id: 'right', label: 'Right key' }, { id: 'center', label: 'Center glow' },
  { id: 'ambient', label: 'Ambient' },
];

/* ---------------- tech / typography ---------------- */
export const TECH_BADGES = [
  'React', 'TypeScript', 'Node.js', 'Next.js', 'Vue', 'Angular', 'Svelte', 'MongoDB', 'PostgreSQL',
  'MySQL', 'Tailwind', 'Express', 'Python', 'Django', 'Firebase', 'Supabase', 'Flutter', 'React Native',
  'Figma', 'GraphQL', 'Docker', 'AWS', 'Vite', 'Redux', 'Prisma', 'Rust', 'Go', 'Swift', 'Kotlin', 'Java',
];

export interface TypoPreset { id: string; label: string; scale: number; pos: PosPreset; badges: boolean; spacingNote: string; fontWeight?: number; letterSpacing?: number }
export const TYPO_PRESETS: TypoPreset[] = [
  { id: 'saas', label: 'Modern SaaS', scale: 1.0, pos: 'bottom-left', badges: true, spacingNote: 'balanced', fontWeight: 700, letterSpacing: 0 },
  { id: 'editorial', label: 'Editorial', scale: 1.35, pos: 'top-left', badges: false, spacingNote: 'wide', fontWeight: 400, letterSpacing: 2 },
  { id: 'minimal', label: 'Minimal', scale: 0.8, pos: 'bottom-center', badges: false, spacingNote: 'airy', fontWeight: 300, letterSpacing: 1 },
  { id: 'bold', label: 'Bold', scale: 1.5, pos: 'center-left', badges: true, spacingNote: 'tight', fontWeight: 900, letterSpacing: -1 },
  { id: 'technical', label: 'Technical', scale: 0.9, pos: 'bottom-left', badges: true, spacingNote: 'mono', fontWeight: 500, letterSpacing: 0.5 },
  { id: 'luxury', label: 'Luxury', scale: 1.2, pos: 'bottom-right', badges: false, spacingNote: 'serif', fontWeight: 300, letterSpacing: 3 },
  { id: 'developer', label: 'Developer', scale: 0.95, pos: 'top-left', badges: true, spacingNote: 'mono', fontWeight: 600, letterSpacing: 0 },
  { id: 'corporate', label: 'Corporate', scale: 1.05, pos: 'bottom-left', badges: true, spacingNote: 'clean', fontWeight: 600, letterSpacing: 0.5 },
  { id: 'playful', label: 'Playful', scale: 1.1, pos: 'center', badges: true, spacingNote: 'rounded', fontWeight: 800, letterSpacing: -0.5 },
  { id: 'elegant', label: 'Elegant', scale: 1.15, pos: 'top-center', badges: false, spacingNote: 'refined', fontWeight: 300, letterSpacing: 4 },
  { id: 'impact', label: 'Impact', scale: 1.6, pos: 'center', badges: false, spacingNote: 'heavy', fontWeight: 900, letterSpacing: -2 },
  { id: 'modern', label: 'Modern', scale: 1.0, pos: 'bottom-left', badges: true, spacingNote: 'clean', fontWeight: 500, letterSpacing: 1 },
];

/* ---------------- shadows ---------------- */
export const SHADOWS: { id: ShadowPreset; label: string; dx: number; dy: number; blur: number; alpha: number }[] = [
  { id: 'none', label: 'None', dx: 0, dy: 0, blur: 0, alpha: 0 },
  { id: 'soft', label: 'Soft', dx: 0, dy: 22, blur: 55, alpha: 0.38 },
  { id: 'hard', label: 'Hard', dx: 14, dy: 18, blur: 3, alpha: 0.42 },
  { id: 'float', label: 'Float', dx: 0, dy: 44, blur: 90, alpha: 0.48 },
  { id: 'glow', label: 'Glow', dx: 0, dy: 12, blur: 70, alpha: 0.5 },
  { id: 'product', label: 'Product', dx: 0, dy: 30, blur: 42, alpha: 0.42 },
  { id: 'cinematic', label: 'Cinematic', dx: 0, dy: 60, blur: 120, alpha: 0.55 },
  { id: 'long', label: 'Long', dx: 26, dy: 40, blur: 26, alpha: 0.3 },
];

export const FIT_MODES: { id: FitMode; label: string }[] = [
  { id: 'cover', label: 'Cover' }, { id: 'contain', label: 'Contain' }, { id: 'stretch', label: 'Stretch' },
];

export const POSITIONS: PosPreset[] = [
  'top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right',
];

export const DECO_SETS: { id: DecoSet; label: string }[] = [
  { id: 'none', label: 'None' }, { id: 'orbs', label: 'Orbs' }, { id: 'rings', label: 'Rings' },
  { id: 'grid', label: 'Dot field' }, { id: 'sparkles', label: 'Sparkles' }, { id: 'waves', label: 'Waves' },
];

/* ---------------- decoration preset library (50+) ---------------- */
export interface DecoPresetDef { id: string; label: string; cat: DecoCat; prim: DecoPrim; role: string }
const dp = (id: string, label: string, cat: DecoCat, prim: DecoPrim, role: string = 'abstract'): DecoPresetDef => ({ id, label, cat, prim, role });
export const DECO_PRESETS: DecoPresetDef[] = [
  // Legacy geometric (kept for backward compat)
  dp('circle', 'Circle', 'geometric', 'disc', 'depth'),
  dp('ring', 'Ring', 'geometric', 'ring', 'frame'),
  dp('square', 'Square', 'geometric', 'square', 'structure'),
  dp('triangle', 'Triangle', 'geometric', 'triangle', 'structure'),
  dp('line', 'Line', 'geometric', 'line', 'motion'),
  dp('arc', 'Arc', 'geometric', 'arc', 'frame'),
  dp('dot', 'Dot field', 'geometric', 'dotgrid', 'texture'),
  dp('plus', 'Plus', 'geometric', 'plus', 'tech'),
  dp('orbit', 'Orbit', 'geometric', 'orbit', 'frame'),

  // 3D & Premium (1-10)
  dp('glass-orb', 'Glass Orb', 'depth', 'glassorb', 'depth'),
  dp('chrome-ring', 'Chrome Ring', 'luxury', 'chromering', 'luxury'),
  dp('soft-sphere', 'Soft 3D Sphere', 'depth', 'softsphere', 'depth'),
  dp('rounded-cube', 'Rounded Cube', 'depth', 'roundedcube', 'depth'),
  dp('glass-cube', 'Glass Cube', 'depth', 'glasscube', 'depth'),
  dp('floating-pill', 'Floating Pill', 'motion', 'floatingpill', 'motion'),
  dp('metallic-disc', 'Metallic Disc', 'luxury', 'metallicdisc', 'luxury'),
  dp('torus-3d', '3D Torus', 'depth', 'torus3d', 'depth'),
  dp('glass-torus', 'Glass Torus', 'luxury', 'glasstorus', 'luxury'),
  dp('pyramid', 'Pyramid', 'structure', 'pyramid', 'structure'),

  // Geometric Frames (11-20)
  dp('iso-cube', 'Isometric Cube', 'structure', 'isocube', 'structure'),
  dp('wireframe-cube', 'Wireframe Cube', 'tech', 'wireframecube', 'tech'),
  dp('hex-frame', 'Hexagonal Frame', 'tech', 'hexframe', 'tech'),
  dp('oct-frame', 'Octagonal Frame', 'tech', 'octframe', 'tech'),
  dp('diamond-frame', 'Diamond Frame', 'frame', 'diamondframe', 'frame'),
  dp('abstract-arc', 'Abstract Arc', 'frame', 'arc', 'frame'),
  dp('double-arc', 'Double Arc', 'frame', 'doublearc', 'frame'),
  dp('spiral', 'Spiral Form', 'motion', 'spiral', 'motion'),
  dp('orbit-lines', 'Orbit Lines', 'frame', 'orbitlines', 'frame'),
  dp('halo', 'Halo Ring', 'frame', 'halo', 'frame'),

  // Ribbons & Fluid (21-30)
  dp('fluid-ribbon', 'Fluid Ribbon', 'motion', 'fluidribbon', 'motion'),
  dp('folded-ribbon', 'Folded Ribbon', 'motion', 'foldedribbon', 'motion'),
  dp('liquid-blob', 'Liquid Blob', 'soft', 'liquidblob', 'soft'),
  dp('pebble', 'Organic Pebble', 'soft', 'pebble', 'soft'),
  dp('cutout-circle', 'Cutout Circle', 'frame', 'cutout', 'frame'),
  dp('half-moon', 'Half Moon', 'soft', 'halfmoon', 'soft'),
  dp('quarter-circle', 'Quarter Circle', 'frame', 'quartercircle', 'frame'),
  dp('layered-wave', 'Layered Wave', 'motion', 'layeredwave', 'motion'),
  dp('fluid-line', 'Fluid Line', 'motion', 'fluidline', 'motion'),
  dp('dotted-orbit', 'Dotted Orbit', 'texture', 'dottedorbit', 'texture'),

  // Texture & Grid (31-40)
  dp('dot-cluster', 'Dot Cluster', 'texture', 'dotcluster', 'texture'),
  dp('micro-grid', 'Micro Grid', 'texture', 'microgrid', 'texture'),
  dp('perspective-grid', 'Perspective Grid', 'texture', 'perspectivegrid', 'texture'),
  dp('geo-cross', 'Geometric Cross', 'structure', 'cross', 'structure'),
  dp('plus-cluster', 'Plus Cluster', 'tech', 'pluscluster', 'tech'),
  dp('floating-slab', 'Floating Slab', 'structure', 'slab', 'structure'),
  dp('layered-cards', 'Layered Cards', 'ui', 'layeredcards', 'structure'),
  dp('glass-panel', 'Glass Panel', 'ui', 'glasspanel', 'depth'),
  dp('frosted-shape', 'Frosted Shape', 'ui', 'frostedshape', 'depth'),
  dp('pill-cluster', 'Metallic Pill Cluster', 'luxury', 'pillcluster', 'luxury'),

  // Advanced (41-50)
  dp('floating-triangles', 'Floating Triangles', 'structure', 'floatingtriangles', 'structure'),
  dp('polygon-stack', 'Polygon Stack', 'structure', 'polygonstack', 'structure'),
  dp('iso-stair', 'Isometric Stair', 'structure', 'isostair', 'structure'),
  dp('cylinder-3d', '3D Cylinder', 'depth', 'cylinder', 'depth'),
  dp('cone-3d', '3D Cone', 'depth', 'cone', 'depth'),
  dp('capsule-stack', 'Capsule Stack', 'motion', 'capsulestack', 'motion'),
  dp('flower-geo', 'Abstract Flower', 'frame', 'flowergeo', 'frame'),
  dp('radial-lines', 'Radial Lines', 'tech', 'radiallines', 'tech'),
  dp('corner-brackets', 'Corner Brackets', 'frame', 'cornerbrackets', 'frame'),
  dp('shadow-blob', 'Soft Shadow Blob', 'soft', 'shadowblob', 'soft'),
];
/* legacy decoration generator (kept for old projects) */
export function getDecoShapes(set: DecoSet, seed: number, w: number, h: number, intensity: number, c1: string, c2: string): DecoShape[] {
  if (set === 'none') return [];
  const rnd = mulberry32(seed);
  const out: DecoShape[] = [];
  const min = Math.min(w, h);
  const colors = [c1, c2, '#f2f0ea'];
  const edgePos = () => {
    const side = Math.floor(rnd() * 4);
    const m = 0.16;
    if (side === 0) return { x: rngRange(rnd, -0.04, m), y: rngRange(rnd, 0.02, 0.98) };
    if (side === 1) return { x: rngRange(rnd, 1 - m, 1.04), y: rngRange(rnd, 0.02, 0.98) };
    if (side === 2) return { x: rngRange(rnd, 0.02, 0.98), y: rngRange(rnd, -0.04, m * 0.7) };
    return { x: rngRange(rnd, 0.02, 0.98), y: rngRange(rnd, 1 - m * 0.7, 1.04) };
  };
  const n = Math.round((set === 'sparkles' ? 10 : 6) * intensity);
  for (let i = 0; i < n; i++) {
    const p = edgePos();
    const color = colors[i % colors.length];
    const o = rngRange(rnd, 0.25, 0.7) * Math.min(1, intensity);
    if (set === 'orbs') out.push({ t: 'circle', x: p.x * w, y: p.y * h, r: rngRange(rnd, 0.03, 0.13) * min * intensity, color, o: o * 0.55, rot: 0 });
    else if (set === 'rings') out.push({ t: 'ring', x: p.x * w, y: p.y * h, r: rngRange(rnd, 0.04, 0.15) * min * intensity, color, o, rot: 0 });
    else if (set === 'grid') out.push({ t: 'dots', x: p.x * w, y: p.y * h, r: rngRange(rnd, 0.05, 0.11) * min, color, o: o * 0.8, rot: rngRange(rnd, -0.3, 0.3) });
    else if (set === 'sparkles') out.push({ t: i % 3 === 0 ? 'plus' : 'sparkle', x: p.x * w, y: p.y * h, r: rngRange(rnd, 0.012, 0.03) * min * intensity, color, o, rot: rngRange(rnd, 0, 0.8) });
    else if (set === 'waves') out.push({ t: 'line', x: p.x * w, y: p.y * h, r: rngRange(rnd, 0.08, 0.2) * min, color, o: o * 0.7, rot: rngRange(rnd, -0.5, 0.5) });
  }
  return out;
}

/* ---------------- palettes ---------------- */
export interface Palette { c1: string; c2: string; c3: string; type: BgType; angle: number; pattern: PatternKind; po: number; a1: string; a2: string; style: BgStyle; light: LightType; dark: boolean }
export const PALETTES: Palette[] = [
  { c1: '#17191e', c2: '#3a241b', c3: '#3a241b', type: 'linear', angle: 135, pattern: 'grid', po: 0.05, a1: '#ff6b3d', a2: '#ffd166', style: 'studio', light: 'bottom', dark: true },
  { c1: '#0f1c22', c2: '#1d4149', c3: '#1d4149', type: 'linear', angle: 120, pattern: 'none', po: 0, a1: '#45d6c8', a2: '#f2f0ea', style: 'abstract', light: 'top', dark: true },
  { c1: '#0e1116', c2: '#ff6b3d', c3: '#45d6c8', type: 'mesh', angle: 0, pattern: 'noise', po: 0.05, a1: '#ff6b3d', a2: '#45d6c8', style: 'plain', light: 'ambient', dark: true },
  { c1: '#f4f4f1', c2: '#f4f4f1', c3: '#f4f4f1', type: 'solid', angle: 0, pattern: 'grid', po: 0.09, a1: '#1d1f24', a2: '#ff6b3d', style: 'studio', light: 'top', dark: false },
  { c1: '#fbfbf9', c2: '#e8eef1', c3: '#e8eef1', type: 'linear', angle: 160, pattern: 'dots', po: 0.35, a1: '#2e4057', a2: '#ff6b3d', style: 'architectural', light: 'right', dark: false },
  { c1: '#262a32', c2: '#101216', c3: '#101216', type: 'radial', angle: 0, pattern: 'none', po: 0, a1: '#ffd166', a2: '#f2f0ea', style: 'studio', light: 'center', dark: true },
  { c1: '#101114', c2: '#101114', c3: '#101114', type: 'solid', angle: 0, pattern: 'noise', po: 0.09, a1: '#ff6b3d', a2: '#45d6c8', style: 'tech', light: 'none', dark: true },
  { c1: '#fdf3e7', c2: '#f3d9c6', c3: '#f3d9c6', type: 'linear', angle: 145, pattern: 'none', po: 0, a1: '#b4552d', a2: '#2e4057', style: 'abstract', light: 'top', dark: false },
  { c1: '#0f2036', c2: '#0f2036', c3: '#0f2036', type: 'solid', angle: 0, pattern: 'grid', po: 0.1, a1: '#45d6c8', a2: '#f2f0ea', style: 'grid', light: 'none', dark: true },
  { c1: '#1c1d22', c2: '#2a1e2e', c3: '#2a1e2e', type: 'linear', angle: 115, pattern: 'rings', po: 0.06, a1: '#f4a3b5', a2: '#ffd166', style: 'glass', light: 'ambient', dark: true },
  { c1: '#ecf5ef', c2: '#d2e7db', c3: '#d2e7db', type: 'linear', angle: 150, pattern: 'none', po: 0, a1: '#2f4a3e', a2: '#ff6b3d', style: 'editorial', light: 'left', dark: false },
  { c1: '#2b313b', c2: '#2b313b', c3: '#2b313b', type: 'solid', angle: 0, pattern: 'noise', po: 0.06, a1: '#ff6b3d', a2: '#f2f0ea', style: 'studio', light: 'bottom', dark: true },
  { c1: '#14161c', c2: '#232a3a', c3: '#1a2436', type: 'linear', angle: 130, pattern: 'none', po: 0, a1: '#5aa7ff', a2: '#45d6c8', style: 'abstract', light: 'top', dark: true },
  { c1: '#f7f5f0', c2: '#efe9df', c3: '#efe9df', type: 'linear', angle: 120, pattern: 'none', po: 0, a1: '#c96f3b', a2: '#31435c', style: 'editorial', light: 'right', dark: false },
  { c1: '#101418', c2: '#1c2229', c3: '#182028', type: 'radial', angle: 0, pattern: 'dots', po: 0.12, a1: '#7ee0d2', a2: '#f2f0ea', style: 'tech', light: 'center', dark: true },
  { c1: '#efeae2', c2: '#dcd3c4', c3: '#dcd3c4', type: 'linear', angle: 150, pattern: 'none', po: 0, a1: '#8a5a33', a2: '#3c4a3f', style: 'architectural', light: 'top', dark: false },
];

export function paletteToBg(pal: Palette, seed: number): Background {
  return {
    type: pal.type, c1: pal.c1, c2: pal.c2, c3: pal.c3, angle: pal.angle,
    pattern: pal.pattern, patternOpacity: pal.po, style: pal.style, seed,
    light: { type: pal.light, intensity: 0.55 }, meshPoints: 4,
  };
}

/** Quick rule-based variation (the Generate panel uses the richer engine). */
export function randomizeProject(p: Project): Project {
  const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
  const rnd = mulberry32(seed);
  const pal = pick(rnd, PALETTES);
  const tilts = [-6, -4, -2, 0, 0, 2, 4, 6];
  const shadows: ShadowPreset[] = ['soft', 'soft', 'float', 'product', 'cinematic', 'glow'];
  const decos: DecoSet[] = ['orbs', 'rings', 'grid', 'sparkles', 'waves', 'none'];
  const textPos: PosPreset[] = ['bottom-left', 'bottom-center', 'top-left', 'top-center'];
  const logoPos: PosPreset[] = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
  return {
    ...p,
    updatedAt: Date.now(),
    background: paletteToBg(pal, Math.floor(rnd() * 1e9)),
    decoration: { ...p.decoration, set: pick(rnd, decos), seed: Math.floor(rnd() * 1e9), intensity: rngRange(rnd, 0.7, 1.2) },
    text: { ...p.text, position: pick(rnd, textPos) },
    logo: { ...p.logo, position: p.logo.enabled ? pick(rnd, logoPos) : p.logo.position },
    devices: p.devices.map((d, i) => ({ ...d, tilt: pick(rnd, tilts) + (i % 2 === 0 ? 0 : pick(rnd, [-2, 2])), shadow: pick(rnd, shadows) })),
    accents: { a1: pal.a1, a2: pal.a2 },
  };
}

/* ---------------- factories ---------------- */
export function makeDevice(kind: DeviceKind, cw: number, ch: number, assetId: string | null, index: number): DeviceLayer {
  const meta = DEVICE_META[kind];
  const w = cw * meta.defFw;
  const h = w / meta.aspect;
  return {
    id: uid(), kind, name: `${meta.label} ${index + 1}`,
    x: (cw - w) / 2, y: (ch - h) / 2, w,
    tilt: 0, color: meta.colors[0].hex, assetId, fit: 'cover',
    zoom: 1, panX: 0, panY: 0, shadow: 'soft',
    url: 'yourapp.com', visible: true,
    brightness: 1, reflection: 0, radiusMul: 1, opacity: 1, material: 'matte', z: index,
  };
}

export function makeDefaultProject(name: string, type: string, cw: number, ch: number): Project {
  const preset = BG_PRESETS[0];
  const text: TextBlock = {
    enabled: true, title: '', subtitle: '', showBadges: false, badges: ['React', 'TypeScript', 'Tailwind'],
    position: 'bottom-left', scale: 1, color: '#f2f0ea', autoColor: true, fontFamily: 'space-grotesk',
  };
  return {
    id: uid(), name, type, createdAt: Date.now(), updatedAt: Date.now(),
    canvas: { w: cw, h: ch },
    assets: [],
    devices: [makeDevice('laptop', cw, ch, null, 0)],
    background: { ...preset.bg, seed: Math.floor(Math.random() * 1e9) },
    text,
    logo: { enabled: false, assetId: null, position: 'top-right', size: 0.08, opacity: 0.9 },
    decoration: { set: 'orbs', seed: Math.floor(Math.random() * 1e9), intensity: 1, density: 0.5, layers: [] },
    accents: { a1: '#ff6b3d', a2: '#45d6c8' },
    thumbnail: null,
    exportCount: 0,
    decos: [],
    mood: 'auto',
    icons: [],
    textboxes: [],
  };
}

/** Fill defaults for projects created before the upgrade (backward compat). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrate(p: any): Project {
  const base = makeDefaultProject('x', 'Custom', 1600, 1000);
  return {
    ...base,
    ...p,
    canvas: { ...base.canvas, ...(p.canvas || {}) },
    background: { ...base.background, ...(p.background || {}) },
    decoration: { ...base.decoration, ...(p.decoration || {}), layers: (p.decoration?.layers) || [] },
    devices: (p.devices || []).map((d: Partial<DeviceLayer> & { id: string }) => ({
      brightness: 1, reflection: 0, radiusMul: 1, opacity: 1, material: 'matte' as Material, z: 0, ...d,
    })),
    decos: p.decos || [],
    mood: p.mood || 'auto',
    accents: p.accents || { a1: '#ff6b3d', a2: '#45d6c8' },
    text: { ...base.text, ...(p.text || {}) },
    logo: { ...base.logo, ...(p.logo || {}) },
    icons: p.icons || [],
    textboxes: p.textboxes || [],
  };
}

/* legacy layout list (superseded by engine COMPOSITIONS but kept for compat) */
export const LAYOUTS: { id: string; label: string; desc: string; devices: { kind: DeviceKind; fx: number; fy: number; fw: number }[] }[] = [
  { id: 'single', label: 'Hero device', desc: 'One device, centered', devices: [{ kind: 'laptop', fx: 0.19, fy: 0.17, fw: 0.62 }] },
  { id: 'duo', label: 'Laptop + Phone', desc: 'Web + mobile combo', devices: [{ kind: 'laptop', fx: 0.11, fy: 0.16, fw: 0.6 }, { kind: 'phone', fx: 0.66, fy: 0.3, fw: 0.135 }] },
  { id: 'responsive', label: 'Responsive trio', desc: 'Desktop · tablet · phone', devices: [{ kind: 'laptop', fx: 0.07, fy: 0.13, fw: 0.55 }, { kind: 'tablet', fx: 0.58, fy: 0.34, fw: 0.25 }, { kind: 'phone', fx: 0.79, fy: 0.4, fw: 0.115 }] },
];

export function applyLayoutPositions(p: Project, layoutId: string): Project {
  const layout = LAYOUTS.find(l => l.id === layoutId);
  if (!layout) return p;
  const { w: cw, h: ch } = p.canvas;
  const assets = p.assets;
  const devices: DeviceLayer[] = layout.devices.map((d, i) => {
    const meta = DEVICE_META[d.kind];
    const w = cw * d.fw;
    const prev = p.devices[i];
    return {
      ...makeDevice(d.kind, cw, ch, assets[i]?.id ?? null, i),
      x: cw * d.fx, y: ch * d.fy, w,
      assetId: assets[i]?.id ?? prev?.assetId ?? null,
      color: prev?.color ?? meta.colors[0].hex,
    };
  });
  return { ...p, devices, updatedAt: Date.now() };
}

/* keep unused-import warnings away for types only used in signatures above */
export type { Asset, DecoLayer, Mood };
