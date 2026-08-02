import { Newspaper } from 'lucide-react';
import { useJoc } from '../game/store';

export function AnecdotaModal() {
  const anecdota = useJoc((s) => s.anecdotaPendent);
  const tancar = useJoc((s) => s.tancarAnecdota);
  if (!anecdota) return null;

  return (
    <div className="modal-fons" onClick={tancar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="card-titol"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Newspaper size={18} /> Rumors de vestidor</span></div>
        <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{anecdota}</p>
        <button className="btn btn-primari btn-blok" onClick={tancar}>D&apos;acord</button>
      </div>
    </div>
  );
}
