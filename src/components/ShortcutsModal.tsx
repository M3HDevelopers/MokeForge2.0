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
          {/* Basic Operations */}
          <section>
            <h3 className="text-[13px] font-semibold mb-3" style={{ fontFamily: 'var(--font-disp)' }}>
              Basic Operations
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ShortcutRow keys={['Ctrl', 'Z']} action="Undo" />
              <ShortcutRow keys={['Ctrl', 'Shift', 'Z']} action="Redo" />
              <ShortcutRow keys={['Ctrl', 'S']} action="Save project" />
              <ShortcutRow keys={['Ctrl', 'D']} action="Duplicate device" />
              <ShortcutRow keys={['Ctrl', 'Shift', 'D']} action="Duplicate with offset" />
              <ShortcutRow keys={['Delete']} action="Delete selected" />
              <ShortcutRow keys={['Escape']} action="Deselect all" />
              <ShortcutRow keys={['Ctrl', 'A']} action="Select first device" />
              <ShortcutRow keys={['Ctrl', 'Shift', 'A']} action="Deselect all" />
            </div>
          </section>

          {/* Navigation */}
          <section>
            <h3 className="text-[13px] font-semibold mb-3" style={{ fontFamily: 'var(--font-disp)' }}>
              Navigation
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ShortcutRow keys={['Ctrl', 'G']} action="Open Design Engine" />
              <ShortcutRow keys={['Ctrl', 'E']} action="Open Export dialog" />
              <ShortcutRow keys={['Ctrl', 'Shift', 'R']} action="Surprise me (randomize)" />
              <ShortcutRow keys={['Tab']} action="Next device" />
              <ShortcutRow keys={['Shift', 'Tab']} action="Previous device" />
              <ShortcutRow keys={['Ctrl', '0']} action="Fit to screen" />
              <ShortcutRow keys={['Ctrl', 'Shift', '0']} action="Reset zoom 100%" />
            </div>
          </section>

          {/* Zoom */}
          <section>
            <h3 className="text-[13px] font-semibold mb-3" style={{ fontFamily: 'var(--font-disp)' }}>
              Zoom
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ShortcutRow keys={['Ctrl', '[']} action="Zoom out" />
              <ShortcutRow keys={['Ctrl', ']']} action="Zoom in" />
              <ShortcutRow keys={['Ctrl', '-']} action="Zoom out (alt)" />
              <ShortcutRow keys={['Ctrl', '=']} action="Zoom in (alt)" />
              <ShortcutRow keys={['Ctrl', 'F']} action="Fit selected device" />
            </div>
          </section>

          {/* Device Movement */}
          <section>
            <h3 className="text-[13px] font-semibold mb-3" style={{ fontFamily: 'var(--font-disp)' }}>
              Device Movement
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ShortcutRow keys={['Arrow Keys']} action="Move device (4px)" />
              <ShortcutRow keys={['Shift', 'Arrow Keys']} action="Move device (20px)" />
              <ShortcutRow keys={['Ctrl', 'Arrow Keys']} action="Nudge precisely (1px)" />
              <ShortcutRow keys={['Ctrl', 'Shift', 'Arrow Keys']} action="Nudge precisely (10px)" />
            </div>
          </section>

          {/* Layer Order */}
          <section>
            <h3 className="text-[13px] font-semibold mb-3" style={{ fontFamily: 'var(--font-disp)' }}>
              Layer Order
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ShortcutRow keys={['Ctrl', 'B']} action="Send to back" />
              <ShortcutRow keys={['Ctrl', 'Shift', 'B']} action="Bring to front" />
              <ShortcutRow keys={['Ctrl', '↑']} action="Move up one layer" />
              <ShortcutRow keys={['Ctrl', '↓']} action="Move down one layer" />
            </div>
          </section>

          {/* Visibility & Locking */}
          <section>
            <h3 className="text-[13px] font-semibold mb-3" style={{ fontFamily: 'var(--font-disp)' }}>
              Visibility & Locking
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ShortcutRow keys={['Ctrl', 'H']} action="Hide/show device" />
              <ShortcutRow keys={['Ctrl', 'L']} action="Lock/unlock device" />
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h3 className="text-[13px] font-semibold mb-3" style={{ fontFamily: 'var(--font-disp)' }}>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ShortcutRow keys={['Ctrl', 'N']} action="New text box" />
              <ShortcutRow keys={['Ctrl', 'I']} action="Add icon" />
              <ShortcutRow keys={['Ctrl', 'Shift', 'N']} action="New decoration" />
              <ShortcutRow keys={['Enter']} action="Confirm/Apply" />
              <ShortcutRow keys={['Space']} action="Pan mode (hold)" />
            </div>
          </section>

          {/* Tips */}
          <section className="p-4 rounded-lg border border-line bg-panel">
            <h3 className="text-[12px] font-semibold mb-2" style={{ fontFamily: 'var(--font-disp)' }}>
              💡 Pro Tips
            </h3>
            <ul className="text-[11px] text-mut space-y-1.5">
              <li>• Use <kbd className="px-1.5 py-0.5 rounded bg-panel3 text-fg text-[10px]">Tab</kbd> to quickly cycle through devices</li>
              <li>• Hold <kbd className="px-1.5 py-0.5 rounded bg-panel3 text-fg text-[10px]">Shift</kbd> while moving for larger steps</li>
              <li>• Hold <kbd className="px-1.5 py-0.5 rounded bg-panel3 text-fg text-[10px]">Ctrl</kbd> for precise 1px movements</li>
              <li>• Press <kbd className="px-1.5 py-0.5 rounded bg-panel3 text-fg text-[10px]">Escape</kbd> anytime to deselect</li>
              <li>• Use <kbd className="px-1.5 py-0.5 rounded bg-panel3 text-fg text-[10px]">Ctrl+G</kbd> to quickly open Design Engine</li>
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
