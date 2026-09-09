import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as RPointerEvent, DragEvent as RDragEvent } from 'react';
import { useStudio } from '../store';
import type { DeviceLayer, IconLayer as IconLayerType, Project } from '../types';
import { clamp, computeFit, deviceGeometry, DEVICE_META, luminance, textOn, DECO_PRESETS } from '../templates';
import { renderBackground } from '../backgrounds';
import { drawDecos } from '../decos';
import { DeviceFrame } from './DeviceFrame';
import { ICONS } from '../iconLibrary';
import { AdvancedGrid } from './AdvancedGrid';

export function bgStyle(b: any): CSSProperties {
  if (b.type === 'solid') return { background: b.c1 };
  if (b.type === 'linear') return { background: `linear-gradient(${b.angle}deg, ${b.c1}, ${b.c2})` };
  if (b.type === 'radial') return { background: `radial-gradient(120% 120% at 50% 42%, ${b.c1}, ${b.c2})` };
  return { background: `radial-gradient(70% 70% at 82% 16%, ${b.c2}77, transparent 70%), radial-gradient(65% 65% at 14% 88%, ${b.c3}6e, transparent 70%), ${b.c1}` };
}

function PaintCanvas({ p, depth }: { p: Project; depth: 'front' | 'all' }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    if (depth === 'all') {
      renderBackground(ctx, p.background, p.canvas.w, p.canvas.h, p.accents).then(() => {
        drawDecos(ctx, p.decos, p.canvas.w, p.canvas.h, p.accents, 'back');
      });
    } else {
      drawDecos(ctx, p.decos, p.canvas.w, p.canvas.h, p.accents, 'front');
    }
  }, [p.background, p.decos, p.accents, p.canvas.w, p.canvas.h, depth]);
  return (
    <canvas
      ref={ref}
      width={p.canvas.w}
      height={p.canvas.h}
      className="absolute inset-0"
      style={{ width: p.canvas.w, height: p.canvas.h, pointerEvents: 'none' }}
    />
  );
}

function ScreenImage({ d, dataUrl, iw, ih }: { d: DeviceLayer; dataUrl: string; iw: number; ih: number }) {
  const h = d.w / DEVICE_META[d.kind].aspect;
  const g = deviceGeometry(d.kind, d.w, h, d.radiusMul);
  const f = computeFit(g, iw, ih, d.fit, d.zoom, d.panX, d.panY);
  const filter = Math.abs((d.brightness ?? 1) - 1) > 0.02
    ? `brightness(${d.brightness})` : undefined;
  
  return (
    <div 
      className="absolute overflow-hidden" 
      style={{ 
        left: g.x, 
        top: g.y, 
        width: g.w, 
        height: g.h, 
        borderRadius: g.r,
        clipPath: `inset(0 round ${g.r}px)`,
      }}
    >
      <img
        src={dataUrl} 
        alt="" 
        draggable={false}
        className="absolute select-none"
        style={{
          position: 'absolute',
          left: f.dx - g.x,
          top: f.dy - g.y,
          width: f.dw,
          height: f.dh,
          pointerEvents: 'none',
          filter,
          opacity: d.opacity ?? 1,
        }}
      />
    </div>
  );
}

function PlaceholderScreen({ d, highlight }: { d: DeviceLayer; highlight: boolean }) {
  const h = d.w / DEVICE_META[d.kind].aspect;
  const g = deviceGeometry(d.kind, d.w, h, d.radiusMul);
  return (
    <div
      className="absolute flex items-center justify-center transition-colors"
      style={{
        left: g.x, top: g.y, width: g.w, height: g.h, borderRadius: g.r,
        background: highlight ? 'rgba(255,107,61,0.28)' : 'repeating-linear-gradient(45deg, #14161b 0 10px, #171a20 10px 20px)',
      }}
    >
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: clamp(g.w * 0.045, 10, 22), color: highlight ? '#ffd9c4' : 'rgba(255,255,255,0.32)' }}>
        {highlight ? 'release to place' : '+ add screenshot'}
      </span>
    </div>
  );
}

function TextOverlay({ p }: { p: Project }) {
  const t = p.text;
  if (!t) return null;
  
  if (!t.enabled || (!t.title && !t.subtitle && !(t.showBadges && t.badges.length))) return null;
  
  const { w: cw, h: ch } = p.canvas;
  const M = Math.round(Math.min(cw, ch) * 0.055);
  const ts = clamp(cw * 0.037, 24, 58) * t.scale;
  const k = clamp(ts / 40, 0.7, 1.4);
  const color = t.autoColor ? textOn(p.background.c1) : t.color;
  
  const align = t.position.includes('left') ? 'flex-start' : t.position.includes('right') ? 'flex-end' : 'center';
  const justify = t.position.startsWith('top') ? 'flex-start' : t.position.startsWith('bottom') ? 'flex-end' : 'center';
  const lightText = luminance(color) > 0.5;
  
  return (
    <div className="absolute inset-0 flex flex-col pointer-events-none" style={{ padding: M, alignItems: align, justifyContent: justify }}>
      <div className="flex flex-col pointer-events-auto" style={{ alignItems: align }}>
        {t.title && (
          <div style={{ fontFamily: 'var(--font-disp)', fontWeight: 700, fontSize: ts, lineHeight: 1.1, color, textAlign: align === 'center' ? 'center' : align === 'flex-end' ? 'right' : 'left' }}>
            {t.title}
          </div>
        )}
        {t.subtitle && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: ts * 0.34, letterSpacing: 1.6 * k, textTransform: 'uppercase', color, opacity: 0.72, marginTop: t.title ? ts * 0.34 : 0 }}>
            {t.subtitle}
          </div>
        )}
        {t.showBadges && t.badges.length > 0 && (
          <div className="flex flex-wrap gap-[8px]" style={{ marginTop: (t.title || t.subtitle) ? ts * 0.42 : 0, justifyContent: align === 'center' ? 'center' : align }}>
            {t.badges.map(b => (
              <span key={b} style={{
                fontFamily: 'var(--font-mono)', fontSize: 12.5 * k, color,
                padding: `${5 * k}px ${12 * k}px`, borderRadius: 999,
                background: lightText ? 'rgba(255,255,255,0.1)' : 'rgba(21,23,28,0.07)',
                border: `1px solid ${lightText ? 'rgba(255,255,255,0.18)' : 'rgba(21,23,28,0.16)'}`,
              }}>{b}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LogoOverlay({ p }: { p: Project }) {
  if (!p.logo.enabled || !p.logo.assetId) return null;
  const asset = p.assets.find(a => a.id === p.logo.assetId);
  if (!asset) return null;
  const M = Math.round(Math.min(p.canvas.w, p.canvas.h) * 0.055);
  const lw = p.logo.size * p.canvas.w;
  const lh = lw * (asset.h / asset.w);
  const pos = p.logo.position;
  const x = pos.includes('left') ? M : pos.includes('right') ? p.canvas.w - M - lw : (p.canvas.w - lw) / 2;
  const y = pos.startsWith('top') ? M : pos.startsWith('bottom') ? p.canvas.h - M - lh : (p.canvas.h - lh) / 2;
  return (
    <img
      src={asset.dataUrl} alt="logo" draggable={false}
      className="absolute cursor-default"
      style={{ left: x, top: y, width: lw, height: lh, opacity: p.logo.opacity }}
    />
  );
}

function DeviceNode({ d, onDragStart, onDragEnd }: {
  d: DeviceLayer;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const p = useStudio(s => s.project)!;
  const selected = useStudio(s => s.selection?.kind === 'device' && s.selection.id === d.id);
  const setSelection = useStudio(s => s.setSelection);
  const update = useStudio(s => s.update);
  const checkpoint = useStudio(s => s.checkpoint);
  const zoom = useStudio(s => s.zoom);
  const assignAsset = useStudio(s => s.assignAsset);
  const [dropHot, setDropHot] = useState(false);
  const asset = p.assets.find(a => a.id === d.assetId);
  const h = d.w / DEVICE_META[d.kind].aspect;
  const dragRef = useRef<{ mode: 'move' | 'resize'; sx: number; sy: number; ox: number; oy: number; ow: number } | null>(null);

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setSelection({ kind: 'device', id: d.id });
    checkpoint();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { mode: 'move', sx: e.clientX, sy: e.clientY, ox: d.x, oy: d.y, ow: d.w };
    onDragStart();
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = (e.clientX - drag.sx) / zoom;
    const dy = (e.clientY - drag.sy) / zoom;
    if (drag.mode === 'move') {
      update(dd => ({ ...dd, devices: dd.devices.map(x => x.id === d.id ? { ...x, x: drag.ox + dx, y: drag.oy + dy } : x) }), false);
    } else if (drag.mode === 'resize') {
      const nw = clamp(drag.ow + dx, 90, p.canvas.w * 1.1);
      update(dd => ({ ...dd, devices: dd.devices.map(x => x.id === d.id ? { ...x, w: nw } : x) }), false);
    }
  };
  const onUp = () => { dragRef.current = null; onDragEnd(); };

  const onDrop = (e: RDragEvent) => {
    e.preventDefault();
    setDropHot(false);
    const assetId = e.dataTransfer.getData('text/asset-id');
    if (assetId) assignAsset(d.id, assetId);
  };

  return (
    <div
      className="absolute cursor-move"
      style={{ 
        left: d.x, 
        top: d.y, 
        width: d.w, 
        height: h, 
        transform: `rotate(${d.tilt}deg)`, 
        display: d.visible ? undefined : 'none', 
        opacity: d.opacity ?? 1,
        zIndex: d.z ?? p.devices.indexOf(d)
      }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      onDragOver={(e) => { e.preventDefault(); setDropHot(true); }}
      onDragLeave={() => setDropHot(false)}
      onDrop={onDrop}
    >
      <DeviceFrame kind={d.kind} color={d.color} w={d.w} h={h} part="back" url={d.url} radiusMul={d.radiusMul} material={d.material} reflection={d.reflection} />
      {asset
        ? <ScreenImage d={d} dataUrl={asset.dataUrl} iw={asset.w} ih={asset.h} />
        : <PlaceholderScreen d={d} highlight={dropHot} />}
      <DeviceFrame kind={d.kind} color={d.color} w={d.w} h={h} part="front" url={d.url} radiusMul={d.radiusMul} material={d.material} reflection={d.reflection} />

      {selected && (
        <>
          <svg className="absolute pointer-events-none" style={{ left: -7, top: -7, width: d.w + 14, height: h + 14, zIndex: 50 }}>
            <rect className="sel-ring-svg" x={1} y={1} width={d.w + 12} height={h + 12} rx={8} />
          </svg>
          <div
            className="absolute"
            style={{ right: -8, bottom: -8, width: 15, height: 15, background: 'var(--color-acc)', border: '2.5px solid #101114', borderRadius: 5, cursor: 'nwse-resize', zIndex: 100 }}
            onPointerDown={(e) => {
              e.stopPropagation();
              checkpoint();
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              dragRef.current = { mode: 'resize', sx: e.clientX, sy: e.clientY, ox: d.x, oy: d.y, ow: d.w };
            }}
          />
        </>
      )}
    </div>
  );
}

export function StagePreview() {
  const p = useStudio(s => s.project)!;
  const zoom = useStudio(s => s.zoom);
  const setZoom = useStudio(s => s.setZoom);
  const setSelection = useStudio(s => s.setSelection);
  const selection = useStudio(s => s.selection);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom(zoom * (e.deltaY < 0 ? 1.08 : 0.92));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoom, setZoom]);

  const W = p.canvas.w * zoom, H = p.canvas.h * zoom;
  const sorted = [...p.devices].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));

  return (
    <div 
      ref={wrapRef} 
      className="workspace-bg relative flex-1 overflow-auto noise-overlay" 
      style={{ touchAction: 'none' }}
    >
      <div className="flex items-start justify-center p-6 pt-8 relative z-10" style={{ width: '100%', minHeight: '100%', minWidth: 'fit-content' }}>
        <div
          className={`relative shadow-[0_30px_90px_rgba(0,0,0,0.55)] ${selection?.kind === 'background' ? 'sel-ring' : ''}`}
          style={{ width: W, height: H }}
          onClick={() => setSelection({ kind: 'background' })}
        >
          <div className="absolute top-0 left-0 origin-top-left overflow-hidden" style={{ width: p.canvas.w, height: p.canvas.h, transform: `scale(${zoom})` }}>
            <PaintCanvas p={p} depth="all" />
            {sorted.map(d => <DeviceNode key={d.id} d={d} onDragStart={() => setIsDragging(true)} onDragEnd={() => setIsDragging(false)} />)}
            <PaintCanvas p={p} depth="front" />
            <LogoOverlay p={p} />
            <TextOverlay p={p} />

            {p.devices.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="px-6 py-4 text-center" style={{ border: '1.5px dashed rgba(255,255,255,0.25)', borderRadius: 12 }}>
                  <div style={{ fontFamily: 'var(--font-disp)', fontWeight: 600, fontSize: 20, color: textOn(p.background.c1) }}>Canvas is empty</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: textOn(p.background.c1), opacity: 0.6, marginTop: 4 }}>add a device from the left panel</div>
                </div>
              </div>
            )}
          </div>

          <div className="absolute -bottom-7 left-0 flex items-center gap-2" style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--color-dim)' }}>
            <span>{p.canvas.w} × {p.canvas.h}</span>
            <span style={{ color: '#3a3f4b' }}>·</span>
            <span>{p.devices.length} device{p.devices.length === 1 ? '' : 's'}</span>
            <span style={{ color: '#3a3f4b' }}>·</span>
            <span>{Math.round(zoom * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
