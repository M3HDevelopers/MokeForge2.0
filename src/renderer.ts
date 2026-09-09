import type { Asset, DeviceLayer, Project } from './types';
import { clamp, computeFit, DEVICE_META, deviceGeometry, luminance, SHADOWS, textOn } from './templates';

const imgCache = new Map<string, HTMLImageElement>();
function loadImage(src: string): Promise<HTMLImageElement> {
  const hit = imgCache.get(src);
  if (hit) return Promise.resolve(hit);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { imgCache.set(src, img); resolve(img); };
    img.onerror = () => reject(new Error('img load failed'));
    img.src = src;
  });
}

let fontsReady: Promise<unknown> | null = null;
function ensureFonts() {
  if (!fontsReady) {
    fontsReady = Promise.all([
      document.fonts.load('700 48px "Space Grotesk"'),
      document.fonts.load('400 20px "JetBrains Mono"'),
      document.fonts.load('500 14px "JetBrains Mono"'),
      document.fonts.load('500 16px "IBM Plex Sans"'),
    ]).catch(() => undefined);
  }
  return fontsReady;
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function shadeLocal(hex: string, amt: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const c = (v: number) => clamp(Math.round(v + amt), 0, 255);
  const r = c((n >> 16) & 255), g = c((n >> 8) & 255), b = c(n & 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

const aspectOf = (d: DeviceLayer) => DEVICE_META[d.kind].aspect;

function drawPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.fillStyle = '#14161b';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = -h; i < w; i += 14) { ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + h, y); }
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  const fs = clamp(w * 0.045, 10, 22);
  ctx.font = `500 ${fs}px "JetBrains Mono"`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('+ add screenshot', x + w / 2, y + h / 2);
  ctx.restore();
}

async function drawDevice(ctx: CanvasRenderingContext2D, d: DeviceLayer, asset: Asset | undefined, accent: string) {
  const h = d.w / aspectOf(d);
  const g = deviceGeometry(d.kind, d.w, h, d.radiusMul ?? 1);
  const sh = SHADOWS.find(s => s.id === d.shadow) ?? SHADOWS[1];

  ctx.save();
  ctx.globalAlpha = d.opacity ?? 1;
  ctx.translate(d.x + d.w / 2, d.y + h / 2);
  ctx.rotate((d.tilt * Math.PI) / 180);
  ctx.translate(-d.w / 2, -h / 2);

  const body = d.color;
  const applyShadow = () => {
    if (sh.alpha > 0) {
      ctx.shadowColor = sh.id === 'glow' ? accent + 'aa' : `rgba(0,0,0,${sh.alpha})`;
      ctx.shadowBlur = sh.blur; ctx.shadowOffsetX = sh.dx; ctx.shadowOffsetY = sh.dy;
    }
  };
  const clearShadow = () => { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; };

  if (d.kind === 'laptop') {
    const baseH = h * 0.062, lidH = h - baseH;
    applyShadow();
    ctx.fillStyle = body; rr(ctx, 0, 0, d.w, lidH, d.w * 0.02); ctx.fill();
    clearShadow();
    ctx.fillStyle = '#0b0c0f'; rr(ctx, g.x, g.y, g.w, g.h, g.r); ctx.fill();
    await drawScreen(ctx, g, d, asset);
    ctx.fillStyle = shadeLocal(body, -38);
    ctx.beginPath(); ctx.arc(d.w / 2, g.y / 2, Math.max(1.6, d.w * 0.004), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = shadeLocal(body, 26);
    rr(ctx, -d.w * 0.045, lidH, d.w * 1.09, baseH * 0.55, baseH * 0.3); ctx.fill();
    ctx.fillStyle = shadeLocal(body, -12);
    rr(ctx, -d.w * 0.045, lidH + baseH * 0.5, d.w * 1.09, baseH * 0.5, baseH * 0.3); ctx.fill();
    ctx.fillStyle = shadeLocal(body, -30);
    rr(ctx, d.w / 2 - d.w * 0.07, lidH, d.w * 0.14, baseH * 0.32, baseH * 0.16); ctx.fill();
  } else if (d.kind === 'phone') {
    applyShadow();
    ctx.fillStyle = body; rr(ctx, 0, 0, d.w, h, d.w * 0.13 * (d.radiusMul ?? 1)); ctx.fill();
    clearShadow();
    ctx.fillStyle = '#0b0c0f'; rr(ctx, g.x, g.y, g.w, g.h, g.r); ctx.fill();
    await drawScreen(ctx, g, d, asset);
    ctx.fillStyle = '#0b0c0f'; ctx.strokeStyle = '#26282e'; ctx.lineWidth = 1;
    rr(ctx, d.w / 2 - g.w * 0.15, g.y + g.h * 0.022, g.w * 0.3, g.h * 0.03, g.h * 0.015); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    rr(ctx, d.w / 2 - g.w * 0.18, g.y + g.h * 0.965, g.w * 0.36, Math.max(3, h * 0.005), 2); ctx.fill();
  } else if (d.kind === 'tablet') {
    applyShadow();
    ctx.fillStyle = body; rr(ctx, 0, 0, d.w, h, d.w * 0.035 * (d.radiusMul ?? 1)); ctx.fill();
    clearShadow();
    ctx.fillStyle = '#0b0c0f'; rr(ctx, g.x, g.y, g.w, g.h, g.r); ctx.fill();
    await drawScreen(ctx, g, d, asset);
    ctx.fillStyle = shadeLocal(body, -38);
    ctx.beginPath(); ctx.arc(d.w / 2, g.y / 2, Math.max(1.8, d.w * 0.0045), 0, Math.PI * 2); ctx.fill();
  } else if (d.kind === 'browser') {
    const light = luminance(body) > 0.5;
    const chromeH = g.y;
    applyShadow();
    ctx.fillStyle = body; rr(ctx, 0, 0, d.w, h, d.w * 0.02); ctx.fill();
    clearShadow();
    ctx.fillStyle = light ? '#fbfbfc' : '#15171b';
    rr(ctx, g.x, g.y, g.w, g.h, g.r); ctx.fill();
    await drawScreen(ctx, g, d, asset);
    const dotR = Math.max(3, chromeH * 0.12), cy = chromeH / 2;
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(chromeH * 0.55 + i * dotR * 2.6, cy, dotR, 0, Math.PI * 2); ctx.fill(); });
    const pw = d.w * 0.38, px = (d.w - pw) / 2;
    ctx.fillStyle = light ? '#e9ebef' : '#2c313a';
    rr(ctx, px, cy - chromeH * 0.27, pw, chromeH * 0.54, chromeH * 0.27); ctx.fill();
    ctx.fillStyle = light ? '#6b7280' : '#9aa1ad';
    ctx.font = `500 ${Math.max(9, chromeH * 0.3)}px "JetBrains Mono"`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(d.url || 'yourapp.com', d.w / 2, cy + 0.5, pw * 0.9);
  } else if (d.kind === 'monitor') {
    const standH = h * 0.15, screenH = h - standH;
    applyShadow();
    ctx.fillStyle = body; rr(ctx, 0, 0, d.w, screenH, d.w * 0.012); ctx.fill();
    clearShadow();
    ctx.fillStyle = '#0b0c0f'; rr(ctx, g.x, g.y, g.w, g.h, g.r); ctx.fill();
    await drawScreen(ctx, g, d, asset);
    ctx.fillStyle = shadeLocal(body, -30);
    ctx.beginPath(); ctx.arc(d.w / 2, screenH - (screenH - g.y - g.h) / 2, Math.max(1.6, d.w * 0.004), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = shadeLocal(body, -16);
    ctx.beginPath();
    ctx.moveTo(d.w * 0.465, screenH);
    ctx.lineTo(d.w * 0.535, screenH);
    ctx.lineTo(d.w * 0.55, screenH + standH * 0.72);
    ctx.lineTo(d.w * 0.45, screenH + standH * 0.72);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = shadeLocal(body, -6);
    rr(ctx, d.w / 2 - d.w * 0.12, screenH + standH * 0.72, d.w * 0.24, standH * 0.2, standH * 0.1); ctx.fill();
  }
  ctx.restore();
}

async function drawScreen(ctx: CanvasRenderingContext2D, g: { x: number; y: number; w: number; h: number; r: number }, d: DeviceLayer, asset: Asset | undefined) {
  ctx.save();
  rr(ctx, g.x, g.y, g.w, g.h, g.r);
  ctx.clip();
  if (asset) {
    try {
      const img = await loadImage(asset.dataUrl);
      const f = computeFit(g, img.naturalWidth || asset.w, img.naturalHeight || asset.h, d.fit, d.zoom, d.panX, d.panY);
      ctx.drawImage(img, f.dx, f.dy, f.dw, f.dh);
    } catch { drawPlaceholder(ctx, g.x, g.y, g.w, g.h); }
  } else {
    drawPlaceholder(ctx, g.x, g.y, g.w, g.h);
  }
  const br = d.brightness ?? 1;
  if (Math.abs(br - 1) > 0.02) {
    if (br > 1) { ctx.fillStyle = `rgba(255,255,255,${clamp((br - 1) * 0.9, 0, 0.6)})`; }
    else { ctx.fillStyle = `rgba(0,0,0,${clamp((1 - br) * 0.9, 0, 0.7)})`; }
    ctx.fillRect(g.x, g.y, g.w, g.h);
  }
  ctx.restore();
}

function drawTextBlock(ctx: CanvasRenderingContext2D, p: Project) {
  const t = p.text;
  if (!t.enabled || (!t.title && !t.subtitle)) return;
  const { w: cw, h: ch } = p.canvas;
  const M = Math.round(Math.min(cw, ch) * 0.055);
  const ts = clamp(cw * 0.037, 24, 58) * t.scale;
  const color = t.autoColor ? textOn(p.background.c1) : t.color;

  ctx.save();
  ctx.font = `700 ${ts}px "Space Grotesk", sans-serif`;
  const pos = t.position;
  const bx = pos.includes('left') ? M : pos.includes('right') ? cw - M - 400 : (cw - 400) / 2;
  const by = pos.startsWith('top') ? M : pos.startsWith('bottom') ? ch - M - ts * 2 : (ch - ts * 2) / 2;
  const align = pos.includes('left') ? 'left' : pos.includes('right') ? 'right' : 'center';
  const ax = align === 'left' ? bx : align === 'right' ? bx + 400 : bx + 200;
  if (t.title) {
    ctx.font = `700 ${ts}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = color; ctx.textAlign = align as CanvasTextAlign; ctx.textBaseline = 'top';
    ctx.fillText(t.title, ax, by);
  }
  if (t.subtitle) {
    ctx.font = `400 ${ts * 0.34}px "JetBrains Mono", monospace`;
    ctx.fillStyle = color; ctx.globalAlpha = 0.72;
    ctx.fillText(t.subtitle.toUpperCase(), ax, by + ts * 1.1);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

export async function renderProject(p: Project, opts: { scale?: number; transparent?: boolean } = {}): Promise<HTMLCanvasElement> {
  await ensureFonts();
  const scale = opts.scale ?? 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(p.canvas.w * scale);
  canvas.height = Math.round(p.canvas.h * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);
  ctx.imageSmoothingQuality = 'high';

  const transparent = !!opts.transparent;
  if (!transparent) {
    ctx.fillStyle = p.background.c1;
    ctx.fillRect(0, 0, p.canvas.w, p.canvas.h);
  }

  const sorted = [...p.devices].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
  for (const d of sorted) {
    if (!d.visible) continue;
    await drawDevice(ctx, d, p.assets.find(a => a.id === d.assetId), p.accents.a1);
  }

  drawTextBlock(ctx, p);
  return canvas;
}

export async function makeThumbnail(p: Project, maxW = 560): Promise<string> {
  const scale = Math.min(1, maxW / p.canvas.w);
  const canvas = await renderProject(p, { scale });
  return canvas.toDataURL('image/jpeg', 0.78);
}

export async function exportBlob(p: Project, opts: { format: 'png' | 'jpeg' | 'webp'; quality: number; scale: number; targetW: number; targetH: number; transparent: boolean }): Promise<Blob> {
  const src = await renderProject(p, { scale: opts.scale, transparent: opts.transparent && opts.format !== 'jpeg' });
  let out = src;
  if (opts.targetW > 0 && opts.targetH > 0 && (opts.targetW !== src.width || opts.targetH !== src.height)) {
    out = document.createElement('canvas');
    out.width = opts.targetW; out.height = opts.targetH;
    const ctx = out.getContext('2d')!;
    if (!opts.transparent || opts.format === 'jpeg') { ctx.fillStyle = p.background.c1; ctx.fillRect(0, 0, out.width, out.height); }
    const sc = Math.min(out.width / src.width, out.height / src.height);
    const dw = src.width * sc, dh = src.height * sc;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src, (out.width - dw) / 2, (out.height - dh) / 2, dw, dh);
  }
  return new Promise((resolve, reject) => {
    const mime = opts.format === 'png' ? 'image/png' : opts.format === 'webp' ? 'image/webp' : 'image/jpeg';
    out.toBlob(b => (b ? resolve(b) : reject(new Error('export failed'))), mime, opts.quality);
  });
}
