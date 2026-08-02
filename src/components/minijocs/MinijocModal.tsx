import { Timer } from 'lucide-react';
import { useJoc } from '../../game/store';
import { TirLliure } from './TirLliure';
import { TirTriple } from './TirTriple';
import { Robatori } from './Robatori';

export function MinijocModal() {
  const minijocPendent = useJoc((s) => s.minijocPendent);
  const resoldreMinijoc = useJoc((s) => s.resoldreMinijoc);
  const saltarMinijoc = useJoc((s) => s.saltarMinijoc);
  if (!minijocPendent) return null;

  return (
    <div className="modal-fons">
      <div className="modal minijoc-modal">
        <div className="minijoc-context" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Timer size={14} /> {minijocPendent.context}</div>
        {minijocPendent.tipus === 'tirLliure' && <TirLliure onFinish={resoldreMinijoc} />}
        {minijocPendent.tipus === 'tirTriple' && <TirTriple onFinish={resoldreMinijoc} />}
        {minijocPendent.tipus === 'robatori' && <Robatori onFinish={resoldreMinijoc} />}
        <button className="btn btn-secundari btn-blok" style={{ marginTop: 12 }} onClick={saltarMinijoc}>
          Saltar
        </button>
      </div>
    </div>
  );
}
