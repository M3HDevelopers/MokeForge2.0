import type { DecoDepth, DecoLayer } from './types';
import { DECO_PRESETS, mulberry32, rgba, shade } from './templates';

/* =========================================================================
   Decoration renderer. Draws DecoLayer instances (from DECO_PRESETS) to a
   canvas. `depth` filters back vs front layers so devices can sit between
   them — real depth ordering. Shared by preview and export.
   ========================================================================= */

export function drawDecos(
  ctx: CanvasRenderingContext2D,
  decos: DecoLayer[],
  w: number,
  h: number,
  accents: { a1: string; a2: string },
  depth: DecoDepth,
): void {
  const min = Math.min(w, h);
  for (const d of decos || []) {
    if (d.depth !== depth) continue;
    const preset = DECO_PRESETS.find(p => p.id === d.preset);
    if (!preset) continue;
    const color = d.hue || (Math.floor(d.seed) % 2 === 0 ? accents.a1 : accents.a2);
    const x = d.x * w, y = d.y * h;
    const r = d.scale * min;
    const rnd = mulberry32(d.seed || 1);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((d.rotation * Math.PI) / 180);
    ctx.globalAlpha = d.opacity;
    if (d.blur > 0) ctx.filter = `blur(${d.blur}px)`;
    drawPrim(ctx, preset.prim, r, color, rnd);
    ctx.restore();
  }
}

function drawPrim(ctx: CanvasRenderingContext2D, prim: string, r: number, color: string, rnd: () => number) {
  switch (prim) {
    case 'disc': {
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'sphere': {
      const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
      g.addColorStop(0, shade(color, 60)); g.addColorStop(1, shade(color, -60));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'ring': {
      ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, r * 0.12);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
      break;
    }
    case 'orbit': {
      ctx.strokeStyle = rgba(color, 0.5); ctx.lineWidth = Math.max(1.5, r * 0.04);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(r, 0, Math.max(3, r * 0.12), 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'square': {
      ctx.fillStyle = color; ctx.fillRect(-r, -r, r * 2, r * 2);
      break;
    }
    case 'triangle': {
      ctx.fillStyle = color; ctx.beginPath();
      ctx.moveTo(0, -r); ctx.lineTo(r, r); ctx.lineTo(-r, r); ctx.closePath(); ctx.fill();
      break;
    }
    case 'line': {
      ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, r * 0.14); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke();
      break;
    }
    case 'arc': {
      ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, r * 0.12); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, r, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
      break;
    }
    case 'plus': {
      ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, r * 0.34); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke();
      break;
    }
    case 'dotgrid': {
      const step = r * 0.45; ctx.fillStyle = color;
      for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 5; gx++) {
        ctx.beginPath(); ctx.arc(-r + gx * step, -r + gy * step, Math.max(1.4, r * 0.07), 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'sparkle': {
      ctx.fillStyle = color; ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(r * 0.16, -r * 0.16, r, 0);
      ctx.quadraticCurveTo(r * 0.16, r * 0.16, 0, r);
      ctx.quadraticCurveTo(-r * 0.16, r * 0.16, -r, 0);
      ctx.quadraticCurveTo(-r * 0.16, -r * 0.16, 0, -r);
      ctx.fill();
      break;
    }
    case 'blob': {
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r * 1.2);
      g.addColorStop(0, rgba(shade(color, 50), 0.9)); g.addColorStop(1, rgba(color, 0.55));
      ctx.fillStyle = g; ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const t = (i / 40) * Math.PI * 2;
        const rad = r * (0.82 + 0.18 * Math.sin(t * 3 + rnd() * 6));
        const px = Math.cos(t) * rad, py = Math.sin(t) * rad;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      break;
    }
    case 'ribbon': {
      ctx.strokeStyle = color; ctx.lineWidth = Math.max(3, r * 0.16); ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-r, r * 0.4);
      ctx.bezierCurveTo(-r * 0.3, -r * 0.6, r * 0.3, r * 0.6, r, -r * 0.4);
      ctx.stroke();
      break;
    }
    case 'wave': {
      ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, r * 0.08); ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const px = -r + (i / 40) * r * 2;
        const py = Math.sin((i / 40) * Math.PI * 3) * r * 0.25;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
      break;
    }
    case 'cube': {
      const s = r * 0.9;
      ctx.fillStyle = shade(color, 20); ctx.fillRect(-s / 2, -s / 2, s, s);
      ctx.fillStyle = shade(color, -30);
      ctx.beginPath(); ctx.moveTo(s / 2, -s / 2); ctx.lineTo(s / 2 + s * 0.3, -s / 2 - s * 0.18); ctx.lineTo(s / 2 + s * 0.3, s / 2 - s * 0.18); ctx.lineTo(s / 2, s / 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = shade(color, -12);
      ctx.beginPath(); ctx.moveTo(-s / 2, -s / 2); ctx.lineTo(-s / 2 + s * 0.3, -s / 2 - s * 0.18); ctx.lineTo(s / 2 + s * 0.3, -s / 2 - s * 0.18); ctx.lineTo(s / 2, -s / 2); ctx.closePath(); ctx.fill();
      break;
    }
    case 'torus': {
      ctx.strokeStyle = shade(color, 25); ctx.lineWidth = r * 0.42;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = shade(color, -35); ctx.lineWidth = r * 0.2;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.7, Math.PI * 0.9, Math.PI * 1.9); ctx.stroke();
      break;
    }
    case 'pill': {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-r, -r * 0.32); ctx.arc(r * 0.4, -r * 0.32, r * 0.32, Math.PI, 0);
      ctx.lineTo(r * 0.72, r * 0.32); ctx.arc(r * 0.4, r * 0.32, r * 0.32, 0, Math.PI);
      ctx.closePath(); ctx.fill();
      break;
    }
    case 'glasscard': {
      const gw = r * 1.9, gh = r * 1.25;
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.2;
      ctx.beginPath();
      const rad = gw * 0.09;
      ctx.moveTo(-gw / 2 + rad, -gh / 2);
      ctx.arcTo(gw / 2, -gh / 2, gw / 2, gh / 2, rad);
      ctx.arcTo(gw / 2, gh / 2, -gw / 2, gh / 2, rad);
      ctx.arcTo(-gw / 2, gh / 2, -gw / 2, -gh / 2, rad);
      ctx.arcTo(-gw / 2, -gh / 2, gw / 2, -gh / 2, rad);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = rgba(color, 0.85); ctx.beginPath(); ctx.arc(-gw / 2 + gw * 0.16, -gh / 2 + gh * 0.28, gh * 0.09, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(-gw / 2 + gw * 0.28, -gh / 2 + gh * 0.24, gw * 0.4, gh * 0.07);
      ctx.fillRect(-gw / 2 + gw * 0.12, gh * 0.05, gw * 0.66, gh * 0.06);
      ctx.fillRect(-gw / 2 + gw * 0.12, gh * 0.2, gw * 0.44, gh * 0.06);
      break;
    }
    case 'uipanel': {
      const gw = r * 1.7, gh = r * 1.3;
      ctx.fillStyle = 'rgba(20,22,27,0.82)';
      ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1;
      ctx.fillRect(-gw / 2, -gh / 2, gw, gh); ctx.strokeRect(-gw / 2, -gh / 2, gw, gh);
      ctx.fillStyle = rgba(color, 0.9); ctx.fillRect(-gw / 2 + gw * 0.08, -gh / 2 + gh * 0.12, gw * 0.3, gh * 0.09);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(-gw / 2 + gw * 0.08, -gh / 2 + gh * 0.32, gw * 0.84, gh * 0.06);
      ctx.fillRect(-gw / 2 + gw * 0.08, -gh / 2 + gh * 0.46, gw * 0.6, gh * 0.06);
      const bars = [0.7, 0.45, 0.9, 0.55];
      bars.forEach((bv, i) => {
        ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.25)' : rgba(color, 0.75);
        ctx.fillRect(-gw / 2 + gw * 0.08 + i * gw * 0.22, gh / 2 - gh * 0.1 - gh * 0.34 * bv, gw * 0.14, gh * 0.34 * bv);
      });
      break;
    }
    case 'notification': {
      const gw = r * 1.8, gh = r * 0.62;
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.beginPath(); ctx.roundRect(-gw / 2, -gh / 2, gw, gh, gh * 0.3); ctx.fill();
      ctx.fillStyle = rgba(color, 1); ctx.beginPath(); ctx.arc(-gw / 2 + gh * 0.5, 0, gh * 0.24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3a3f47';
      ctx.fillRect(-gw / 2 + gh * 0.9, -gh * 0.18, gw * 0.5, gh * 0.12);
      ctx.fillStyle = '#9aa1ad';
      ctx.fillRect(-gw / 2 + gh * 0.9, gh * 0.04, gw * 0.34, gh * 0.1);
      break;
    }
    case 'chart': {
      const gw = r * 1.5, gh = r * 1.1;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
      ctx.fillRect(-gw / 2, -gh / 2, gw, gh); ctx.strokeRect(-gw / 2, -gh / 2, gw, gh);
      const vals = [0.4, 0.7, 0.5, 0.9, 0.62];
      vals.forEach((v, i) => {
        ctx.fillStyle = i === 3 ? rgba(color, 0.95) : rgba(color, 0.4);
        ctx.fillRect(-gw / 2 + gw * 0.12 + i * gw * 0.16, gh / 2 - gh * 0.14 - gh * 0.6 * v, gw * 0.1, gh * 0.6 * v);
      });
      break;
    }
    default: {
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    }
  }
}
