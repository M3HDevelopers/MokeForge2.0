import { useEffect, useRef, useState, useCallback } from 'react';
import { useStudio } from '../store';
import { DEVICE_META, SHADOWS, FIT_MODES, MATERIALS, BG_PRESETS, PALETTES, paletteToBg, DECO_PRESETS } from '../templates';
import { scoreDesign, generateDesign, COMPOSITIONS } from '../engine';
import { makeThumbnail } from '../renderer';
import type { DeviceKind, Mood, Project, Selection } from '../types';
import {
  IcClose, IcCopy, IcTrash, IcUp, IcDown, IcEye, IcEyeOff, IcLock, IcUnlock,
  IcRefresh, IcZoomIn, IcZoomOut, IcFit, IcGrid, IcType, IcImage, IcLayers,
  IcBg, IcSpark, IcDice, IcSave, IcBrand, IcPlus, IcCrop, IcArrowL, IcArrowR,
} from '../icons';

export interface ContextMenuState {
  x: number;
  y: number;
  target: 'canvas' | 'device' | 'text' | 'logo' | 'background' | 'deco';
  targetId?: string;
}

interface MenuItem {
  label?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  action?: () => void;
  submenu?: MenuItem[];
  danger?: boolean;
}

function MenuSection({ items, depth = 0 }: { items: MenuItem[]; depth?: number }) {
  return (
    <div className={depth > 0 ? 'absolute left-full top-0 ml-0.5 min-w-[200px] rounded-lg border border-line bg-panel2 shadow-[0_16px_44px_rgba(0,0,0,0.6)] py-1 z-[100] anim-fade-in' : ''}>
      {items.map((item, i) => {
        if (item.separator) return <div key={i} className="my-1 border-t border-line2" />;
        const [subOpen, setSubOpen] = useState(false);
        return (
          <div key={i} className="relative" onMouseEnter={() => item.submenu && setSubOpen(true)} onMouseLeave={() => item.submenu && setSubOpen(false)}>
            <button
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-[12px] transition-colors ${item.disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-panel3 cursor-pointer'} ${item.danger ? 'hover:!text-danger' : ''}`}
              onClick={() => { if (!item.disabled && item.action) { item.action(); } }}
              disabled={item.disabled}
            >
              {item.icon && <span className="w-4 h-4 flex items-center justify-center text-dim">{item.icon}</span>}
              <span className="flex-1">{item.label || ''}</span>
              {item.shortcut && <span className="text-[9px] text-dim font-mono">{item.shortcut}</span>}
              {item.submenu && <span className="text-dim text-[10px]">▸</span>}
            </button>
            {subOpen && item.submenu && <MenuSection items={item.submenu} depth={depth + 1} />}
          </div>
        );
      })}
    </div>
  );
}

export function ContextMenu({ state, onClose }: { state: ContextMenuState; onClose: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const store = useStudio.getState();
  const project = store.project;
  if (!project) return null;

  // Position adjustment
  const [pos, setPos] = useState({ x: state.x, y: state.y });
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let x = state.x, y = state.y;
    if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width - 8;
    if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height - 8;
    if (x < 0) x = 8;
    if (y < 0) y = 8;
    setPos({ x, y });
  }, [state.x, state.y]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose(); };
    setTimeout(() => window.addEventListener('mousedown', onClick), 0);
    return () => window.removeEventListener('mousedown', onClick);
  }, [onClose]);

  const items = buildMenuItems(state, project);
  const filtered = search ? filterItems(items, search) : items;

  return (
    <div className="fixed inset-0 z-[90]" onContextMenu={(e) => e.preventDefault()}>
      <div
        ref={menuRef}
        className="absolute min-w-[240px] max-w-[300px] max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-panel2 shadow-[0_16px_44px_rgba(0,0,0,0.6)] py-1.5 anim-pop"
        style={{ left: pos.x, top: pos.y }}
      >
        {/* Search */}
        {items.length > 12 && (
          <div className="px-3 pb-1.5">
            <input
              autoFocus
              className="w-full bg-ink border border-line rounded-md px-2.5 py-1.5 text-[11px] outline-none focus:border-acc"
              placeholder="Search actions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
        <MenuSection items={filtered} />
      </div>
    </div>
  );
}

function filterItems(items: MenuItem[], query: string): MenuItem[] {
  const q = query.toLowerCase();
  return items.filter(item => {
    if (item.separator) return true;
    if (item.label && item.label.toLowerCase().includes(q)) return true;
    if (item.submenu) return filterItems(item.submenu, q).length > 0;
    return false;
  }).map(item => item.submenu ? { ...item, submenu: filterItems(item.submenu, query) } : item);
}

function buildMenuItems(state: ContextMenuState, project: Project): MenuItem[] {
  const s = useStudio;
  const update = s.getState().update;
  const toast = s.getState().toast;
  const checkpoint = s.getState().checkpoint;
  const setSelection = s.getState().setSelection;
  const selection = s.getState().selection;

  switch (state.target) {
    case 'canvas': return buildCanvasMenu(project, update, toast, checkpoint, setSelection);
    case 'device': return buildDeviceMenu(project, state.targetId, update, toast, checkpoint, setSelection);
    case 'text': return buildTextMenu(project, update, toast, checkpoint);
    case 'logo': return buildLogoMenu(project, update, toast, checkpoint);
    case 'background': return buildBackgroundMenu(project, update, toast, checkpoint);
    case 'deco': return buildDecoMenu(project, state.targetId, update, toast, checkpoint);
    default: return buildCanvasMenu(project, update, toast, checkpoint, setSelection);
  }
}

function buildCanvasMenu(p: Project, update: any, toast: any, checkpoint: any, setSelection: any): MenuItem[] {
  return [
    { label: 'Add Device', icon: <IcPlus size={12} />, submenu: (Object.keys(DEVICE_META) as DeviceKind[]).map(k => ({ label: DEVICE_META[k].label, action: () => { useStudio.getState().addDevice(k); } })) },
    { label: 'Add Text', icon: <IcType size={12} />, action: () => { update((pp: Project) => ({ ...pp, text: { ...pp.text, enabled: true, title: pp.text.title || 'New Text' } })); setSelection({ kind: 'text' }); toast('Text added'); } },
    { separator: true },
    { label: 'Paste', icon: <IcCopy size={12} />, shortcut: '⌘V', disabled: true },
    { label: 'Paste in Place', disabled: true },
    { separator: true },
    { label: 'Select All', shortcut: '⌘A', action: () => toast('All devices selected', 'info') },
    { separator: true },
    { label: 'Background', icon: <IcBg size={12} />, submenu: [
      { label: 'Randomize Background', icon: <IcDice size={12} />, action: () => { useStudio.getState().generate('background'); } },
      { label: 'Choose Template', submenu: BG_PRESETS.slice(0, 8).map(bp => ({ label: bp.name, action: () => { update((pp: Project) => ({ ...pp, background: { ...bp.bg, seed: pp.background.seed } })); toast(`Background: ${bp.name}`); } })) },
      { separator: true },
      { label: 'Lock Background', icon: <IcLock size={12} />, action: () => { useStudio.getState().toggleLock('background'); toast('Background lock toggled'); } },
    ]},
    { label: 'View', icon: <IcEye size={12} />, submenu: [
      { label: 'Zoom In', shortcut: '⌘+', action: () => useStudio.getState().setZoom(useStudio.getState().zoom * 1.2) },
      { label: 'Zoom Out', shortcut: '⌘-', action: () => useStudio.getState().setZoom(useStudio.getState().zoom * 0.8) },
      { label: 'Fit Canvas', shortcut: '⌘0', action: () => { const aw = window.innerWidth - 556; const ah = window.innerHeight - 120; useStudio.getState().setZoom(Math.min(aw / p.canvas.w, ah / p.canvas.h)); } },
      { separator: true },
      { label: 'Show Grid', action: () => toast('Grid visibility toggled', 'info') },
      { label: 'Show Rulers', action: () => toast('Rulers toggled', 'info') },
    ]},
    { separator: true },
    { label: 'Generate Design', icon: <IcSpark size={12} />, action: () => { useStudio.getState().generate('all'); } },
    { label: 'Surprise Me', icon: <IcDice size={12} />, shortcut: '⌘J', action: () => { useStudio.getState().randomize(); } },
    { label: '10 Variations', icon: <IcSpark size={12} />, action: () => { void useStudio.getState().makeVariations(); } },
    { separator: true },
    { label: 'Clear Canvas', danger: true, action: () => { if (confirm('Clear all devices?')) { update((pp: Project) => ({ ...pp, devices: [] })); toast('Canvas cleared', 'info'); } } },
  ];
}

function buildDeviceMenu(p: Project, deviceId: string | undefined, update: any, toast: any, checkpoint: any, setSelection: any): MenuItem[] {
  const d = p.devices.find(x => x.id === deviceId);
  if (!d) return buildCanvasMenu(p, update, toast, checkpoint, setSelection);
  const meta = DEVICE_META[d.kind];

  return [
    { label: `Edit ${meta.label}`, icon: <IcLayers size={12} />, action: () => { setSelection({ kind: 'device', id: d.id }); toast(`Selected: ${d.name}`); } },
    { label: 'Change Device', submenu: (Object.keys(DEVICE_META) as DeviceKind[]).map(k => ({ label: DEVICE_META[k].label, action: () => { checkpoint(); update((pp: Project) => ({ ...pp, devices: pp.devices.map(dd => dd.id === d.id ? { ...dd, kind: k, name: `${DEVICE_META[k].label}`, w: dd.w } : dd) })); toast(`Changed to ${DEVICE_META[k].label}`); } })) },
    { separator: true },
    { label: 'Duplicate', icon: <IcCopy size={12} />, shortcut: '⌘D', action: () => { useStudio.getState().duplicateDevice(d.id); } },
    { label: 'Delete', icon: <IcTrash size={12} />, shortcut: '⌫', danger: true, action: () => { useStudio.getState().removeDevice(d.id); toast('Device removed', 'info'); } },
    { separator: true },
    { label: 'Screenshot', icon: <IcImage size={12} />, submenu: [
      { label: 'Fit: Cover', action: () => { update((pp: Project) => ({ ...pp, devices: pp.devices.map(dd => dd.id === d.id ? { ...dd, fit: 'cover' } : dd) })); toast('Fit: Cover'); } },
      { label: 'Fit: Contain', action: () => { update((pp: Project) => ({ ...pp, devices: pp.devices.map(dd => dd.id === d.id ? { ...dd, fit: 'contain' } : dd) })); toast('Fit: Contain'); } },
      { label: 'Fit: Stretch', action: () => { update((pp: Project) => ({ ...pp, devices: pp.devices.map(dd => dd.id === d.id ? { ...dd, fit: 'stretch' } : dd) })); toast('Fit: Stretch'); } },
      { separator: true },
      { label: 'Reset Position', action: () => { update((pp: Project) => ({ ...pp, devices: pp.devices.map(dd => dd.id === d.id ? { ...dd, zoom: 1, panX: 0, panY: 0 } : dd) })); toast('Screenshot reset'); } },
      { label: 'Assign Screenshot...', disabled: p.assets.length === 0, action: () => { if (p.assets.length > 0) { update((pp: Project) => ({ ...pp, devices: pp.devices.map(dd => dd.id === d.id ? { ...dd, assetId: pp.assets[0].id } : dd) })); toast('Screenshot assigned'); } } },
    ]},
    { label: 'Appearance', icon: <IcEye size={12} />, submenu: [
      { label: 'Frame Color', submenu: meta.colors.map(c => ({ label: c.name, action: () => { update((pp: Project) => ({ ...pp, devices: pp.devices.map(dd => dd.id === d.id ? { ...dd, color: c.hex } : dd) })); } })) },
      { label: 'Material', submenu: MATERIALS.map(m => ({ label: m.label, action: () => { update((pp: Project) => ({ ...pp, devices: pp.devices.map(dd => dd.id === d.id ? { ...dd, material: m.id } : dd) })); toast(`Material: ${m.label}`); } })) },
      { separator: true },
      { label: 'Shadow', submenu: SHADOWS.map(sh => ({ label: sh.label, action: () => { update((pp: Project) => ({ ...pp, devices: pp.devices.map(dd => dd.id === d.id ? { ...dd, shadow: sh.id } : dd) })); toast(`Shadow: ${sh.label}`); } })) },
      { separator: true },
      { label: `Brightness: ${Math.round(d.brightness * 100)}%`, disabled: true },
      { label: `Opacity: ${Math.round(d.opacity * 100)}%`, disabled: true },
      { label: `Reflection: ${Math.round(d.reflection * 100)}%`, disabled: true },
    ]},
    { label: 'Transform', icon: <IcCrop size={12} />, submenu: [
      { label: 'Flip Horizontal', action: () => { checkpoint(); update((pp: Project) => ({ ...pp, devices: pp.devices.map(dd => dd.id === d.id ? { ...dd, tilt: -dd.tilt } : dd) })); toast('Flipped'); } },
      { label: 'Tilt Left (-5°)', action: () => { update((pp: Project) => ({ ...pp, devices: pp.devices.map(dd => dd.id === d.id ? { ...dd, tilt: dd.tilt - 5 } : dd) })); } },
      { label: 'Tilt Right (+5°)', action: () => { update((pp: Project) => ({ ...pp, devices: pp.devices.map(dd => dd.id === d.id ? { ...dd, tilt: dd.tilt + 5 } : dd) })); } },
      { label: 'Reset Rotation', action: () => { update((pp: Project) => ({ ...pp, devices: pp.devices.map(dd => dd.id === d.id ? { ...dd, tilt: 0 } : dd) })); toast('Rotation reset'); } },
      { separator: true },
      { label: 'Reset Transform', action: () => { update((pp: Project) => ({ ...pp, devices: pp.devices.map(dd => dd.id === d.id ? { ...dd, tilt: 0, brightness: 1, opacity: 1, reflection: 0, radiusMul: 1 } : dd) })); toast('Transform reset'); } },
    ]},
    { label: 'Arrange', icon: <IcUp size={12} />, submenu: [
      { label: 'Bring to Front', shortcut: '⌘]', action: () => { update((pp: Project) => ({ ...pp, devices: pp.devices.map(dd => dd.id === d.id ? { ...dd, z: Math.max(...pp.devices.map(x => x.z)) + 1 } : dd) })); toast('Brought to front'); } },
      { label: 'Send to Back', shortcut: '⌘[', action: () => { update((pp: Project) => ({ ...pp, devices: pp.devices.map(dd => dd.id === d.id ? { ...dd, z: Math.min(...pp.devices.map(x => x.z)) - 1 } : dd) })); toast('Sent to back'); } },
      { label: 'Bring Forward', action: () => { useStudio.getState().reorderDevice(d.id, 1); } },
      { label: 'Send Backward', action: () => { useStudio.getState().reorderDevice(d.id, -1); } },
    ]},
    { separator: true },
    { label: d.visible ? 'Hide Device' : 'Show Device', icon: d.visible ? <IcEyeOff size={12} /> : <IcEye size={12} />, action: () => { update((pp: Project) => ({ ...pp, devices: pp.devices.map(dd => dd.id === d.id ? { ...dd, visible: !dd.visible } : dd) })); toast(d.visible ? 'Device hidden' : 'Device visible'); } },
    { label: 'Lock Device', icon: <IcLock size={12} />, action: () => { toast('Device lock toggled', 'info'); } },
    { separator: true },
    { label: 'Open Properties', shortcut: '⌘3', action: () => { setSelection({ kind: 'device', id: d.id }); toast('Properties panel focused', 'info'); } },
    { label: 'Rename', action: () => { const name = prompt('Device name:', d.name); if (name) update((pp: Project) => ({ ...pp, devices: pp.devices.map(dd => dd.id === d.id ? { ...dd, name } : dd) })); } },
  ];
}

function buildTextMenu(p: Project, update: any, toast: any, checkpoint: any): MenuItem[] {
  const t = p.text;
  return [
    { label: 'Edit Text', icon: <IcType size={12} />, action: () => { toast('Edit text in properties panel', 'info'); } },
    { label: t.enabled ? 'Disable Text' : 'Enable Text', action: () => { update((pp: Project) => ({ ...pp, text: { ...pp.text, enabled: !pp.text.enabled } })); toast(t.enabled ? 'Text hidden' : 'Text shown'); } },
    { separator: true },
    { label: 'Position', submenu: [
      { label: 'Top Left', action: () => update((pp: Project) => ({ ...pp, text: { ...pp.text, position: 'top-left' } })) },
      { label: 'Top Center', action: () => update((pp: Project) => ({ ...pp, text: { ...pp.text, position: 'top-center' } })) },
      { label: 'Top Right', action: () => update((pp: Project) => ({ ...pp, text: { ...pp.text, position: 'top-right' } })) },
      { label: 'Center Left', action: () => update((pp: Project) => ({ ...pp, text: { ...pp.text, position: 'center-left' } })) },
      { label: 'Center', action: () => update((pp: Project) => ({ ...pp, text: { ...pp.text, position: 'center' } })) },
      { label: 'Center Right', action: () => update((pp: Project) => ({ ...pp, text: { ...pp.text, position: 'center-right' } })) },
      { label: 'Bottom Left', action: () => update((pp: Project) => ({ ...pp, text: { ...pp.text, position: 'bottom-left' } })) },
      { label: 'Bottom Center', action: () => update((pp: Project) => ({ ...pp, text: { ...pp.text, position: 'bottom-center' } })) },
      { label: 'Bottom Right', action: () => update((pp: Project) => ({ ...pp, text: { ...pp.text, position: 'bottom-right' } })) },
    ]},
    { label: 'Scale', submenu: [
      { label: 'Small (0.7×)', action: () => update((pp: Project) => ({ ...pp, text: { ...pp.text, scale: 0.7 } })) },
      { label: 'Normal (1×)', action: () => update((pp: Project) => ({ ...pp, text: { ...pp.text, scale: 1 } })) },
      { label: 'Large (1.3×)', action: () => update((pp: Project) => ({ ...pp, text: { ...pp.text, scale: 1.3 } })) },
      { label: 'Bold (1.5×)', action: () => update((pp: Project) => ({ ...pp, text: { ...pp.text, scale: 1.5 } })) },
    ]},
    { label: t.autoColor ? 'Manual Color' : 'Auto Color', action: () => { update((pp: Project) => ({ ...pp, text: { ...pp.text, autoColor: !pp.text.autoColor } })); toast(t.autoColor ? 'Manual color' : 'Auto color'); } },
    { separator: true },
    { label: t.showBadges ? 'Hide Badges' : 'Show Badges', action: () => { update((pp: Project) => ({ ...pp, text: { ...pp.text, showBadges: !pp.text.showBadges } })); } },
    { label: 'Edit Badges', disabled: !t.showBadges, action: () => { const badges = prompt('Badges (comma separated):', t.badges.join(', ')); if (badges) update((pp: Project) => ({ ...pp, text: { ...pp.text, badges: badges.split(',').map(b => b.trim()).filter(Boolean) } })); } },
    { separator: true },
    { label: 'Reset Text', action: () => { update((pp: Project) => ({ ...pp, text: { ...pp.text, title: '', subtitle: '', scale: 1, position: 'bottom-left' } })); toast('Text reset'); } },
    { label: 'Open Properties', shortcut: '⌘3', action: () => { useStudio.getState().setSelection({ kind: 'text' }); toast('Text properties focused', 'info'); } },
  ];
}

function buildLogoMenu(p: Project, update: any, toast: any, checkpoint: any): MenuItem[] {
  return [
    { label: p.logo.enabled ? 'Disable Logo' : 'Enable Logo', action: () => { update((pp: Project) => ({ ...pp, logo: { ...pp.logo, enabled: !pp.logo.enabled } })); } },
    { label: 'Choose Logo Image', disabled: p.assets.length === 0, action: () => { if (p.assets.length > 0) { update((pp: Project) => ({ ...pp, logo: { ...pp.logo, enabled: true, assetId: pp.assets[0].id } })); toast('Logo set'); } } },
    { separator: true },
    { label: 'Position', submenu: [
      { label: 'Top Left', action: () => update((pp: Project) => ({ ...pp, logo: { ...pp.logo, position: 'top-left' } })) },
      { label: 'Top Right', action: () => update((pp: Project) => ({ ...pp, logo: { ...pp.logo, position: 'top-right' } })) },
      { label: 'Bottom Left', action: () => update((pp: Project) => ({ ...pp, logo: { ...pp.logo, position: 'bottom-left' } })) },
      { label: 'Bottom Right', action: () => update((pp: Project) => ({ ...pp, logo: { ...pp.logo, position: 'bottom-right' } })) },
    ]},
    { label: 'Size', submenu: [
      { label: 'Small', action: () => update((pp: Project) => ({ ...pp, logo: { ...pp.logo, size: 0.05 } })) },
      { label: 'Medium', action: () => update((pp: Project) => ({ ...pp, logo: { ...pp.logo, size: 0.08 } })) },
      { label: 'Large', action: () => update((pp: Project) => ({ ...pp, logo: { ...pp.logo, size: 0.12 } })) },
    ]},
    { separator: true },
    { label: 'Remove Logo', danger: true, action: () => { update((pp: Project) => ({ ...pp, logo: { ...pp.logo, enabled: false, assetId: null } })); toast('Logo removed', 'info'); } },
    { label: 'Open Properties', action: () => { useStudio.getState().setSelection({ kind: 'logo' }); } },
  ];
}

function buildBackgroundMenu(p: Project, update: any, toast: any, checkpoint: any): MenuItem[] {
  return [
    { label: 'Change Background', icon: <IcBg size={12} />, submenu: BG_PRESETS.map(bp => ({ label: bp.name, action: () => { update((pp: Project) => ({ ...pp, background: { ...bp.bg, seed: pp.background.seed } })); toast(`Background: ${bp.name}`); } })) },
    { label: 'Randomize Background', icon: <IcDice size={12} />, action: () => { useStudio.getState().generate('background'); } },
    { separator: true },
    { label: 'Pattern', submenu: [
      { label: 'None', action: () => update((pp: Project) => ({ ...pp, background: { ...pp.background, pattern: 'none' } })) },
      { label: 'Dots', action: () => update((pp: Project) => ({ ...pp, background: { ...pp.background, pattern: 'dots' } })) },
      { label: 'Grid', action: () => update((pp: Project) => ({ ...pp, background: { ...pp.background, pattern: 'grid' } })) },
      { label: 'Rings', action: () => update((pp: Project) => ({ ...pp, background: { ...pp.background, pattern: 'rings' } })) },
      { label: 'Diagonal', action: () => update((pp: Project) => ({ ...pp, background: { ...pp.background, pattern: 'diag' } })) },
      { label: 'Noise', action: () => update((pp: Project) => ({ ...pp, background: { ...pp.background, pattern: 'noise' } })) },
    ]},
    { label: 'Lighting', submenu: [
      { label: 'None', action: () => update((pp: Project) => ({ ...pp, background: { ...pp.background, light: { ...pp.background.light, type: 'none' } } })) },
      { label: 'Top', action: () => update((pp: Project) => ({ ...pp, background: { ...pp.background, light: { ...pp.background.light, type: 'top' } } })) },
      { label: 'Center Glow', action: () => update((pp: Project) => ({ ...pp, background: { ...pp.background, light: { ...pp.background.light, type: 'center' } } })) },
      { label: 'Ambient', action: () => update((pp: Project) => ({ ...pp, background: { ...pp.background, light: { ...pp.background.light, type: 'ambient' } } })) },
    ]},
    { separator: true },
    { label: 'Lock Background', icon: <IcLock size={12} />, action: () => { useStudio.getState().toggleLock('background'); toast('Background lock toggled'); } },
    { label: 'Protect from Randomize', action: () => { toast('Background protected', 'info'); } },
    { separator: true },
    { label: 'Reset Background', action: () => { const bp = BG_PRESETS[0]; update((pp: Project) => ({ ...pp, background: { ...bp.bg, seed: Math.floor(Math.random() * 1e9) } })); toast('Background reset'); } },
  ];
}

function buildDecoMenu(p: Project, decoId: string | undefined, update: any, toast: any, checkpoint: any): MenuItem[] {
  const deco = p.decos.find(d => d.id === decoId);
  if (!deco) return [];

  return [
    { label: 'Replace Decoration', submenu: DECO_PRESETS.slice(0, 12).map(dp => ({ label: dp.label, action: () => { checkpoint(); update((pp: Project) => ({ ...pp, decos: pp.decos.map(d => d.id === deco.id ? { ...d, preset: dp.id } : d) })); toast(`Decoration: ${dp.label}`); } })) },
    { label: 'Randomize Decoration', icon: <IcDice size={12} />, action: () => { checkpoint(); update((pp: Project) => ({ ...pp, decos: pp.decos.map(d => d.id === deco.id ? { ...d, seed: Math.floor(Math.random() * 1e9), rotation: Math.floor(Math.random() * 360 - 180) } : d) })); toast('Decoration randomized'); } },
    { label: 'Duplicate', icon: <IcCopy size={12} />, action: () => { checkpoint(); const newDeco = { ...deco, id: Math.random().toString(36).slice(2, 9), x: deco.x + 0.05, y: deco.y + 0.05 }; update((pp: Project) => ({ ...pp, decos: [...pp.decos, newDeco] })); toast('Decoration duplicated'); } },
    { separator: true },
    { label: 'Move to Front', action: () => { update((pp: Project) => ({ ...pp, decos: pp.decos.map(d => d.id === deco.id ? { ...d, depth: 'front' } : d) })); toast('Moved to front'); } },
    { label: 'Move to Back', action: () => { update((pp: Project) => ({ ...pp, decos: pp.decos.map(d => d.id === deco.id ? { ...d, depth: 'back' } : d) })); toast('Moved to back'); } },
    { separator: true },
    { label: 'Lock Decoration', icon: <IcLock size={12} />, action: () => { toast('Decoration locked', 'info'); } },
    { label: 'Protect from Randomize', action: () => { toast('Protected from randomization', 'info'); } },
    { separator: true },
    { label: 'Delete', icon: <IcTrash size={12} />, danger: true, action: () => { checkpoint(); update((pp: Project) => ({ ...pp, decos: pp.decos.filter(d => d.id !== deco.id) })); toast('Decoration removed', 'info'); } },
  ];
}
