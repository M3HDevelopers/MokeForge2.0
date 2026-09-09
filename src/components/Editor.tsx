import { useCallback, useEffect, useRef, useState } from 'react';
import { useStudio } from '../store';
import { makeThumbnail } from '../renderer';
import { DEVICE_META, clamp, SHADOWS, FIT_MODES, MATERIALS, BG_PRESETS, PATTERNS, LIGHTING, POSITIONS } from '../templates';
import { IcArrowL, IcDice, IcDownload, IcExport, IcFit, IcRedo, IcSave, IcStar, IcUndo, IcUpload, IcWand, IcZoomIn, IcZoomOut, LogoMark, IcPlus, IcTrash, IcCopy, IcEye, IcEyeOff, IcUp, IcDown } from '../icons';
import type { DeviceKind } from '../types';

export function Editor() {
  const project = useStudio(s => s.project)!;
  const update = useStudio(s => s.update);
  const undo = useStudio(s => s.undo);
  const redo = useStudio(s => s.redo);
  const canUndo = useStudio(s => s.past.length > 0);
  const canRedo = useStudio(s => s.future.length > 0);
  const randomize = useStudio(s => s.randomize);
  const dirty = useStudio(s => s.dirty);
  const closeEditor = useStudio(s => s.closeEditor);
  const setExportOpen = useStudio(s => s.setExportOpen);
  const addFiles = useStudio(s => s.addFiles);
  const selection = useStudio(s => s.selection);
  const setSelection = useStudio(s => s.setSelection);
  const removeDevice = useStudio(s => s.removeDevice);
  const duplicateDevice = useStudio(s => s.duplicateDevice);
  const checkpoint = useStudio(s => s.checkpoint);
  const zoom = useStudio(s => s.zoom);
  const setZoom = useStudio(s => s.setZoom);
  const toast = useStudio(s => s.toast);
  const setGenOpen = useStudio(s => s.setGenOpen);
  const favorite = useStudio(s => s.favorite);
  const exportMockup = useStudio(s => s.exportMockup);
  const importMockup = useStudio(s => s.importMockup);
  const addDevice = useStudio(s => s.addDevice);
  const mockupRef = useRef<HTMLInputElement>(null);
  const [leftTab, setLeftTab] = useState<'devices' | 'screens' | 'bg' | 'text'>('devices');

  const saveNow = useCallback(async (silent = false) => {
    const p = useStudio.getState().project;
    if (!p) return;
    try {
      const thumb = await makeThumbnail(p);
      update(pp => ({ ...pp, thumbnail: thumb }), false);
    } catch { /* thumbnail best-effort */ }
    useStudio.getState().save(silent);
  }, [update]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
      else if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); void saveNow(false); }
      else if (mod && e.key.toLowerCase() === 'd') {
        if (selection?.kind === 'device' && selection.id) { e.preventDefault(); duplicateDevice(selection.id); }
      }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && selection?.kind === 'device' && selection.id) {
        e.preventDefault(); removeDevice(selection.id);
      }
      else if (e.key === 'Escape') setSelection(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, saveNow, selection, duplicateDevice, removeDevice, setSelection, checkpoint, update]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []).filter(f => f.type.startsWith('image/'));
      if (files.length) { e.preventDefault(); void addFiles(files); }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [addFiles]);

  const fitZoom = () => {
    const availW = window.innerWidth - 264 - 292 - 120;
    const availH = window.innerHeight - 48 - 70;
    setZoom(clamp(Math.min(availW / project.canvas.w, availH / project.canvas.h), 0.1, 2));
  };

  useEffect(() => { fitZoom(); }, []);

  const selectedDevice = selection?.kind === 'device' && selection.id ? project.devices.find(d => d.id === selection.id) : null;

  return (
    <div className="h-full flex flex-col anim-fade-in">
      {/* Top bar */}
      <div className="h-12 shrink-0 flex items-center gap-2 px-3 border-b border-line2 bg-panel relative z-20">
        <button className="icon-btn" onClick={closeEditor} title="Back to dashboard"><IcArrowL size={16} /></button>
        <LogoMark size={19} />
        <input
          className="bg-transparent outline-none border border-transparent hover:border-line focus:border-acc rounded-md px-2 py-1 transition-colors w-[220px]"
          style={{ fontFamily: 'var(--font-disp)', fontWeight: 600, fontSize: 14 }}
          value={project.name}
          onChange={(e) => update(p => ({ ...p, name: e.target.value }), false)}
          onFocus={() => checkpoint()}
        />
        <span className="flex items-center gap-1.5 text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: dirty ? 'var(--color-gold)' : 'var(--color-acc2)', animation: dirty ? 'pulseDot 1.4s infinite' : undefined }} />
          {dirty ? 'unsaved' : 'saved'}
        </span>

        <div className="flex-1" />

        <button className="icon-btn" disabled={!canUndo} onClick={undo} title="Undo (Ctrl+Z)"><IcUndo size={15} /></button>
        <button className="icon-btn" disabled={!canRedo} onClick={redo} title="Redo (Ctrl+Shift+Z)"><IcRedo size={15} /></button>

        <div className="w-px h-5 bg-line mx-1" />

        <button className="btn btn-acc" onClick={() => setGenOpen(true)} title="Design Engine">
          <IcWand size={14} />
          <span>Design Engine</span>
        </button>
        <button className="btn" onClick={randomize} title="Quick surprise">
          <IcDice size={14} />
          <span>Surprise</span>
        </button>
        <button className="btn" onClick={() => void saveNow(false)}>
          <IcSave size={14} />
          <span>Save</span>
        </button>
        <button className="btn" onClick={() => setExportOpen(true)}>
          <IcExport size={14} />
          <span>Export</span>
        </button>

        <div className="w-px h-5 bg-line mx-1" />
        <button className="icon-btn" title="Save to favorites" onClick={() => void favorite()}><IcStar size={15} /></button>
        <button className="icon-btn" title="Download .mockup project file" onClick={exportMockup}><IcDownload size={15} /></button>
        <button className="icon-btn" title="Import .mockup project file" onClick={() => mockupRef.current?.click()}><IcUpload size={15} /></button>
        <input
          ref={mockupRef} type="file" hidden accept=".json,application/json"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void importMockup(f); e.target.value = ''; }}
        />
      </div>

      {/* Body */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel */}
        <div className="w-[264px] shrink-0 border-r border-line2 bg-panel flex flex-col overflow-hidden">
          <div className="flex border-b border-line2">
            {(['devices', 'screens', 'bg', 'text'] as const).map(t => (
              <button key={t} className={`flex-1 py-2 text-[10px] uppercase tracking-wider ${leftTab === t ? 'text-acc bg-panel2' : 'text-dim hover:text-mut'}`} onClick={() => setLeftTab(t)}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {leftTab === 'devices' && (
              <>
                <div className="grid grid-cols-5 gap-1 mb-3">
                  {(Object.keys(DEVICE_META) as DeviceKind[]).map(k => (
                    <button key={k} className="icon-btn !w-full !h-9 flex-col gap-0.5 !rounded-lg border border-line text-[8px]" onClick={() => addDevice(k)}>
                      <span className="text-[9px]">{DEVICE_META[k].label.slice(0, 4)}</span>
                    </button>
                  ))}
                </div>
                {project.devices.map(d => (
                  <div key={d.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer mb-1 ${selection?.id === d.id ? 'bg-panel3 border border-acc' : 'hover:bg-panel2'}`} onClick={() => setSelection({ kind: 'device', id: d.id })}>
                    <span className="text-[11px] flex-1 truncate">{d.name}</span>
                    <button className="icon-btn !w-5 !h-5" onClick={(e) => { e.stopPropagation(); removeDevice(d.id); }}>×</button>
                  </div>
                ))}
              </>
            )}
            {leftTab === 'screens' && (
              <>
                <label className="btn w-full justify-center cursor-pointer mb-3">
                  <IcUpload size={14} />Upload images
                  <input type="file" hidden multiple accept="image/*" onChange={(e) => { if (e.target.files) void addFiles(e.target.files); }} />
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {project.assets.map(a => (
                    <div key={a.id} className="relative rounded-lg overflow-hidden border border-line aspect-video">
                      <img src={a.dataUrl} alt={a.name} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 px-1.5 py-0.5 bg-black/60 text-[8px] truncate">{a.name}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {leftTab === 'bg' && (
              <>
                <div className="grid grid-cols-4 gap-1 mb-3">
                  {BG_PRESETS.map(bp => (
                    <button key={bp.id} className="aspect-square rounded-lg border border-line overflow-hidden hover:border-acc transition-colors" onClick={() => update(p => ({ ...p, background: { ...bp.bg, seed: p.background.seed } }))}>
                      <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${bp.sw[0]}, ${bp.sw[1]})` }} />
                    </button>
                  ))}
                </div>
              </>
            )}
            {leftTab === 'text' && (
              <>
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input type="checkbox" checked={project.text.enabled} onChange={(e) => update(p => ({ ...p, text: { ...p.text, enabled: e.target.checked } }))} />
                  <span className="text-[11px]">Show text</span>
                </label>
                {project.text.enabled && (
                  <>
                    <input className="input mb-2" placeholder="Title" value={project.text.title} onChange={(e) => update(p => ({ ...p, text: { ...p.text, title: e.target.value } }))} />
                    <input className="input mb-2" placeholder="Subtitle" value={project.text.subtitle} onChange={(e) => update(p => ({ ...p, text: { ...p.text, subtitle: e.target.value } }))} />
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stage */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-auto workspace-bg flex items-center justify-center">
            <div className="relative shadow-2xl" style={{ width: project.canvas.w * zoom, height: project.canvas.h * zoom }}>
              {/* Background */}
              <div className="absolute inset-0" style={{ background: project.background.c1 }} />
              {/* Devices */}
              {[...project.devices].sort((a, b) => (a.z ?? 0) - (b.z ?? 0)).map(d => d.visible && (
                <div
                  key={d.id}
                  className={`absolute cursor-move ${selection?.id === d.id ? 'sel-ring' : ''}`}
                  style={{ left: d.x * zoom, top: d.y * zoom, width: d.w * zoom, height: (d.w / DEVICE_META[d.kind].aspect) * zoom, transform: `rotate(${d.tilt}deg)`, transformOrigin: 'center center', opacity: d.opacity }}
                  onClick={() => setSelection({ kind: 'device', id: d.id })}
                >
                  <div className="w-full h-full rounded-lg" style={{ background: d.color, border: `1px solid ${d.color}` }}>
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>
                      {d.assetId ? '✓' : '+ screenshot'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Status bar */}
          <div className="h-9 shrink-0 border-t border-line2 bg-panel flex items-center justify-between px-3">
            <span className="text-[10.5px] hidden md:block" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>
              drag to move · ctrl+scroll to zoom · ctrl+v paste screenshot
            </span>
            <div className="flex items-center gap-1">
              <button className="icon-btn !w-7 !h-7" onClick={() => setZoom(zoom * 0.85)}><IcZoomOut size={13} /></button>
              <span className="text-[10.5px] w-10 text-center" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-mut)' }}>{Math.round(zoom * 100)}%</span>
              <button className="icon-btn !w-7 !h-7" onClick={() => setZoom(zoom * 1.18)}><IcZoomIn size={13} /></button>
              <button className="icon-btn !w-7 !h-7" onClick={fitZoom} title="Fit to screen"><IcFit size={13} /></button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-[292px] shrink-0 border-l border-line2 bg-panel flex flex-col overflow-hidden">
          {selectedDevice ? (
            <>
              <div className="px-3.5 py-2.5 border-b border-line2">
                <div className="text-[12px] font-semibold" style={{ fontFamily: 'var(--font-disp)' }}>{selectedDevice.name}</div>
                <div className="text-[9px] mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>{DEVICE_META[selectedDevice.kind].label} · {Math.round(selectedDevice.w)}px wide</div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <div>
                  <div className="label-mono mb-1">Frame Color</div>
                  <div className="flex flex-wrap gap-1">
                    {DEVICE_META[selectedDevice.kind].colors.map(c => (
                      <button key={c.hex} className={`w-7 h-7 rounded-lg border-2 transition-all ${selectedDevice.color === c.hex ? 'border-acc scale-110' : 'border-line'}`} style={{ background: c.hex }} onClick={() => update(p => ({ ...p, devices: p.devices.map(dd => dd.id === selectedDevice.id ? { ...dd, color: c.hex } : dd) }))} title={c.name} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="label-mono mb-1">Shadow</div>
                  <div className="grid grid-cols-4 gap-1">
                    {SHADOWS.map(s => (
                      <button key={s.id} className={`py-1 rounded border text-[8px] transition-all ${selectedDevice.shadow === s.id ? 'border-acc bg-acc/10 text-acc' : 'border-line text-mut hover:text-fg'}`} onClick={() => update(p => ({ ...p, devices: p.devices.map(dd => dd.id === selectedDevice.id ? { ...dd, shadow: s.id } : dd) }))}>{s.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedDevice.visible} onChange={(e) => update(p => ({ ...p, devices: p.devices.map(dd => dd.id === selectedDevice.id ? { ...dd, visible: e.target.checked } : dd) }))} />
                    <span className="text-[11px]">Visible</span>
                  </label>
                </div>
                <div className="flex gap-1">
                  <button className="btn flex-1" onClick={() => duplicateDevice(selectedDevice.id)}><IcCopy size={12} />Duplicate</button>
                  <button className="btn flex-1" onClick={() => removeDevice(selectedDevice.id)}><IcTrash size={12} />Delete</button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-dim text-[11px]" style={{ fontFamily: 'var(--font-mono)' }}>Select a device to edit</div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {useStudio(s => s.exportOpen) && <ExportModal />}
      {/* Generate Panel */}
      {useStudio(s => s.genOpen) && <GeneratePanel />}
    </div>
  );
}

function ExportModal() {
  const setExportOpen = useStudio(s => s.setExportOpen);
  const toast = useStudio(s => s.toast);
  const project = useStudio(s => s.project);
  const trackExport = useStudio(s => s.trackExport);
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [exporting, setExporting] = useState(false);

  if (!project) return null;

  const doExport = async () => {
    setExporting(true);
    try {
      const { exportBlob } = await import('../renderer');
      const blob = await exportBlob(project, { format, quality: 0.92, scale: 1, targetW: 0, targetH: 0, transparent: false });
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
            <div className="flex gap-1.5">{(['png', 'jpeg', 'webp'] as const).map(f => (<button key={f} className={`chip ${format === f ? 'on' : ''}`} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>))}</div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-line2 flex justify-end gap-2">
          <button className="btn" onClick={() => setExportOpen(false)}>Cancel</button>
          <button className="btn btn-acc" onClick={doExport} disabled={exporting}>{exporting ? 'Exporting…' : 'Export'}</button>
        </div>
      </div>
    </div>
  );
}

function GeneratePanel() {
  const setGenOpen = useStudio(s => s.setGenOpen);
  const mood = useStudio(s => s.mood);
  const setMood = useStudio(s => s.setMood);
  const generate = useStudio(s => s.generate);
  const makeVariations = useStudio(s => s.makeVariations);
  const variations = useStudio(s => s.variations);
  const applyVariation = useStudio(s => s.applyVariation);
  const toast = useStudio(s => s.toast);

  const MOODS = ['auto', 'minimal', 'premium', 'creative', 'developer', 'dark', 'light', 'editorial', 'bold', 'elegant', 'futuristic', 'playful', 'corporate'] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center anim-fade-in" style={{ background: 'rgba(8,9,11,0.78)', backdropFilter: 'blur(4px)' }} onPointerDown={() => setGenOpen(false)}>
      <div className="anim-pop w-[640px] max-w-[94vw] max-h-[85vh] rounded-xl border border-line bg-panel shadow-[0_40px_120px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col" onPointerDown={(e) => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b border-line2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2"><IcWand size={18} className="text-acc" /><div className="text-[17px] font-semibold" style={{ fontFamily: 'var(--font-disp)' }}>Design Engine</div></div>
          <button className="icon-btn" onClick={() => setGenOpen(false)}><IcClose size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <div className="label-mono mb-2">Design mood</div>
            <div className="flex flex-wrap gap-1.5">{MOODS.map(m => (<button key={m} className={`chip ${mood === m ? 'on' : ''}`} onClick={() => setMood(m)}>{m}</button>))}</div>
          </div>
          <div>
            <div className="label-mono mb-2">Generate</div>
            <div className="flex flex-wrap gap-2">
              <button className="btn" onClick={() => generate('all')}>🎲 Surprise me</button>
              <button className="btn" onClick={() => generate('background')}>🎨 Background</button>
              <button className="btn" onClick={() => generate('layout')}>📐 Layout</button>
              <button className="btn" onClick={() => generate('colors')}>🌈 Colors</button>
              <button className="btn" onClick={() => generate('decor')}>✨ Decor</button>
              <button className="btn btn-acc" onClick={() => void makeVariations()}>10 Variations</button>
            </div>
          </div>
          {variations.length > 0 && (
            <div>
              <div className="label-mono mb-2">Variations ({variations.length})</div>
              <div className="grid grid-cols-5 gap-2">{variations.map(v => (<button key={v.id} className="rounded-lg overflow-hidden border border-line hover:border-acc transition-colors" onClick={() => applyVariation(v.id)}><img src={v.thumb} alt={v.label} className="w-full aspect-[8/5] object-cover" /><div className="px-1 py-0.5 text-[8px] text-center" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-mut)' }}>{v.label} · {v.score}</div></button>))}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IcClose(props: { size?: number }) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
