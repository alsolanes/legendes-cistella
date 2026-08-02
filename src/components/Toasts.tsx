import { useEffect, type ComponentType } from 'react';
import { Award, Sparkles, PenLine, Frown, Sprout } from 'lucide-react';
import { useJoc } from '../game/store';
import { IconaToast } from '../game/store';

const ICONA_TOAST: Record<IconaToast, ComponentType<{ size?: number | string }>> = {
  assoliment: Award,
  perk: Sparkles,
  fitxatge: PenLine,
  refusa: Frown,
  cantera: Sprout,
};

export function Toasts() {
  const toasts = useJoc((s) => s.toasts);
  const eliminarToast = useJoc((s) => s.eliminarToast);

  return (
    <div className="toasts-capa">
      {toasts.slice(-4).map((t) => (
        <ToastItem key={t.id} id={t.id} text={t.text} icona={t.icona} onClose={() => eliminarToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ id, text, icona, onClose }: { id: string; text: string; icona?: IconaToast; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const Icona = icona ? ICONA_TOAST[icona] : null;

  return (
    <div className="toast" onClick={onClose}>
      {Icona && <span className="toast-emoji"><Icona size={18} /></span>}
      <span>{text}</span>
    </div>
  );
}
