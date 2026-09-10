import { useCallback, useEffect, useRef, useState } from 'react';
import { useStudio } from '../store';
import { makeThumbnail } from '../renderer';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { StagePreview } from './StagePreview';
import { ExportModal } from './ExportModal';
import { GeneratePanel } from './GeneratePanel';
import { ShortcutsModal } from './ShortcutsModal';
import { ContextMenu } from './ContextMenu';
import { CommandPalette } from './CommandPalette';
import { clamp } from '../templates';
import {
  IcArrowL, IcDice, IcDownload, IcExport, IcFit, IcRedo, IcSave, IcStar, IcUndo, IcUpload, IcWand, IcZoomIn, IcZoomOut, LogoMark, IcEye,
} from '../icons';

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
  const favorites = useStudio(s => s.favorites);
  const exportMockup = useStudio(s => s.exportMockup);
  const importMockup = useStudio(s => s.importMockup);
  const mockupRef = useRef<HTMLInputElement>(null);
  const [toolMode, setToolMode] = useState<'select' | 'zoom' | 'pan'>('select');
  const [previewMode, setPreviewMode] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

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
      
      // Basic shortcuts
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
      else if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); void saveNow(false); }
      else if (mod && e.key.toLowerCase() === 'd') {
        if (selection?.kind === 'device' && selection.id) { e.preventDefault(); duplicateDevice(selection.id); }
      }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && selection?.id) {
        e.preventDefault();
        if (selection.kind === 'device') {
          removeDevice(selection.id);
        } else if (selection.kind === 'icon') {
          const removeIcon = useStudio.getState().removeIcon;
          removeIcon(selection.id);
        } else if (selection.kind === 'textbox') {
          const removeTextBox = useStudio.getState().removeTextBox;
          removeTextBox(selection.id);
        } else if (selection.kind === 'deco') {
          update(p => ({ ...p, decos: p.decos.filter(d => d.id !== selection.id) }), false);
          setSelection(null);
        }
      }
      else if (e.key === 'Escape') {
        setSelection(null);
        setToolMode('select');
        setPreviewMode(false);
      }
      // Tool mode shortcuts
      else if (e.key === 'z' && !mod) {
        setToolMode(prev => prev === 'zoom' ? 'select' : 'zoom');
      }
      else if (e.key === 'h' && !mod) {
        setToolMode(prev => prev === 'pan' ? 'select' : 'pan');
      }
      else if (e.key === 'p' && !mod) {
        setPreviewMode(prev => !prev);
      }
      // Zoom shortcuts
      else if (mod && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom(zoom * 1.2);
      }
      else if (mod && e.key === '-') {
        e.preventDefault();
        setZoom(zoom * 0.8);
      }
      else if (mod && e.key === '0') {
        e.preventDefault();
        setZoom(1);
      }
      else if (e.key.startsWith('Arrow') && selection?.id) {
        e.preventDefault();
        
        // Determine step size based on modifiers
        let step = 4;
        if (e.shiftKey && mod) step = 10; // Ctrl+Shift = 10px
        else if (e.shiftKey) step = 20; // Shift = 20px
        else if (mod) step = 1; // Ctrl = 1px (precise)
        // Default = 4px
        
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        
        checkpoint();
        
        if (selection.kind === 'device') {
          update(p => ({ ...p, devices: p.devices.map(d => d.id === selection.id ? { ...d, x: d.x + dx, y: d.y + dy } : d) }), false);
        } else if (selection.kind === 'icon') {
          update(p => ({ ...p, icons: p.icons.map(i => i.id === selection.id ? { ...i, x: i.x + (dx / p.canvas.w), y: i.y + (dy / p.canvas.h) } : i) }), false);
        } else if (selection.kind === 'textbox') {
          update(p => ({ ...p, textboxes: p.textboxes.map(t => t.id === selection.id ? { ...t, x: t.x + (dx / p.canvas.w), y: t.y + (dy / p.canvas.h) } : t) }), false);
        } else if (selection.kind === 'deco') {
          update(p => ({ ...p, decos: p.decos.map(d => d.id === selection.id ? { ...d, x: d.x + (dx / p.canvas.w), y: d.y + (dy / p.canvas.h) } : d) }), false);
        }
      }
      // Advanced shortcuts
      else if (mod && e.key.toLowerCase() === 'g') { e.preventDefault(); setGenOpen(true); } // Open Design Engine
      else if (mod && e.key.toLowerCase() === 'e') { e.preventDefault(); setExportOpen(true); } // Open Export
      else if (mod && e.shiftKey && e.key.toLowerCase() === 'r') { e.preventDefault(); randomize(); } // Surprise me
      else if (mod && e.key === '[') { e.preventDefault(); setZoom(zoom * 0.9); } // Zoom out
      else if (mod && e.key === ']') { e.preventDefault(); setZoom(zoom * 1.1); } // Zoom in
      else if (mod && e.key === '0') { e.preventDefault(); fitZoom(); } // Fit to screen
      else if (mod && e.key === '=') { e.preventDefault(); setZoom(zoom * 1.1); } // Zoom in (alternative)
      else if (mod && e.key === '-') { e.preventDefault(); setZoom(zoom * 0.9); } // Zoom out (alternative)
      else if (mod && e.shiftKey && e.key === '0') { e.preventDefault(); setZoom(1); } // Reset zoom to 100%
      else if (e.key === 'Tab' && selection?.kind === 'device') {
        e.preventDefault();
        // Cycle through devices
        const currentIndex = project.devices.findIndex(d => d.id === selection.id);
        const nextIndex = (currentIndex + 1) % project.devices.length;
        setSelection({ kind: 'device', id: project.devices[nextIndex].id });
      }
      else if (e.key === 'Tab' && e.shiftKey && selection?.kind === 'device') {
        e.preventDefault();
        // Cycle backwards through devices
        const currentIndex = project.devices.findIndex(d => d.id === selection.id);
        const prevIndex = currentIndex <= 0 ? project.devices.length - 1 : currentIndex - 1;
        setSelection({ kind: 'device', id: project.devices[prevIndex].id });
      }
      else if (mod && e.key === 'ArrowLeft' && selection?.kind === 'device') {
        e.preventDefault();
        // Nudge device left
        const step = e.shiftKey ? 20 : 4;
        checkpoint();
        update(p => ({ ...p, devices: p.devices.map(d => d.id === selection.id ? { ...d, x: d.x - step } : d) }), false);
      }
      else if (mod && e.key === 'ArrowRight' && selection?.kind === 'device') {
        e.preventDefault();
        // Nudge device right
        const step = e.shiftKey ? 20 : 4;
        checkpoint();
        update(p => ({ ...p, devices: p.devices.map(d => d.id === selection.id ? { ...d, x: d.x + step } : d) }), false);
      }
      else if (mod && e.key === 'ArrowUp' && selection?.kind === 'device') {
        e.preventDefault();
        // Nudge device up
        const step = e.shiftKey ? 20 : 4;
        checkpoint();
        update(p => ({ ...p, devices: p.devices.map(d => d.id === selection.id ? { ...d, y: d.y - step } : d) }), false);
      }
      else if (mod && e.key === 'ArrowDown' && selection?.kind === 'device') {
        e.preventDefault();
        // Nudge device down
        const step = e.shiftKey ? 20 : 4;
        checkpoint();
        update(p => ({ ...p, devices: p.devices.map(d => d.id === selection.id ? { ...d, y: d.y + step } : d) }), false);
      }
      else if (mod && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        // Select all devices
        if (project.devices.length > 0) {
          setSelection({ kind: 'device', id: project.devices[0].id });
        }
      }
      else if (mod && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        // Deselect all
        setSelection(null);
      }
      else if (mod && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        // Fit selected device to screen
        if (selection?.kind === 'device' && selection.id) {
          const device = project.devices.find(d => d.id === selection.id);
          if (device) {
            const newZoom = Math.min(
              (project.canvas.w * 0.8) / device.w,
              (project.canvas.h * 0.8) / (device.w / 1.5)
            );
            setZoom(newZoom);
          }
        }
      }
      else if (mod && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        // Hide/show selected device
        if (selection?.kind === 'device' && selection.id) {
          checkpoint();
          update(p => ({ ...p, devices: p.devices.map(d => d.id === selection.id ? { ...d, visible: !d.visible } : d) }), false);
        }
      }
      else if (mod && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        // Lock/unlock selected device (toggle opacity as visual indicator)
        if (selection?.kind === 'device' && selection.id) {
          checkpoint();
          update(p => ({ ...p, devices: p.devices.map(d => d.id === selection.id ? { ...d, opacity: d.opacity === 0.5 ? 1 : 0.5 } : d) }), false);
        }
      }
      else if (mod && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        // Duplicate and offset
        if (selection?.kind === 'device' && selection.id) {
          const device = project.devices.find(d => d.id === selection.id);
          if (device) {
            checkpoint();
            const newDevice = { ...device, id: Math.random().toString(36).substr(2, 9), x: device.x + 20, y: device.y + 20 };
            update(p => ({ ...p, devices: [...p.devices, newDevice] }), false);
            setSelection({ kind: 'device', id: newDevice.id });
          }
        }
      }
      else if (mod && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        // Send to back
        if (selection?.kind === 'device' && selection.id) {
          checkpoint();
          update(p => ({
            ...p,
            devices: [
              ...p.devices.filter(d => d.id !== selection.id),
              ...p.devices.filter(d => d.id === selection.id)
            ]
          }), false);
        }
      }
      else if (mod && e.shiftKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        // Bring to front
        if (selection?.kind === 'device' && selection.id) {
          checkpoint();
          update(p => ({
            ...p,
            devices: [
              ...p.devices.filter(d => d.id === selection.id),
              ...p.devices.filter(d => d.id !== selection.id)
            ]
          }), false);
        }
      }
      else if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      else if (mod && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        useStudio.getState().copySelection();
      }
      else if (mod && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        useStudio.getState().pasteClipboard();
      }
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

  useEffect(() => { fitZoom(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-full flex flex-col anim-fade-in">
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

        {/* Tool Mode Buttons */}
        <button 
          className={`icon-btn ${toolMode === 'zoom' ? 'bg-acc/20 text-acc' : ''}`} 
          onClick={() => setToolMode(toolMode === 'zoom' ? 'select' : 'zoom')}
          title="Zoom Tool (Z) - Click to zoom in"
        >
          <IcZoomIn size={15} />
        </button>
        <button 
          className="icon-btn"
          onClick={() => setZoom(zoom * 0.8)}
          title="Zoom Out (Ctrl+-)"
        >
          <IcZoomOut size={15} />
        </button>
        <button 
          className={`icon-btn ${toolMode === 'pan' ? 'bg-acc/20 text-acc' : ''}`} 
          onClick={() => setToolMode(toolMode === 'pan' ? 'select' : 'pan')}
          title="Pan Tool (H) - Drag to pan canvas"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/>
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
          </svg>
        </button>
        <button 
          className={`icon-btn ${previewMode ? 'bg-acc/20 text-acc' : ''}`} 
          onClick={() => setPreviewMode(!previewMode)}
          title="Preview Mode (P) - Full screen preview"
        >
          <IcEye size={15} />
        </button>

        <div className="w-px h-5 bg-line mx-1" />

        <button className="btn btn-acc" onClick={() => setGenOpen(true)} title="Moods, locks, variations, favorites">
          <IcWand size={14} />
          <span>Design Engine</span>
        </button>
        <button className="btn" onClick={randomize} title="Quick surprise — respects locks">
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
        <button 
          className={`icon-btn ${favorites.some(f => f.label === project.name) ? 'text-gold' : ''}`}
          title={favorites.some(f => f.label === project.name) ? 'Already in favorites' : 'Save to favorites'}
          onClick={() => void favorite()}
        >
          <IcStar size={15} />
        </button>
        <button className="icon-btn" title="Download .mockup project file" onClick={exportMockup}><IcDownload size={15} /></button>
        <button className="icon-btn" title="Import .mockup project file" onClick={() => mockupRef.current?.click()}><IcUpload size={15} /></button>
        <input
          ref={mockupRef} type="file" hidden accept=".json,application/json"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void importMockup(f); e.target.value = ''; }}
        />
        <ShortcutsModal />
      </div>

      {/* Preview Mode - Full Screen */}
      {previewMode ? (
        <div className="fixed inset-0 z-50 bg-ink flex items-center justify-center overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            <StagePreview onContextMenu={(e) => setContextMenu({ x: e.clientX, y: e.clientY })} />
          </div>
          <button 
            className="absolute top-6 right-6 btn btn-acc"
            onClick={() => setPreviewMode(false)}
          >
            Exit Preview (ESC)
          </button>
        </div>
      ) : (
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <LeftPanel />
          <div className="flex-1 flex flex-col min-w-0 h-full">
            <StagePreview toolMode={toolMode} onContextMenu={(e) => setContextMenu({ x: e.clientX, y: e.clientY })} />
            <div className="h-9 shrink-0 border-t border-line2 bg-panel flex items-center justify-between px-3">
              <span className="text-[10.5px] hidden md:block" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dim)' }}>
                {toolMode === 'zoom' ? 'Zoom mode - Click to zoom in' : 
                 toolMode === 'pan' ? 'Pan mode - Drag to pan canvas' :
                 'drag to move · corner handle to resize · ctrl+scroll to zoom · ctrl+v paste screenshot'}
              </span>
              <div className="flex items-center gap-1">
                <button className="icon-btn !w-7 !h-7" onClick={() => setZoom(zoom * 0.85)}><IcZoomOut size={13} /></button>
                <span className="text-[10.5px] w-10 text-center" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-mut)' }}>{Math.round(zoom * 100)}%</span>
                <button className="icon-btn !w-7 !h-7" onClick={() => setZoom(zoom * 1.18)}><IcZoomIn size={13} /></button>
                <button className="icon-btn !w-7 !h-7" onClick={fitZoom} title="Fit to screen"><IcFit size={13} /></button>
              </div>
            </div>
          </div>
          <RightPanel />
        </div>
      )}

      <ExportModal />
      <GeneratePanel />
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
      {commandPaletteOpen && (
        <CommandPalette onClose={() => setCommandPaletteOpen(false)} />
      )}
      {project.devices.length === 0 && project.assets.length === 0 && (
        <FirstRunHint onPick={() => toast('Add a device or drop a screenshot to begin', 'info')} />
      )}
    </div>
  );
}

function FirstRunHint({ onPick }: { onPick: () => void }) {
  return (
    <button
      onClick={onPick}
      className="fixed bottom-14 left-1/2 -translate-x-1/2 z-30 anim-fade-up flex items-center gap-2 px-4 py-2 rounded-full border border-line bg-panel2 shadow-xl cursor-pointer hover:border-[#4a4f5c] transition-colors"
      style={{ animationDelay: '.6s' }}
    >
      <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--color-acc)', animation: 'pulseDot 1.6s infinite' }} />
      <span className="text-[12px] text-mut">
        Start: drop a screenshot, or try <span className="text-fg font-medium">Insert sample screens</span> in the Screens tab
      </span>
    </button>
  );
}
