import { useRef, useState } from 'react';
import { Hand } from 'lucide-react';
import { avaluarParada, generarZonaOptima } from '../../game/minijocs';

export function BarraPotencia({ dificultat, onResultat }: { dificultat: number; onResultat: (encert: boolean) => void }) {
  const [zona] = useState(() => generarZonaOptima(dificultat));
  const barraRef = useRef<HTMLDivElement>(null);
  const marcadorRef = useRef<HTMLDivElement>(null);
  const [aturat, setAturat] = useState<number | null>(null);

  const parar = () => {
    if (aturat !== null || !marcadorRef.current || !barraRef.current) return;
    const barraRect = barraRef.current.getBoundingClientRect();
    const marcadorRect = marcadorRef.current.getBoundingClientRect();
    const centreMarcador = marcadorRect.left + marcadorRect.width / 2;
    const posicio = Math.max(0, Math.min(100, ((centreMarcador - barraRect.left) / barraRect.width) * 100));
    setAturat(posicio);
    onResultat(avaluarParada(posicio, zona));
  };

  return (
    <div className="barra-potencia-wrap">
      <div className="barra-potencia" ref={barraRef}>
        <div className="barra-zona-verda" style={{ left: `${zona[0]}%`, width: `${zona[1] - zona[0]}%` }} />
        {aturat === null
          ? <div className="barra-marcador movent" ref={marcadorRef} />
          : <div className="barra-marcador aturat" style={{ left: `${aturat}%` }} />}
      </div>
      <button className="btn btn-primari btn-blok" onClick={parar} disabled={aturat !== null}>
        <Hand size={18} /> Para la barra!
      </button>
    </div>
  );
}
