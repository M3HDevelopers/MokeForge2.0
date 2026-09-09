import { useEffect, useRef, useState } from 'react';
import { useStudio } from '../store';
import { IcSearch, IcLayers, IcWand, IcExport, IcSave, IcDice, IcStar, IcLock, IcUnlock, IcEye, IcEyeOff } from '../icons';

interface CommandPaletteProps {
  onClose: () => void;
}

interface Command {
  id: string;
  label: string;
  category: string;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const project = useStudio(s => s.project)!;
  const update = useStudio(s => s.update);
  const checkpoint = useStudio(s => s.checkpoint);
  const randomize = useStudio(s => s.randomize);
  const save = useStudio(s => s.save);
  const setExportOpen = useStudio(s => s.setExportOpen);
  const setGenOpen = useStudio(s => s.setGenOpen);
  const favorite = useStudio(s => s.favorite);
  const toast = useStudio(s => s.toast);
  const addDevice = useStudio(s => s.addDevice);
  const addTextBox = useStudio(s => s.addTextBox);
  const setZoom = useStudio(s => s.setZoom);
  const zoom = useStudio(s => s.zoom);

  const commands: Command[] = [
    // Design
    { id: 'generate', label: 'Generate Design', category: 'Design', shortcut: 'Ctrl+G', action: () => setGenOpen(true) },
    { id: 'surprise', label: 'Surprise Me', category: 'Design', shortcut: 'Ctrl+Shift+R', action: randomize },
    { id: 'export', label: 'Export Design', category: 'Design', shortcut: 'Ctrl+E', action: () => setExportOpen(true) },
    
    // Save
    { id: 'save', label: 'Save Project', category: 'File', shortcut: 'Ctrl+S', action: () => save() },
    { id: 'favorite', label: 'Add to Favorites', category: 'File', action: () => { favorite(); toast('Added to favorites'); } },
    
    // Add Objects
    { id: 'add-laptop', label: 'Add Laptop', category: 'Add', action: () => addDevice('laptop') },
    { id: 'add-phone', label: 'Add Phone', category: 'Add', action: () => addDevice('phone') },
    { id: 'add-tablet', label: 'Add Tablet', category: 'Add', action: () => addDevice('tablet') },
    { id: 'add-browser', label: 'Add Browser', category: 'Add', action: () => addDevice('browser') },
    { id: 'add-monitor', label: 'Add Monitor', category: 'Add', action: () => addDevice('monitor') },
    { id: 'add-text', label: 'Add Text Box', category: 'Add', action: addTextBox },
    
    // Zoom
    { id: 'zoom-100', label: 'Zoom to 100%', category: 'View', shortcut: 'Ctrl+0', action: () => setZoom(1) },
    { id: 'zoom-fit', label: 'Fit to Screen', category: 'View', shortcut: 'Ctrl+Shift+0', action: () => setZoom(Math.min(window.innerWidth / project.canvas.w, window.innerHeight / project.canvas.h) * 0.9) },
    { id: 'zoom-in', label: 'Zoom In', category: 'View', shortcut: 'Ctrl+]', action: () => setZoom(zoom * 1.2) },
    { id: 'zoom-out', label: 'Zoom Out', category: 'View', shortcut: 'Ctrl+[', action: () => setZoom(zoom * 0.8) },
    
    // Background
    { id: 'bg-procedural', label: 'Switch to Procedural Background', category: 'Background', action: () => { checkpoint(); update(p => ({ ...p, background: { ...p.background, kind: 'procedural' } })); } },
    { id: 'bg-image', label: 'Switch to Image Background', category: 'Background', action: () => { checkpoint(); update(p => ({ ...p, background: { ...p.background, kind: 'image' } })); } },
    { id: 'bg-hybrid', label: 'Switch to Hybrid Background', category: 'Background', action: () => { checkpoint(); update(p => ({ ...p, background: { ...p.background, kind: 'hybrid' } })); } },
    
    // Clear
    { id: 'clear-decos', label: 'Clear All Decorations', category: 'Clear', action: () => { checkpoint(); update(p => ({ ...p, decos: [] })); } },
    { id: 'clear-icons', label: 'Clear All Icons', category: 'Clear', action: () => { checkpoint(); update(p => ({ ...p, icons: [] })); } },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, onClose]);

  useEffect(() => {
    const selectedElement = listRef.current?.children[selectedIndex] as HTMLElement;
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div 
        className="relative w-[600px] max-w-[90vw] bg-panel border border-line rounded-xl shadow-2xl overflow-hidden anim-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
          <IcSearch size={18} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Type a command..."
            className="flex-1 bg-transparent outline-none text-[14px]"
            style={{ color: 'var(--color-fg)' }}
          />
          <span className="text-[11px]" style={{ color: 'var(--color-dim)' }}>
            {filteredCommands.length} commands
          </span>
        </div>

        {/* Commands List */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px]" style={{ color: 'var(--color-dim)' }}>
              No commands found
            </div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <div
                key={cmd.id}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                  index === selectedIndex ? 'bg-panel2' : 'hover:bg-panel2'
                }`}
                onClick={() => { cmd.action(); onClose(); }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex-1">
                  <div className="text-[13px]" style={{ color: 'var(--color-fg)' }}>
                    {cmd.label}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--color-dim)' }}>
                    {cmd.category}
                  </div>
                </div>
                {cmd.shortcut && (
                  <div className="text-[10px] px-2 py-0.5 rounded border" style={{ 
                    color: 'var(--color-dim)',
                    borderColor: 'var(--color-line)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {cmd.shortcut}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-line flex items-center gap-4 text-[10px]" style={{ color: 'var(--color-dim)' }}>
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
