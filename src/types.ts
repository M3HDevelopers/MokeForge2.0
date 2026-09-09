/* ================= core enums ================= */
export type DeviceKind = 'laptop' | 'phone' | 'tablet' | 'browser' | 'monitor';
export type FitMode = 'cover' | 'contain' | 'stretch';
export type ShadowPreset = 'none' | 'soft' | 'hard' | 'float' | 'glow' | 'product' | 'cinematic' | 'long';
export type BgType = 'solid' | 'linear' | 'radial' | 'mesh';
export type PatternKind = 'none' | 'dots' | 'grid' | 'rings' | 'noise' | 'diag';
export type DecoSet = 'none' | 'orbs' | 'rings' | 'grid' | 'sparkles' | 'waves';
export type PosPreset =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

// Custom Text Box types
export type TextBoxAlign = 'left' | 'center' | 'right';
export type TextBoxBgType = 'none' | 'solid' | 'gradient' | 'glass';

export interface TextBox {
  id: string;
  text: string;
  x: number; // percentage 0-1
  y: number; // percentage 0-1
  width: number; // percentage 0-1
  fontSize: number; // px
  fontFamily: string;
  fontWeight: number;
  color: string;
  align: TextBoxAlign;
  bgType: TextBoxBgType;
  bgColor: string;
  bgGradient?: string;
  padding: number; // px
  borderRadius: number; // px
  opacity: number; // 0-1
  rotation: number; // degrees
  shadow: boolean;
  glow: boolean;
  glowColor: string;
}

/* ================= new enums ================= */
export type BgStyle = 'plain' | 'studio' | 'architectural' | 'abstract' | 'grid' | 'editorial' | 'tech' | 'glass';
export type LightType = 'none' | 'top' | 'bottom' | 'left' | 'right' | 'center' | 'ambient';
export type Material = 'matte' | 'glossy' | 'glass' | 'metallic';
export type DecoCat = 'geometric' | '3d' | 'abstract' | 'ui' | 'frame' | 'depth' | 'structure' | 'texture' | 'motion' | 'tech' | 'luxury' | 'soft';
export type DecoPrim =
  | 'sphere' | 'ring' | 'disc' | 'blob' | 'ribbon' | 'dotgrid' | 'wave' | 'plus' | 'sparkle'
  | 'glasscard' | 'uipanel' | 'notification' | 'chart' | 'arc' | 'pill' | 'cube' | 'torus'
  | 'line' | 'square' | 'triangle' | 'orbit'
  | 'glassorb' | 'chromering' | 'softsphere' | 'roundedcube' | 'glasscube' | 'floatingpill'
  | 'metallicdisc' | 'torus3d' | 'glasstorus' | 'pyramid' | 'isocube' | 'wireframecube'
  | 'hexframe' | 'octframe' | 'diamondframe' | 'doublearc' | 'spiral' | 'orbitlines' | 'halo'
  | 'fluidribbon' | 'foldedribbon' | 'liquidblob' | 'pebble' | 'cutout' | 'halfmoon' | 'quartercircle'
  | 'layeredwave' | 'fluidline' | 'dottedorbit' | 'dotcluster' | 'microgrid' | 'perspectivegrid'
  | 'cross' | 'pluscluster' | 'slab' | 'layeredcards' | 'glasspanel' | 'frostedshape'
  | 'pillcluster' | 'floatingtriangles' | 'polygonstack' | 'isostair' | 'cylinder' | 'cone'
  | 'capsulestack' | 'flowergeo' | 'radiallines' | 'cornerbrackets' | 'shadowblob';
export type DecoDepth = 'back' | 'front';
export type Mood =
  | 'auto' | 'minimal' | 'premium' | 'creative' | 'developer' | 'dark' | 'light'
  | 'editorial' | 'bold' | 'elegant' | 'futuristic' | 'playful' | 'corporate'
  | 'luxury' | 'impact' | 'technical';
export type SurpriseMode = 'all' | 'background' | 'layout' | 'colors' | 'decor' | 'devices';

/* ================= image background types ================= */
export type ImageCategory = 'abstract' | '3d' | 'studio' | 'architectural' | 'glass' | 'paper' | 'tech' | 'editorial' | 'custom';
export type BackgroundKind = 'procedural' | 'image' | 'hybrid' | 'auto';
export type ImageFit = 'cover' | 'contain' | 'fill' | 'stretch' | 'center';
export type ImageColorFilter = 'original' | 'grayscale' | 'warm' | 'cool' | 'muted' | 'high' | 'soft' | 'dark' | 'light';
export type ImageOverlay = 'none' | 'color' | 'gradient' | 'black' | 'white' | 'noise' | 'vignette' | 'light';
export type ImageMask = 'none' | 'rounded' | 'circle' | 'radial' | 'gradient';
export type IconBgStyle = 'none' | 'circle' | 'rounded' | 'glass' | 'gradient' | 'badge';

export interface ImageBgState {
  kind: BackgroundKind;
  imageId: string | null;
  customSrc: string | null;
  fit: ImageFit;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  hue: number;
  colorFilter: ImageColorFilter;
  tint: string | null;
  tintOpacity: number;
  overlay: ImageOverlay;
  overlayColor: string;
  overlayOpacity: number;
  blend: GlobalCompositeOperation;
  mask: ImageMask;
}

export type IconMaterial = 'default' | 'glass' | 'glossy' | 'metallic' | 'ceramic' | 'holographic' | 'crystal';
export type IconPlacementMode = 'free' | 'around-device' | 'behind-device' | 'orbit' | 'cluster' | 'tech-stack';

export interface IconLayer {
  id: string;
  iconId: string;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  bgStyle: IconBgStyle;
  bgColor: string | null;
  shadow: boolean;
  glow: boolean;
  material?: IconMaterial;
  gradient?: { from: string; to: string };
}

/* ================= interfaces ================= */
export interface Asset {
  id: string;
  name: string;
  dataUrl: string;
  w: number;
  h: number;
}

export interface Lighting {
  type: LightType;
  intensity: number; // 0..1
}

export interface Background {
  type: BgType;
  c1: string;
  c2: string;
  c3: string;
  angle: number;
  pattern: PatternKind;
  patternOpacity: number; // 0..1
  /* new */
  style: BgStyle;
  seed: number;
  light: Lighting;
  meshPoints: number; // 3..8
  /* image background */
  kind?: BackgroundKind;
  image?: ImageBgState;
}

export interface DeviceLayer {
  id: string;
  kind: DeviceKind;
  name: string;
  x: number;
  y: number;
  w: number;
  tilt: number;
  color: string;
  assetId: string | null;
  fit: FitMode;
  zoom: number;
  panX: number;
  panY: number;
  shadow: ShadowPreset;
  url: string;
  visible: boolean;
  /* new */
  brightness: number;   // 0.5..1.5
  reflection: number;   // 0..1
  radiusMul: number;    // 0.4..2
  opacity: number;      // 0..1
  material: Material;
  z: number;
}

export interface TextBlock {
  enabled: boolean;
  title: string;
  subtitle: string;
  showBadges: boolean;
  badges: string[];
  position: PosPreset;
  scale: number;
  color: string;
  autoColor: boolean;
  fontFamily: string;
  x?: number;
  y?: number;
}

export interface LogoState {
  enabled: boolean;
  assetId: string | null;
  position: PosPreset;
  size: number;
  opacity: number;
}

export interface DecoLayer {
  id: string;
  preset: string;
  x: number;      // fractional 0..1 (center)
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  blur: number;
  depth: DecoDepth;
  hue: string | null;
  seed: number;
}

export interface DecorationState {
  set: DecoSet;
  seed: number;
  intensity: number;
  density: number; // 0..1  (minimal..extreme)
  layers: DecoLayer[];
}

export interface GenLocks {
  devices: boolean;
  background: boolean;
  decoration: boolean;
  text: boolean;
  logo: boolean;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  createdAt: number;
  updatedAt: number;
  canvas: { w: number; h: number };
  assets: Asset[];
  devices: DeviceLayer[];
  background: Background;
  text: TextBlock;
  logo: LogoState;
  decoration: DecorationState;
  accents: { a1: string; a2: string };
  thumbnail: string | null;
  exportCount: number;
  /* new */
  decos: DecoLayer[];
  mood: Mood;
  icons: IconLayer[];
  textboxes: TextBox[];
}

/* ================= editor state ================= */
export interface Selection {
  kind: 'device' | 'text' | 'logo' | 'background' | 'deco' | 'icon' | 'textbox';
  id?: string;
  ids?: string[]; // Multi-select support
}

export interface Toast {
  id: number;
  msg: string;
  tone: 'ok' | 'err' | 'info';
}

export interface ScreenRect {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
}

export interface DecoShape {
  t: 'circle' | 'ring' | 'plus' | 'sparkle' | 'line' | 'dots';
  x: number;
  y: number;
  r: number;
  color: string;
  o: number;
  rot: number;
}

/* A stored snapshot (favorite / history / variation). Assets are stripped and
   merged back from the live project to keep storage light. */
export interface DesignSnapshot {
  id: string;
  label: string;
  at: number;
  thumb: string;
  score: number;
  project: Omit<Project, 'assets'>;
}
