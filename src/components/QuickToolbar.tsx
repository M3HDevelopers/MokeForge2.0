import { useStudio } from '../store';
import { IcCopy, IcTrash, IcLock, IcEye, IcEyeOff, IcUp, IcDown, IcSpark } from '../icons';

export function QuickToolbar() {
  const selection = useStudio(s => s.selection);
  const project = useStudio(s => s.project);
  const update = useStudio(s => s.update);
  const toast = useStudio(s => s.toast);
  const zoom = useStudio(s => s.zoom);

  if (!project || !selection || selection.kind !== 'device' || !selection.id) return null;
  const d = project.devices.find(x => x.id === selection.id);
  if (!d) return null;

  const h = d.w / (project.devices[0]?.w ? project.canvas.w / project.devices[0].w : 1.56);

  // Position toolbar above the device
  const tx = d.x * zoom + (d.w * zoom) / 2;
  const ty = d.y * zoom - 40;

  return (
    <div
      className="fixed z-40 flex items-center gap-0.5 px-1 py-1 rounded-lg border border-line bg-panel2 shadow-[0_8px_24px_rgba(0,0,0,0.5)] anim-pop"
      style={{ left: `calc(264px + ${tx}px - 100px)`, top: `calc(48px + ${ty}px)` }}
    >
      <button className="icon-btn !w-7 !h-7" title="Duplicate (⌘D)" onClick={() => { useStudio.getState().duplicateDevice(d.id); toast('Device duplicated'); }}>
        <IcCopy size={13} />
      </button>
      <button className="icon-btn !w-7 !h-7" title="Delete (⌫)" onClick={() => { useStudio.getState().removeDevice(d.id); toast('Device removed', 'info'); }}>
        <IcTrash size={13} />
      </button>
      <div className="w-px h-4 bg-line mx-0.5" />
      <button className="icon-btn !w-7 !h-7" title={d.visible ? 'Hide' : 'Show'} onClick={() => { update(p => ({ ...p, devices: p.devices.map(dd => dd.id === d.id ? { ...dd, visible: !dd.visible } : dd) })); }}>
        {d.visible ? <IcEyeOff size={13} /> : <IcEye size={13} />}
      </button>
      <button className="icon-btn !w-7 !h-7" title="Bring Forward" onClick={() => { useStudio.getState().reorderDevice(d.id, 1); }}>
        <IcUp size={13} />
      </button>
      <button className="icon-btn !w-7 !h-7" title="Send Backward" onClick={() => { useStudio.getState().reorderDevice(d.id, -1); }}>
        <IcDown size={13} />
      </button>
      <div className="w-px h-4 bg-line mx-0.5" />
      <button className="icon-btn !w-7 !h-7" title="Lock" onClick={() => { toast('Device lock toggled', 'info'); }}>
        <IcLock size={13} />
      </button>
      <button className="icon-btn !w-7 !h-7" title="Randomize" onClick={() => { useStudio.getState().generate('all'); }}>
        <IcSpark size={13} />
      </button>
    </div>
  );
}
