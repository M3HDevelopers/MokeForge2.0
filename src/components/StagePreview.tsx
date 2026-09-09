import { useEffect, useRef, useState, useCallback } from 'react';
import { useStudio } from '../store';
import { renderBackground } from '../backgrounds';
import { drawDecos } from '../decos';
import { DeviceFrame } from './DeviceFrame';
import { DEVICE_META, computeFit, deviceGeometry } from '../templates';
import type { Asset, DeviceLayer } from '../types';

const imgCache = new Map<string, HTMLImageElement>();
function loadImage(src: string): Promise<HTMLImageElement> {
  const hit = imgCache.get(src); if (hit) return Promise.resolve(hit);
  return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => { imgCache.set(src, img); resolve(img); }; img.onerror = () => reject(); img.src = src; });
}

export function StagePreview() {
  const project = useStudio(s => s.project)!;
  const zoom = useStudio(s => s.zoom);
  const setZoom = useStudio(s => s.setZoom);
  const selection = useStudio(s => s.selection);
  const setSelection = useStudio(s => s.setSelection);
  const update = useStudio(s => s.update);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, ox: 0, oy: 0 });

  const { w: cw, h: ch } = project.canvas;

  useEffect(() => {
    const onWheel = (e: WheelEvent) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(zoom * (e.deltaY > 0 ? 0.92 : 1.08)); } };
    const el = containerRef.current; if (el) { el.addEventListener('wheel', onWheel, { passive: false }); return () => el.removeEventListener('wheel', onWheel); }
  }, [zoom, setZoom]);

  const onDeviceDown = useCallback((id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelection({ kind: 'device', id });
    const d = project.devices.find(dd => dd.id === id); if (!d) return;
    setDragging(id); setDragStart({ x: e.clientX, y: e.clientY, ox: d.x, oy: d.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [project.devices, setSelection]);

  const onDeviceMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = (e.clientX - dragStart.x) / zoom; const dy = (e.clientY - dragStart.y) / zoom;
    update(p => ({ ...p, devices: p.devices.map(d => d.id === dragging ? { ...d, x: dragStart.ox + dx, y: dragStart.oy + dy } : d) }), false);
  }, [dragging, dragStart, zoom, update]);

  const onDeviceUp = useCallback(() => { if (dragging) { setDragging(null); } }, [dragging]);

  return (
    <div ref={containerRef} className="flex-1 overflow-auto workspace-bg flex items-center justify-center" onPointerMove={onDeviceMove} onPointerUp={onDeviceUp}>
      <div className="relative shadow-2xl" style={{ width: cw * zoom, height: ch * zoom }}>
        {/* Background canvas */}
        <BackgroundCanvas project={project} zoom={zoom} />
        {/* Back decorations */}
        <DecoCanvas project={project} zoom={zoom} depth="back" />
        {/* Devices */}
        {[...project.devices].sort((a, b) => (a.z ?? 0) - (b.z ?? 0)).map(d => d.visible && (
          <DevicePreview key={d.id} d={d} asset={project.assets.find(a => a.id === d.assetId)} accent={project.accents.a1} zoom={zoom} selected={selection?.id === d.id} onPointerDown={(e) => onDeviceDown(d.id, e)} />
        ))}
        {/* Front decorations */}
        <DecoCanvas project={project} zoom={zoom} depth="front" />
      </div>
    </div>
  );
}

function BackgroundCanvas({ project, zoom }: { project: any; zoom: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.width = project.canvas.w; c.height = project.canvas.h;
    const ctx = c.getContext('2d')!;
    renderBackground(ctx, project.background, project.canvas.w, project.canvas.h, project.accents);
  }, [project.background, project.accents, project.canvas.w, project.canvas.h]);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'auto' }} />;
}

function DecoCanvas({ project, zoom, depth }: { project: any; zoom: number; depth: 'back' | 'front' }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.width = project.canvas.w; c.height = project.canvas.h;
    const ctx = c.getContext('2d')!;
    drawDecos(ctx, project.decos || [], project.canvas.w, project.canvas.h, project.accents, depth);
  }, [project.decos, project.accents, project.canvas.w, project.canvas.h, depth]);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

function DevicePreview({ d, asset, accent, zoom, selected, onPointerDown }: { d: DeviceLayer; asset: Asset | undefined; accent: string; zoom: number; selected: boolean; onPointerDown: (e: React.PointerEvent) => void }) {
  const h = d.w / DEVICE_META[d.kind].aspect;
  const g = deviceGeometry(d.kind, d.w, h, d.radiusMul ?? 1);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!asset) { setLoaded(false); return; }
    loadImage(asset.dataUrl).then(img => { imgRef.current = img; setLoaded(true); }).catch(() => setLoaded(false));
  }, [asset]);

  const fit = asset && loaded ? computeFit(g, imgRef.current!.naturalWidth || asset.w, imgRef.current!.naturalHeight || asset.h, d.fit, d.zoom, d.panX, d.panY) : null;

  return (
    <div
      className={`absolute cursor-move ${selected ? 'sel-ring' : ''}`}
      style={{ left: d.x * zoom, top: d.y * zoom, width: d.w * zoom, height: h * zoom, transform: `rotate(${d.tilt}deg)`, transformOrigin: 'center center', opacity: d.opacity }}
      onPointerDown={onPointerDown}
    >
      <DeviceFrame kind={d.kind} color={d.color} w={d.w * zoom} h={h * zoom} part="back" url={d.url} radiusMul={d.radiusMul} material={d.material} reflection={d.reflection} />
      {/* Screen content */}
      <div className="absolute overflow-hidden" style={{ left: g.x * zoom, top: g.y * zoom, width: g.w * zoom, height: g.h * zoom, borderRadius: g.r * zoom }}>
        {asset && loaded && imgRef.current && fit ? (
          <img src={asset.dataUrl} alt="" className="absolute" style={{ left: fit.dx * zoom, top: fit.dy * zoom, width: fit.dw * zoom, height: fit.dh * zoom, filter: d.brightness !== 1 ? `brightness(${d.brightness})` : undefined }} draggable={false} />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#14161b' }}>
            <span className="text-[10px] text-white/30" style={{ fontFamily: 'var(--font-mono)' }}>+ add screenshot</span>
          </div>
        )}
      </div>
      <DeviceFrame kind={d.kind} color={d.color} w={d.w * zoom} h={h * zoom} part="front" url={d.url} radiusMul={d.radiusMul} material={d.material} reflection={d.reflection} />
    </div>
  );
}
