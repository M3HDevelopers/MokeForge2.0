import { useCallback, useEffect, useRef } from 'react';
import { useStudio } from '../store';
import { makeThumbnail } from '../renderer';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { StagePreview } from './StagePreview';
import { ExportModal } from './ExportModal';
import { GeneratePanel } from './GeneratePanel';
import { clamp } from '../templates';
import { IcArrowL, IcDice, IcDownload, IcExport, IcFit, IcRedo, IcSave, IcStar, IcUndo, IcUpload, IcWand, IcZoomIn, IcZoomOut, LogoMark } from '../icons';

export function Editor() {
  const project = useStudio(s => s.project)!;
  const update = useStudio(s => s.update);
  const undo = useStudio(s => s.undo);
  const redo = useStudio(s => s.redo);
  const canUndo = useStudio(s => s.past.length > 0);
  const canRedo = useStudio(s => s.future.length > 0);
  const randomize = useStudio(s => s.randomize);
  const save = useStudio(s => s.save);
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
  const mockupRef = useRef<HTMLInputElement>(null);

  const saveNow = useCallback(async (silent = false) => {
    const p = useStudio.getState().project; if (!p) return;
    try { const thumb = await makeThumbnail(p); update(pp => ({ ...pp, thumbnail: thumb }), false); } catch { /* thumbnail best-effort */ }
    useStudio.getState().save(silent);
  }, [update]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement; if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
      else if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); void saveNow(false); }
      else if (mod && e.key.toLowerCase() === 'd') { if (selection?.kind === 'device' && selection.id) { e.preventDefault(); duplicateDevice(selection.id); } }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && selection?.kind === 'device' && selection.id) { e.preventDefault(); removeDevice(selection.id); }
      else if (e.key === 'Escape') setSelection(null);
      else if (e.key.startsWith('Arrow') && selection?.kind === 'device' && selection.id) { e.preventDefault(); const step = e.shiftKey ? 20 : 4; const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0; const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0; checkpoint(); update(p => ({ ...p, devices: p.devices.map(d => d.id === selection.id ? { ...d, x: d.x + dx, y: d.y + dy } : d) }), false); }
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, saveNow, selection, duplicateDevice, removeDevice, setSelection, checkpoint, update]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => { const files = Array.from(e.clipboardData?.files ?? []).filter(f => f.type.startsWith('image/')); if (files.length) { e.preventDefault(); void addFiles(files); } };
    window.addEventListener('paste', onPaste); return () => window.removeEventListener('paste', onPaste);
  }, [addFiles]);

  const fitZoom = () => { const availW = window.innerWidth - 264 - 292 - 120; const availH = window.innerHeight - 48 - 70; setZoom(clamp(Math.min(availW / project.canvas.w, availH / project.canvas.h), 0.1, 2)); };
  useEffect(() => { fitZoom(); }, []);

  return (
    <div className="h-full flex flex-col anim-fade-in">
      <div className="h-12 shrink-0 flex items-center gap-2 px-3 border-b border-line2 bg-panel relative z-20">
        <button className="icon-btn" onClick={closeEditor} title="Back to dashboard"><IcArrowL size={16} /></button>
        <LogoMark size={19} />
        <input className="bg-transparent outline-none border border-transparent hover:border-line focus:border-acc rounded-md px-2 py-1 transition-colors w-[220px]" style={{ fontFamily: 'var(--font-disp)', fontWeight: 600, fontSize: 14 }} value={project.name} onChange={(e) => update(p => ({ ...p, name: e.target.value }), false)} onFocus={() => checkpoint()} />
        <span className="flex items-center gap-1.5 text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}><span style={{ width: 7, height: 7, borderRadius: 99, background: dirty ? 'var(--color-gold)' : 'var(--color-acc2)', animation: dirty ? 'pulseDot 1.4s infinite' : undefined }} />{dirty ? 'unsaved' : 'saved'}</span>
        <div className="flex-1" />
        <button className="icon-btn" disabled={!canUndo} onClick={undo} title="Undo"><IcUndo size={15} /></button>
        <button className="icon-btn" disabled={!canRedo} onClick={redo} title="Redo"><IcRedo size={15} /></button>
        <div className="w-px h-5 bg-line mx-1" />
        <button className="btn btn-acc" onClick={() => setGenOpen(true)}><IcWand size={14} /><span>Design Engine</span></button>
        <button className="btn" onClick={randomize}><IcDice size={14} /><span>Surprise</span></button>
        <button className="btn" onClick={() => void saveNow(false)}><IcSave size={14} /><span>Save</span></button>
        <button className="btn" onClick={() => setExportOpen(true)}><IcExport size={14} /><span>Export</span></button>
        <div className="w-px h-5 bg-line mx-1" />
        <button className="icon-btn" onClick={() => void favorite()}><IcStar size={15} /></button>
        <button className="icon-btn" onClick={exportMockup}><IcDownload size={15} /></button>
        <button className="icon-btn" onClick={() => mockupRef.current?.click()}><IcUpload size={15} /></button>
        <input ref={mockupRef} type="file" hidden accept=".json,application/json" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importMockup(f); e.target.value = ''; }} />
      </div>
      <div className="flex-1 flex min-h-0">
        <LeftPanel />
        <div className="flex-1 flex flex-col min-w-0">
          <StagePreview />
          <div className="h-9 shrink-0 border-t border-line2 bg-panel flex items-center justify-between px-3">
            <span className="text-[10.5px] hidden md:block" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>drag to move · corner handle to resize · ctrl+scroll to zoom · ctrl+v paste screenshot</span>
            <div className="flex items-center gap-1">
              <button className="icon-btn !w-7 !h-7" onClick={() => setZoom(zoom * 0.85)}><IcZoomOut size={13} /></button>
              <span className="text-[10.5px] w-10 text-center" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-mut)' }}>{Math.round(zoom * 100)}%</span>
              <button className="icon-btn !w-7 !h-7" onClick={() => setZoom(zoom * 1.18)}><IcZoomIn size={13} /></button>
              <button className="icon-btn !w-7 !h-7" onClick={fitZoom}><IcFit size={13} /></button>
            </div>
          </div>
        </div>
        <RightPanel />
      </div>
      <ExportModal />
      <GeneratePanel />
    </div>
  );
}
