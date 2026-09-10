import { useEffect, useRef, useState } from 'react';
import { useStudio } from '../store';
import { exportBlob, renderProject } from '../renderer';
import { clamp, EXPORT_PRESETS } from '../templates';
import { Seg, SliderRow, Toggle } from './ui';
import { IcCheck, IcClose, IcCopy, IcDownload, IcSpin } from '../icons';

type Format = 'png' | 'jpeg' | 'webp';

export function ExportModal() {
  const project = useStudio(s => s.project)!;
  const open = useStudio(s => s.exportOpen);
  const setOpen = useStudio(s => s.setExportOpen);
  const trackExport = useStudio(s => s.trackExport);
  const toast = useStudio(s => s.toast);

  const [format, setFormat] = useState<Format>('png');
  const [quality, setQuality] = useState(0.92);
  const [scale, setScale] = useState<1 | 2 | 3>(2);
  const [presetId, setPresetId] = useState('original');
  const [transparent, setTransparent] = useState(false);
  const [name, setName] = useState('');
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { 
    if (open) {
      setName(project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, project.name]);

  useEffect(() => {
    if (!open) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const c = await renderProject(project, { scale: clamp(420 / project.canvas.w, 0.05, 0.5), transparent: transparent && format !== 'jpeg' });
        setPreview(c.toDataURL('image/jpeg', 0.8));
      } catch { /* preview best-effort */ }
    }, 180);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [open, project, format, transparent]);

  if (!open) return null;
  const preset = EXPORT_PRESETS.find(p => p.id === presetId)!;
  const ext = format === 'jpeg' ? 'jpg' : format;

  const doExport = async (copy = false) => {
    setBusy(true);
    try {
      const renderScale = presetId === 'original' ? scale : clamp(Math.max(preset.w / project.canvas.w, preset.h / project.canvas.h), 1, 3);
      const targetW = presetId === 'original' ? project.canvas.w * scale : preset.w;
      const targetH = presetId === 'original' ? project.canvas.h * scale : preset.h;
      const blob = await exportBlob(project, { format, quality, scale: renderScale, targetW, targetH, transparent });
      if (copy) {
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
        toast('Copied to clipboard');
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${name || 'mockup'}-${preset.id}-${targetW}x${targetH}.${ext}`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        toast(`Exported ${targetW}×${targetH} ${ext.toUpperCase()}`);
      }
      trackExport();
    } catch {
      toast('Export failed — try a smaller scale', 'err');
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center anim-fade-in" style={{ background: 'rgba(8,9,11,0.78)', backdropFilter: 'blur(4px)' }} onPointerDown={() => setOpen(false)}>
      <div className="anim-pop w-[780px] max-w-[94vw] rounded-xl border border-line bg-panel shadow-[0_40px_120px_rgba(0,0,0,0.6)] overflow-hidden" onPointerDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line2">
          <div>
            <div className="font-semibold text-[15px]" style={{ fontFamily: 'var(--font-disp)' }}>Export</div>
            <div className="text-[10.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>{project.name} · {project.canvas.w}×{project.canvas.h}</div>
          </div>
          <button className="icon-btn" onClick={() => setOpen(false)}><IcClose size={16} /></button>
        </div>

        <div className="flex">
          <div className="flex-1 checker p-6 flex items-center justify-center" style={{ minHeight: 380 }}>
            {preview
              ? <img src={preview} alt="preview" className="max-w-full max-h-[340px] rounded-md shadow-[0_18px_50px_rgba(0,0,0,0.5)] anim-fade-in" />
              : <IcSpin size={22} />}
          </div>

          <div className="w-[320px] border-l border-line2 bg-ink p-4 space-y-4">
            <div>
              <div className="label-mono mb-1.5">Format</div>
              <Seg
                options={[{ id: 'png', label: 'PNG' }, { id: 'jpeg', label: 'JPG' }, { id: 'webp', label: 'WebP' }] as { id: Format; label: string }[]}
                value={format} onChange={(v) => setFormat(v as Format)}
              />
            </div>

            {format !== 'png' && (
              <SliderRow label="Quality" value={Math.round(quality * 100)} min={50} max={100} fmt={v => `${v}%`} onChange={v => setQuality(v / 100)} />
            )}

            <div>
              <div className="label-mono mb-1.5">Resolution</div>
              <Seg
                options={[{ id: '1', label: '1×' }, { id: '2', label: '2×' }, { id: '3', label: '3×' }]}
                value={String(scale) as '1' | '2' | '3'}
                onChange={(v) => setScale(parseInt(v) as 1 | 2 | 3)}
              />
            </div>

            <div>
              <div className="label-mono mb-1.5">Size preset</div>
              <div className="grid grid-cols-4 gap-1">
                {EXPORT_PRESETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPresetId(p.id)}
                    className="py-1.5 rounded-md border cursor-pointer transition-all"
                    style={{
                      borderColor: presetId === p.id ? 'var(--color-acc)' : 'var(--color-line)',
                      background: presetId === p.id ? 'rgba(255,107,61,0.12)' : 'var(--color-panel)',
                    }}
                  >
                    <div className="text-[10px] font-medium" style={{ color: presetId === p.id ? 'var(--color-acc)' : 'var(--color-fg)' }}>{p.label}</div>
                    <div className="text-[8.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>{p.w ? `${p.w}×${p.h}` : 'src'}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[12px] text-mut">Transparent background</span>
              <Toggle on={transparent && format !== 'jpeg'} onChange={setTransparent} />
            </div>

            <div>
              <div className="label-mono mb-1.5">File name</div>
              <div className="flex items-center gap-1">
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                <span className="text-[11px] shrink-0" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>.{ext}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button className="btn btn-acc flex-1 justify-center !py-2.5" disabled={busy} onClick={() => void doExport(false)}>
                {busy ? <IcSpin size={15} /> : <IcDownload size={15} />}
                {busy ? 'Rendering…' : 'Download'}
              </button>
              <button className="btn" disabled={busy || format === 'webp'} onClick={() => void doExport(true)} title="Copy PNG/JPG to clipboard">
                {copied ? <IcCheck size={15} /> : <IcCopy size={15} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
