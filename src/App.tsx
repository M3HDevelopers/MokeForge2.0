import { useEffect } from 'react';
import { useStudio } from './store';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/Editor';
import { IcCheck, IcClose, IcSpark } from './icons';

function Toasts() {
  const toasts = useStudio(s => s.toasts);
  const dismiss = useStudio(s => s.dismissToast);
  const color = (t: 'ok' | 'err' | 'info') =>
    t === 'ok' ? 'var(--color-acc2)' : t === 'err' ? 'var(--color-danger)' : 'var(--color-gold)';
  return (
    <div className="fixed bottom-5 right-5 z-[60] space-y-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="anim-toast pointer-events-auto flex items-center gap-2.5 pl-3 pr-2 py-2.5 rounded-lg border bg-panel2 shadow-[0_16px_44px_rgba(0,0,0,0.5)]"
          style={{ borderColor: 'var(--color-line)' }}
        >
          <span style={{ color: color(t.tone) }}>
            {t.tone === 'ok' ? <IcCheck size={14} /> : t.tone === 'err' ? <IcClose size={14} /> : <IcSpark size={14} />}
          </span>
          <span className="text-[12.5px] max-w-[300px]">{t.msg}</span>
          <button className="icon-btn !w-6 !h-6 ml-1" onClick={() => dismiss(t.id)}><IcClose size={11} /></button>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const booted = useStudio(s => s.booted);
  const view = useStudio(s => s.view);
  const project = useStudio(s => s.project);
  const boot = useStudio(s => s.boot);

  useEffect(() => { boot(); }, [boot]);
  if (!booted) return null;

  return (
    <div className="h-full bg-ink text-fg overflow-hidden">
      {view === 'editor' && project ? <Editor /> : <Dashboard />}
      <Toasts />
    </div>
  );
}
