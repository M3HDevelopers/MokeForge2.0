import { useEffect, useRef, useState, useMemo } from 'react';
import { useStudio } from '../store';
import type { Selection } from '../types';
import { IcCopy, IcTrash, IcLock, IcUnlock, IcEye, IcEyeOff, IcArrowL, IcArrowR, IcLayers, IcType, IcSpark, IcSearch, IcStar, IcDownload, IcUpload } from '../icons';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onClick?: () => void;
  submenu?: MenuItem[];
  separator?: boolean;
}

export function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const selection = useStudio(s => s.selection);
  const project = useStudio(s => s.project)!;
  const update = useStudio(s => s.update);
  const checkpoint = useStudio(s => s.checkpoint);
  const toast = useStudio(s => s.toast);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Build context-aware menu based on selection
  const menuItems = useMemo(() => buildMenuItems(selection, project, update, checkpoint, toast, onClose), [selection, project, update, checkpoint, toast, onClose]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery) return menuItems;
    return filterMenuItems(menuItems, searchQuery.toLowerCase());
  }, [menuItems, searchQuery]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        e.preventDefault();
        const item = filteredItems[focusedIndex];
        if (item && item.onClick && !item.disabled) {
          item.onClick();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, filteredItems, focusedIndex]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Smart positioning
  const menuPosition = useMemo(() => {
    const menuWidth = 280;
    const menuHeight = Math.min(600, filteredItems.length * 36 + 100);
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let posX = x;
    let posY = y;

    // Adjust if menu goes off right edge
    if (x + menuWidth > viewportWidth) {
      posX = viewportWidth - menuWidth - 10;
    }

    // Adjust if menu goes off bottom edge
    if (y + menuHeight > viewportHeight) {
      posY = viewportHeight - menuHeight - 10;
    }

    return { left: posX, top: posY };
  }, [x, y, filteredItems.length]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-panel border border-line rounded-lg shadow-2xl py-1 min-w-[280px] max-w-[320px] max-h-[600px] overflow-y-auto anim-pop"
      style={menuPosition}
    >
      {/* Search bar if menu has many items */}
      {menuItems.length > 10 && (
        <div className="px-3 py-2 border-b border-line">
          <div className="flex items-center gap-2 bg-panel2 rounded px-2 py-1.5">
            <IcSearch size={12} />
            <input
              type="text"
              placeholder="Search actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[11px]"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Menu items */}
      <div className="py-1">
        {filteredItems.map((item, index) => {
          if (item.separator) {
            return <div key={item.id} className="h-px bg-line my-1" />;
          }

          return (
            <div
              key={item.id}
              className={`flex items-center gap-2 px-3 py-2 text-[12px] cursor-pointer transition-colors ${
                focusedIndex === index ? 'bg-panel2' : 'hover:bg-panel2'
              } ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (!item.disabled && item.onClick) {
                  item.onClick();
                }
              }}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              {item.icon && <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>}
              <span className="flex-1">{item.label}</span>
              {item.shortcut && (
                <span className="text-[10px] opacity-60 font-mono">{item.shortcut}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function filterMenuItems(items: MenuItem[], query: string): MenuItem[] {
  return items.filter(item => {
    if (item.separator) return false;
    if (item.label.toLowerCase().includes(query)) return true;
    if (item.submenu) {
      const hasMatchingSubmenu = item.submenu.some(sub => 
        sub.label.toLowerCase().includes(query)
      );
      return hasMatchingSubmenu;
    }
    return false;
  });
}

function buildMenuItems(
  selection: Selection | null,
  project: any,
  update: any,
  checkpoint: any,
  toast: any,
  onClose: any
): MenuItem[] {
  // No selection - show canvas menu
  if (!selection) {
    return buildCanvasMenu(project, update, checkpoint, toast, onClose);
  }

  // Multi-selection
  if (selection.ids && selection.ids.length > 1) {
    return buildMultiSelectionMenu(selection, project, update, checkpoint, toast, onClose);
  }

  // Single selection - build menu based on object type
  switch (selection.kind) {
    case 'device':
      return buildDeviceMenu(selection, project, update, checkpoint, toast, onClose);
    case 'image':
      return buildImageMenu(selection, project, update, checkpoint, toast, onClose);
    case 'textbox':
      return buildTextBoxMenu(selection, project, update, checkpoint, toast, onClose);
    case 'icon':
      return buildIconMenu(selection, project, update, checkpoint, toast, onClose);
    case 'deco':
      return buildDecoMenu(selection, project, update, checkpoint, toast, onClose);
    case 'text':
      return buildTextBlockMenu(selection, project, update, checkpoint, toast, onClose);
    case 'logo':
      return buildLogoMenu(selection, project, update, checkpoint, toast, onClose);
    case 'background':
      return buildBackgroundMenu(project, update, checkpoint, toast, onClose);
    default:
      return buildCanvasMenu(project, update, checkpoint, toast, onClose);
  }
}

function buildCanvasMenu(project: any, update: any, checkpoint: any, toast: any, onClose: any): MenuItem[] {
  return [
    {
      id: 'add-device',
      label: 'Add Device',
      icon: <IcLayers size={14} />,
      onClick: () => {
        useStudio.getState().addDevice('laptop');
        toast('Device added');
        onClose();
      },
    },
    {
      id: 'add-textbox',
      label: 'Add Text Box',
      icon: <IcType size={14} />,
      onClick: () => {
        useStudio.getState().addTextBox();
        toast('Text box added');
        onClose();
      },
    },
    {
      id: 'add-image',
      label: 'Add Image',
      icon: <IcUpload size={14} />,
      onClick: () => {
        toast('Use Images tab to add images');
        onClose();
      },
    },
    { id: 'sep-1', label: '', separator: true },
    {
      id: 'generate-design',
      label: 'Generate Design',
      icon: <IcSpark size={14} />,
      onClick: () => {
        useStudio.getState().setGenOpen(true);
        onClose();
      },
    },
    {
      id: 'surprise-me',
      label: 'Surprise Me',
      shortcut: 'Ctrl+Shift+R',
      onClick: () => {
        useStudio.getState().randomize();
        onClose();
      },
    },
    { id: 'sep-2', label: '', separator: true },
    {
      id: 'fit-canvas',
      label: 'Fit Canvas',
      shortcut: 'Ctrl+0',
      onClick: () => {
        const availW = window.innerWidth - 264 - 292 - 120;
        const availH = window.innerHeight - 48 - 70;
        const zoom = Math.min(availW / project.canvas.w, availH / project.canvas.h);
        useStudio.getState().setZoom(zoom);
        toast('Canvas fitted');
        onClose();
      },
    },
    {
      id: 'zoom-100',
      label: 'Zoom 100%',
      onClick: () => {
        useStudio.getState().setZoom(1);
        toast('Zoom set to 100%');
        onClose();
      },
    },
  ];
}

function buildDeviceMenu(selection: Selection, project: any, update: any, checkpoint: any, toast: any, onClose: any): MenuItem[] {
  const device = project.devices.find((d: any) => d.id === selection.id);
  if (!device) return [];

  const isLocked = device.opacity === 0.5;

  return [
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <IcCopy size={14} />,
      shortcut: 'Ctrl+D',
      onClick: () => {
        checkpoint();
        useStudio.getState().duplicateDevice(selection.id!);
        toast('Device duplicated');
        onClose();
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <IcTrash size={14} />,
      shortcut: 'Del',
      onClick: () => {
        checkpoint();
        useStudio.getState().removeDevice(selection.id!);
        toast('Device deleted');
        onClose();
      },
    },
    { id: 'sep-1', label: '', separator: true },
    {
      id: 'bring-forward',
      label: 'Bring Forward',
      icon: <IcArrowR size={14} className="rotate-90" />,
      shortcut: 'Ctrl+]',
      onClick: () => {
        checkpoint();
        update((p: any) => {
          const currentIndex = p.devices.findIndex((dev: any) => dev.id === selection.id);
          if (currentIndex < p.devices.length - 1) {
            const newDevices = [...p.devices];
            [newDevices[currentIndex], newDevices[currentIndex + 1]] = [newDevices[currentIndex + 1], newDevices[currentIndex]];
            return { ...p, devices: newDevices };
          }
          return p;
        });
        toast('Brought forward');
        onClose();
      },
    },
    {
      id: 'send-backward',
      label: 'Send Backward',
      icon: <IcArrowL size={14} className="rotate-90" />,
      shortcut: 'Ctrl+[',
      onClick: () => {
        checkpoint();
        update((p: any) => {
          const currentIndex = p.devices.findIndex((dev: any) => dev.id === selection.id);
          if (currentIndex > 0) {
            const newDevices = [...p.devices];
            [newDevices[currentIndex], newDevices[currentIndex - 1]] = [newDevices[currentIndex - 1], newDevices[currentIndex]];
            return { ...p, devices: newDevices };
          }
          return p;
        });
        toast('Sent backward');
        onClose();
      },
    },
    { id: 'sep-2', label: '', separator: true },
    {
      id: isLocked ? 'unlock' : 'lock',
      label: isLocked ? 'Unlock' : 'Lock',
      icon: isLocked ? <IcUnlock size={14} /> : <IcLock size={14} />,
      shortcut: 'Ctrl+L',
      onClick: () => {
        checkpoint();
        update((p: any) => ({
          ...p,
          devices: p.devices.map((d: any) => 
            d.id === selection.id ? { ...d, opacity: isLocked ? 1 : 0.5 } : d
          ),
        }));
        toast(isLocked ? 'Device unlocked' : 'Device locked');
        onClose();
      },
    },
    {
      id: device.visible === false ? 'show' : 'hide',
      label: device.visible === false ? 'Show' : 'Hide',
      icon: device.visible === false ? <IcEye size={14} /> : <IcEyeOff size={14} />,
      shortcut: 'Ctrl+H',
      onClick: () => {
        checkpoint();
        update((p: any) => ({
          ...p,
          devices: p.devices.map((d: any) => 
            d.id === selection.id ? { ...d, visible: !d.visible } : d
          ),
        }));
        toast(device.visible === false ? 'Device shown' : 'Device hidden');
        onClose();
      },
    },
    { id: 'sep-3', label: '', separator: true },
    {
      id: 'edit-properties',
      label: 'Edit Properties',
      icon: <IcType size={14} />,
      onClick: () => {
        toast('Properties shown in right panel');
        onClose();
      },
    },
  ];
}

function buildImageMenu(selection: Selection, project: any, update: any, checkpoint: any, toast: any, onClose: any): MenuItem[] {
  const image = project.canvasImages.find((img: any) => img.id === selection.id);
  if (!image) return [];

  return [
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <IcCopy size={14} />,
      shortcut: 'Ctrl+D',
      onClick: () => {
        useStudio.getState().duplicateCanvasImage(selection.id!);
        toast('Image duplicated');
        onClose();
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <IcTrash size={14} />,
      shortcut: 'Del',
      onClick: () => {
        checkpoint();
        useStudio.getState().removeCanvasImage(selection.id!);
        toast('Image deleted');
        onClose();
      },
    },
    { id: 'sep-1', label: '', separator: true },
    {
      id: image.locked ? 'unlock' : 'lock',
      label: image.locked ? 'Unlock' : 'Lock',
      icon: image.locked ? <IcUnlock size={14} /> : <IcLock size={14} />,
      onClick: () => {
        useStudio.getState().updateCanvasImage(selection.id!, { locked: !image.locked });
        toast(image.locked ? 'Image unlocked' : 'Image locked');
        onClose();
      },
    },
    {
      id: image.hidden ? 'show' : 'hide',
      label: image.hidden ? 'Show' : 'Hide',
      icon: image.hidden ? <IcEye size={14} /> : <IcEyeOff size={14} />,
      onClick: () => {
        useStudio.getState().updateCanvasImage(selection.id!, { hidden: !image.hidden });
        toast(image.hidden ? 'Image shown' : 'Image hidden');
        onClose();
      },
    },
    { id: 'sep-2', label: '', separator: true },
    {
      id: 'edit-properties',
      label: 'Edit Properties',
      icon: <IcType size={14} />,
      onClick: () => {
        toast('Properties shown in right panel');
        onClose();
      },
    },
  ];
}

function buildTextBoxMenu(selection: Selection, project: any, update: any, checkpoint: any, toast: any, onClose: any): MenuItem[] {
  return [
    {
      id: 'delete',
      label: 'Delete',
      icon: <IcTrash size={14} />,
      shortcut: 'Del',
      onClick: () => {
        checkpoint();
        useStudio.getState().removeTextBox(selection.id!);
        toast('Text box deleted');
        onClose();
      },
    },
    { id: 'sep-1', label: '', separator: true },
    {
      id: 'edit-properties',
      label: 'Edit Properties',
      icon: <IcType size={14} />,
      onClick: () => {
        toast('Properties shown in right panel');
        onClose();
      },
    },
  ];
}

function buildIconMenu(selection: Selection, project: any, update: any, checkpoint: any, toast: any, onClose: any): MenuItem[] {
  return [
    {
      id: 'delete',
      label: 'Delete',
      icon: <IcTrash size={14} />,
      shortcut: 'Del',
      onClick: () => {
        checkpoint();
        update((p: any) => ({ ...p, icons: p.icons.filter((i: any) => i.id !== selection.id) }));
        toast('Icon deleted');
        onClose();
      },
    },
    { id: 'sep-1', label: '', separator: true },
    {
      id: 'edit-properties',
      label: 'Edit Properties',
      icon: <IcType size={14} />,
      onClick: () => {
        toast('Properties shown in right panel');
        onClose();
      },
    },
  ];
}

function buildDecoMenu(selection: Selection, project: any, update: any, checkpoint: any, toast: any, onClose: any): MenuItem[] {
  return [
    {
      id: 'delete',
      label: 'Delete',
      icon: <IcTrash size={14} />,
      shortcut: 'Del',
      onClick: () => {
        checkpoint();
        update((p: any) => ({ ...p, decos: p.decos.filter((d: any) => d.id !== selection.id) }));
        toast('Decoration deleted');
        onClose();
      },
    },
    { id: 'sep-1', label: '', separator: true },
    {
      id: 'edit-properties',
      label: 'Edit Properties',
      icon: <IcType size={14} />,
      onClick: () => {
        toast('Properties shown in right panel');
        onClose();
      },
    },
  ];
}

function buildTextBlockMenu(selection: Selection, project: any, update: any, checkpoint: any, toast: any, onClose: any): MenuItem[] {
  return [
    {
      id: 'edit-properties',
      label: 'Edit Properties',
      icon: <IcType size={14} />,
      onClick: () => {
        toast('Properties shown in right panel');
        onClose();
      },
    },
  ];
}

function buildLogoMenu(selection: Selection, project: any, update: any, checkpoint: any, toast: any, onClose: any): MenuItem[] {
  return [
    {
      id: 'edit-properties',
      label: 'Edit Properties',
      icon: <IcType size={14} />,
      onClick: () => {
        toast('Properties shown in right panel');
        onClose();
      },
    },
  ];
}

function buildBackgroundMenu(project: any, update: any, checkpoint: any, toast: any, onClose: any): MenuItem[] {
  return [
    {
      id: 'generate-design',
      label: 'Generate Design',
      icon: <IcSpark size={14} />,
      onClick: () => {
        useStudio.getState().setGenOpen(true);
        onClose();
      },
    },
    {
      id: 'surprise-me',
      label: 'Surprise Me',
      shortcut: 'Ctrl+Shift+R',
      onClick: () => {
        useStudio.getState().randomize();
        onClose();
      },
    },
    { id: 'sep-1', label: '', separator: true },
    {
      id: 'edit-properties',
      label: 'Edit Properties',
      icon: <IcType size={14} />,
      onClick: () => {
        toast('Properties shown in right panel');
        onClose();
      },
    },
  ];
}

function buildMultiSelectionMenu(selection: Selection, project: any, update: any, checkpoint: any, toast: any, onClose: any): MenuItem[] {
  const count = selection.ids?.length || 0;

  return [
    {
      id: 'delete-all',
      label: `Delete ${count} Objects`,
      icon: <IcTrash size={14} />,
      onClick: () => {
        checkpoint();
        // Delete all selected objects
        if (selection.kind === 'device') {
          selection.ids?.forEach(id => useStudio.getState().removeDevice(id));
        } else if (selection.kind === 'image') {
          selection.ids?.forEach(id => useStudio.getState().removeCanvasImage(id));
        }
        toast(`${count} objects deleted`);
        onClose();
      },
    },
    { id: 'sep-1', label: '', separator: true },
    {
      id: 'edit-properties',
      label: 'Edit Properties',
      icon: <IcType size={14} />,
      onClick: () => {
        toast('Properties shown in right panel');
        onClose();
      },
    },
  ];
}
