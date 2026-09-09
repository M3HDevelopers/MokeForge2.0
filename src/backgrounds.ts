import type { Background, BgStyle, LightType } from './types';
import { isDark, luminance, mulberry32, rgba, shade } from './templates';

export function renderBackground(ctx: CanvasRenderingContext2D, b: Background, w: number, h: number, accents: { a1: string; a2: string }): void {
  paintBase(ctx, b, w, h);
  const style = b.style || 'plain';
  if (style !== 'plain') paintStyle(ctx, style, b, w, h, accents);
  paintPattern(ctx, b, w, h);
  paintLighting(ctx, b, w, h);
}

function paintBase(ctx: CanvasRenderingContext2D, b: Background, w: number, h: number) {
  if (b.type === 'solid') { ctx.fillStyle = b.c1; ctx.fillRect(0, 0, w, h); }
  else if (b.type === 'linear') { const a = ((b.angle - 90) * Math.PI) / 180; const cx = w / 2, cy = h / 2, len = (Math.abs(w * Math.cos(a)) + Math.abs(h * Math.sin(a))) / 2; const g = ctx.createLinearGradient(cx - Math.cos(a) * len, cy - Math.sin(a) * len, cx + Math.cos(a) * len, cy + Math.sin(a) * len); g.addColorStop(0, b.c1); g.addColorStop(1, b.c2); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
  else if (b.type === 'radial') { const g = ctx.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, Math.max(w, h) * 0.72); g.addColorStop(0, b.c1); g.addColorStop(1, b.c2); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
  else { ctx.fillStyle = b.c1; ctx.fillRect(0, 0, w, h); const blob = (x: number, y: number, r: number, color: string) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(color, 0.7)); g.addColorStop(1, rgba(color, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }; const rnd = mulberry32(b.seed || 7); const n = Math.max(2, Math.min(6, b.meshPoints || 4)); for (let i = 0; i < n; i++) { const col = i % 2 === 0 ? b.c2 : b.c3; blob(rnd() * w, rnd() * h, Math.max(w, h) * (0.3 + rnd() * 0.25), col); } }
}

function paintStyle(ctx: CanvasRenderingContext2D, style: BgStyle, b: Background, w: number, h: number, accents: { a1: string; a2: string }) {
  const rnd = mulberry32((b.seed || 7) ^ style.length * 7919);
  const dark = isDark(b.c1); const ink = dark ? '#ffffff' : '#15171c'; const min = Math.min(w, h);
  switch (style) {
    case 'studio': { const horizon = h * 0.66; const floor = ctx.createLinearGradient(0, horizon, 0, h); floor.addColorStop(0, rgba(ink, 0)); floor.addColorStop(1, rgba(ink, dark ? 0.05 : 0.07)); ctx.fillStyle = floor; ctx.fillRect(0, horizon, w, h - horizon); ctx.strokeStyle = rgba(ink, dark ? 0.06 : 0.08); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, horizon); ctx.lineTo(w, horizon); ctx.stroke(); const g = ctx.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, Math.max(w, h) * 0.5); g.addColorStop(0, rgba(ink, dark ? 0.07 : 0.55)); g.addColorStop(1, rgba(ink, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); vignette(ctx, w, h, dark ? 0.4 : 0.12); break; }
    case 'architectural': { ctx.save(); const col = rgba(ink, dark ? 0.05 : 0.06); ctx.fillStyle = col; ctx.fillRect(w * 0.08, 0, w * 0.16, h); ctx.fillRect(w * 0.78, h * 0.18, w * 0.06, h * 0.82); ctx.fillStyle = rgba(ink, dark ? 0.08 : 0.1); ctx.fillRect(0, h * 0.72, w, Math.max(2, h * 0.004)); ctx.strokeStyle = rgba(accents.a1, 0.35); ctx.lineWidth = Math.max(2, min * 0.004); ctx.beginPath(); ctx.arc(w * 0.86, h * 0.3, min * 0.16, Math.PI, 0); ctx.stroke(); ctx.restore(); break; }
    case 'abstract': { ctx.save(); const sphere = (x: number, y: number, r: number, c1: string, c2: string, alpha: number) => { const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, rgba(c1, alpha)); g.addColorStop(1, rgba(c2, alpha * 0.85)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }; sphere(w * 0.85, h * 0.22, min * 0.16, shade(accents.a1, 40), shade(accents.a1, -60), 0.85); sphere(w * 0.1, h * 0.82, min * 0.12, shade(accents.a2, 30), shade(accents.a2, -50), 0.7); sphere(w * 0.93, h * 0.85, min * 0.08, dark ? '#3a3f4a' : '#d8dde5', dark ? '#171a20' : '#aab2bf', 0.9); ctx.strokeStyle = rgba(accents.a2, 0.3); ctx.lineWidth = Math.max(3, min * 0.012); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-min * 0.1, h * 0.55); ctx.bezierCurveTo(w * 0.3, h * 0.35, w * 0.6, h * 0.75, w * 1.1, h * 0.42); ctx.stroke(); ctx.restore(); break; }
    case 'grid': { ctx.save(); const col = rgba(ink, dark ? 0.07 : 0.09); const step = Math.max(40, min / 14); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath(); for (let x = 0; x <= w; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, h); } for (let y = 0; y <= h; y += step) { ctx.moveTo(0, y); ctx.lineTo(w, y); } ctx.stroke(); ctx.strokeStyle = rgba(accents.a1, 0.3); ctx.lineWidth = 1.4; for (let i = 0; i < 5; i++) { const gx = Math.floor(rnd() * (w / step)) * step, gy = Math.floor(rnd() * (h / step)) * step; ctx.beginPath(); ctx.moveTo(gx - 6, gy); ctx.lineTo(gx + 6, gy); ctx.moveTo(gx, gy - 6); ctx.lineTo(gx, gy + 6); ctx.stroke(); } ctx.restore(); break; }
    case 'editorial': { ctx.save(); ctx.fillStyle = rgba(ink, dark ? 0.05 : 0.06); ctx.font = `700 ${min * 0.55}px "Space Grotesk", sans-serif`; ctx.textBaseline = 'alphabetic'; ctx.fillText(String((b.seed || 7) % 9 + 1).padStart(2, '0'), -min * 0.05, h * 0.98); ctx.strokeStyle = rgba(ink, dark ? 0.14 : 0.18); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(w * 0.07, h * 0.14); ctx.lineTo(w * 0.4, h * 0.14); ctx.stroke(); ctx.fillStyle = rgba(accents.a1, 0.85); ctx.fillRect(w * 0.07, h * 0.14 - 5, Math.max(8, min * 0.02), Math.max(8, min * 0.02)); ctx.restore(); break; }
    case 'tech': { ctx.save(); const col = rgba(ink, dark ? 0.1 : 0.12); const n = 14; const pts: [number, number][] = []; for (let i = 0; i < n; i++) pts.push([rnd() * w, rnd() * h]); ctx.strokeStyle = rgba(ink, dark ? 0.05 : 0.07); ctx.lineWidth = 1; ctx.beginPath(); for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]); if (d < min * 0.34) { ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[j][0], pts[j][1]); } } ctx.stroke(); for (const [x, y] of pts) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill(); } ctx.fillStyle = rgba(accents.a2, 0.5); for (let i = 0; i < 3; i++) { const [x, y] = pts[i * 3]; ctx.beginPath(); ctx.arc(x, y, 3.6, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); break; }
    case 'glass': { ctx.save(); const glass = (x: number, y: number, r: number) => { ctx.fillStyle = rgba('#ffffff', dark ? 0.05 : 0.35); ctx.strokeStyle = rgba('#ffffff', dark ? 0.12 : 0.6); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }; glass(w * 0.82, h * 0.24, min * 0.17); glass(w * 0.14, h * 0.76, min * 0.12); ctx.strokeStyle = rgba('#ffffff', dark ? 0.1 : 0.4); ctx.lineWidth = Math.max(2, min * 0.014); ctx.beginPath(); ctx.arc(w * 0.5, h * 1.05, min * 0.3, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); ctx.restore(); break; }
    default: break;
  }
}

function paintPattern(ctx: CanvasRenderingContext2D, b: Background, w: number, h: number) {
  const { pattern, patternOpacity, c1 } = b; if (pattern === 'none' || patternOpacity <= 0) return;
  const col = luminance(c1) > 0.5 ? '#191b21' : '#f2f0ea'; ctx.save(); ctx.globalAlpha = patternOpacity;
  if (pattern === 'dots') { ctx.fillStyle = col; for (let y = 13; y < h; y += 26) for (let x = 13; x < w; x += 26) { ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill(); } }
  else if (pattern === 'grid') { ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath(); for (let x = 0; x <= w; x += 48) { ctx.moveTo(x, 0); ctx.lineTo(x, h); } for (let y = 0; y <= h; y += 48) { ctx.moveTo(0, y); ctx.lineTo(w, y); } ctx.stroke(); }
  else if (pattern === 'diag') { ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.beginPath(); for (let i = -h; i < w; i += 16) { ctx.moveTo(i, h); ctx.lineTo(i + h, 0); } ctx.stroke(); }
  else if (pattern === 'rings') { ctx.strokeStyle = col; ctx.lineWidth = 1.2; for (let y = 85; y < h; y += 170) for (let x = 85; x < w; x += 170) { ctx.beginPath(); ctx.arc(x, y, 34, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, 66, 0, Math.PI * 2); ctx.stroke(); } }
  else if (pattern === 'noise') { let a = 1234567 >>> 0; const rnd = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; ctx.fillStyle = col; const count = Math.floor((w * h) / 550); for (let i = 0; i < count; i++) { ctx.globalAlpha = patternOpacity * rnd() * 0.7; ctx.fillRect(rnd() * w, rnd() * h, 1.1, 1.1); } }
  ctx.restore();
}

function paintLighting(ctx: CanvasRenderingContext2D, b: Background, w: number, h: number) {
  const lt = b.light?.type || 'none'; if (lt === 'none') return; const inten = b.light?.intensity ?? 0.5; const hi = '#ffffff'; ctx.save();
  const radial = (x: number, y: number, r: number, a: number) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(hi, a)); g.addColorStop(1, rgba(hi, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); };
  const linear = (x0: number, y0: number, x1: number, y1: number, a: number) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, rgba(hi, a)); g.addColorStop(1, rgba(hi, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); };
  if (lt === 'top') linear(0, 0, 0, h * 0.6, 0.16 * inten); else if (lt === 'bottom') linear(0, h, 0, h * 0.4, 0.14 * inten); else if (lt === 'left') linear(0, 0, w * 0.55, 0, 0.13 * inten); else if (lt === 'right') linear(w, 0, w * 0.45, 0, 0.13 * inten); else if (lt === 'center') radial(w / 2, h * 0.42, Math.max(w, h) * 0.5, 0.2 * inten); else if (lt === 'ambient') { radial(w * 0.2, h * 0.15, Math.max(w, h) * 0.45, 0.08 * inten); radial(w * 0.85, h * 0.85, Math.max(w, h) * 0.45, 0.06 * inten); }
  ctx.restore();
}

function vignette(ctx: CanvasRenderingContext2D, w: number, h: number, a: number) { const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }

export function bgThumb(b: Background, accents: { a1: string; a2: string }, size = 132): string { const c = document.createElement('canvas'); const ratio = 0.66; c.width = size; c.height = Math.round(size * ratio); const ctx = c.getContext('2d')!; renderBackground(ctx, b, c.width, c.height, accents); return c.toDataURL('image/jpeg', 0.82); }
export const lightLabel = (t: LightType) => t === 'none' ? 'None' : t === 'top' ? 'Top' : t === 'bottom' ? 'Riser' : t === 'left' ? 'Left' : t === 'right' ? 'Right' : t === 'center' ? 'Center' : 'Ambient';
