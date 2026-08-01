import { useEffect } from 'react';
import { useJoc } from '../game/store';

export function Toasts() {
  const toasts = useJoc((s) => s.toasts);
  const eliminarToast = useJoc((s) => s.eliminarToast);

  return (
    <div className="toasts-capa">
      {toasts.slice(-4).map((t) => (
        <ToastItem key={t.id} id={t.id} text={t.text} emoji={t.emoji} onClose={() => eliminarToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ id, text, emoji, onClose }: { id: string; text: string; emoji?: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="toast" onClick={onClose}>
      {emoji && <span className="toast-emoji">{emoji}</span>}
      <span>{text}</span>
    </div>
  );
}
