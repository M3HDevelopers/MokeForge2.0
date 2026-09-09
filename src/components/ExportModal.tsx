import { useState } from 'react';
import { useStudio } from '../store';
import { EXPORT_PRESETS } from '../templates';
import { exportBlob } from '../renderer';
import { IcClose, IcDownload, IcSpin } from '../icons';

export function ExportModal() {
  const project = useStudio(s => s.project);
  const exportOpen = useStudio(s => s.exportOpen);
  const setExportOpen = useStudio(s => s.setExportOpen);
  const trackExport = useStudio(s => s.trackExport);
  const toast = useStudio(s => s.toast);
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState(0.92);
  const [scale, setScale] = useState(1);
  const [preset, setPreset] = useState(EXPORT_PRESETS[0]);
  const [transparent, setTransparent] = useState(false);
  const [exporting, setExporting] = useState(false);

  if (!exportOpen || !project) return null;

  const doExport = async () => {
    setExporting(true);
    try {
      const blob = await exportBlob(project, { format, quality, scale, targetW: preset.w, targetH: preset.h, transparent });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.${format === 'jpeg' ? 'jpg' : format}`;
      a.click(); URL.revokeObjectURL(url);
      trackExport();
      toast(`Exported as ${format.toUpperCase()}`);
      setExportOpen(false);
    } catch { toast('Export failed', 'err'); }
    setExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center anim-fade-in" style={{ background: 'rgba(8,9,11,0.78)', backdropFilter: 'blur(4px)' }} onPointerDown={() => setExportOpen(false)}>
      <div className="anim-pop w-[480px] max-w-[94vw] rounded-xl border border-line bg-panel shadow-[0_40px_120px_rgba(0,0,0,0.6)]" onPointerDown={(e) => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b border-line2 flex items-center justify-between">
          <div className="text-[17px] font-semibold" style={{ fontFamily: 'var(--font-disp)' }}>Export mockup</div>
          <button className="icon-btn" onClick={() => setExportOpen(false)}><IcClose size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <div className="label-mono mb-2">Format</div>
            <div className="flex gap-1.5">{(['png', 'jpeg', 'webp'] as const).map(f => (<button key={f} className={`chip ${format === f ? 'on' : ''}`} onClick={() => setFormat(f)}>{f.toUpperCase()}{f === 'jpeg' && ' (no alpha)'}</button>))}</div>
          </div>
          <div>
            <div className="label-mono mb-2">Size preset</div>
            <div className="grid grid-cols-3 gap-1.5 max-h-[180px] overflow-y-auto">{EXPORT_PRESETS.map(p => (<button key={p.id} onClick={() => setPreset(p)} className="py-1.5 rounded-lg border text-[10px] transition-all" style={{ borderColor: preset.id === p.id ? 'var(--color-acc)' : 'var(--color-line)', background: preset.id === p.id ? 'rgba(255,107,61,0.1)' : 'var(--color-ink)' }}><div className="font-medium" style={{ color: preset.id === p.id ? 'var(--color-acc)' : 'var(--color-fg)' }}>{p.label}</div><div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>{p.w ? `${p.w}×${p.h}` : 'Original'}</div></button>))}</div>
          </div>
          <div>
            <div className="label-mono mb-1">Scale: {scale}×</div>
            <input type="range" className="slider w-full" min={0.5} max={3} step={0.25} value={scale} style={{ '--fill': `${((scale - 0.5) / 2.5) * 100}%` } as React.CSSProperties} onChange={(e) => setScale(parseFloat(e.target.value))} />
          </div>
          {format !== 'jpeg' && (
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} className="accent-[var(--color-acc)]" /><span className="text-[12px]">Transparent background</span></label>
          )}
          {format !== 'png' && (
            <div>
              <div className="label-mono mb-1">Quality: {Math.round(quality * 100)}%</div>
              <input type="range" className="slider w-full" min={0.3} max={1} step={0.02} value={quality} style={{ '--fill': `${((quality - 0.3) / 0.7) * 100}%` } as React.CSSProperties} onChange={(e) => setQuality(parseFloat(e.target.value))} />
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-line2 flex justify-end gap-2">
          <button className="btn" onClick={() => setExportOpen(false)}>Cancel</button>
          <button className="btn btn-acc" onClick={doExport} disabled={exporting}>{exporting ? <IcSpin size={14} /> : <IcDownload size={14} />}{exporting ? 'Exporting…' : 'Export'}</button>
        </div>
      </div>
    </div>
  );
}
