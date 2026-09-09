import { useState } from 'react';
import { IcClose, IcKeyboard } from '../icons';

export function ShortcutsModal() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        className="icon-btn"
        onClick={() => setOpen(true)}
        title="Keyboard Shortcuts"
      >
        <IcKeyboard size={16} />
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center anim-fade-in"
      style={{ background: 'rgba(8,9,11,0.8)', backdropFilter: 'blur(6px)' }}
      onPointerDown={() => setOpen(false)}
    >
      <div
        className="anim-pop w-[800px] max-w-[95vw] max-h-[85vh] flex flex-col rounded-2xl border border-line bg-panel shadow-[0_40px_120px_rgba(0,0,0,0.6)] overflow-hidden"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line2">
          <div className="flex items-center gap-2.5">
            <span className="text-acc"><IcKeyboard size={18} /></span>
            <span style={{ fontFamily: 'var(--font-disp)', fontWeight: 700, fontSize: 16 }}>
              Keyboard Shortcuts
            </span>
          </div>
          <button className="icon-btn" onClick={() => setOpen(false)}>
            <IcClose size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <section>
            <h3 className="text-[13px] font-semibold mb-3" style={{ fontFamily: 'var(--font-disp)' }}>
              Basic Operations
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ShortcutRow keys={['Ctrl', 'Z']} action="Undo" />
              <ShortcutRow keys={['Ctrl', 'Shift', 'Z']} action="Redo" />
              <ShortcutRow keys={['Ctrl', 'S']} action="Save project" />
              <ShortcutRow keys={['Ctrl', 'D']} action="Duplicate device" />
              <ShortcutRow keys={['Delete']} action="Delete selected" />
              <ShortcutRow keys={['Escape']} action="Deselect all" />
            </div>
          </section>

          <section>
            <h3 className="text-[13px] font-semibold mb-3" style={{ fontFamily: 'var(--font-disp)' }}>
              Navigation
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ShortcutRow keys={['Ctrl', 'G']} action="Open Design Engine" />
              <ShortcutRow keys={['Ctrl', 'E']} action="Open Export dialog" />
              <ShortcutRow keys={['Ctrl', 'Shift', 'R']} action="Surprise me (randomize)" />
              <ShortcutRow keys={['Ctrl', '0']} action="Fit to screen" />
            </div>
          </section>

          <section>
            <h3 className="text-[13px] font-semibold mb-3" style={{ fontFamily: 'var(--font-disp)' }}>
              Device Movement
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ShortcutRow keys={['Arrow Keys']} action="Move device (4px)" />
              <ShortcutRow keys={['Shift', 'Arrow Keys']} action="Move device (20px)" />
            </div>
          </section>

          <section className="p-4 rounded-lg border border-line bg-panel">
            <h3 className="text-[12px] font-semibold mb-2" style={{ fontFamily: 'var(--font-disp)' }}>
              💡 Pro Tips
            </h3>
            <ul className="text-[11px] text-mut space-y-1.5">
              <li>• Use Tab to quickly cycle through devices</li>
              <li>• Hold Shift while moving for larger steps</li>
              <li>• Hold Ctrl for precise 1px movements</li>
              <li>• Press Escape anytime to deselect</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function ShortcutRow({ keys, action }: { keys: string[]; action: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-panel hover:bg-panel2 transition-colors">
      <span className="text-[11px] text-mut">{action}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <span key={i}>
            <kbd className="px-2 py-1 rounded bg-panel3 border border-line text-fg text-[10px] font-mono min-w-[24px] text-center">
              {key}
            </kbd>
            {i < keys.length - 1 && <span className="text-dim text-[10px] ml-1">+</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
