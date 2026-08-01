import { useState } from 'react';
import { BarraPotencia } from './BarraPotencia';

export function TirLliure({ onFinish }: { onFinish: (encerts: number) => void }) {
  const [tir, setTir] = useState(1);
  const [encerts, setEncerts] = useState(0);
  const [ultimResultat, setUltimResultat] = useState<boolean | null>(null);

  const resoldre = (encert: boolean) => {
    setUltimResultat(encert);
    const nousEncerts = encerts + (encert ? 1 : 0);
    setEncerts(nousEncerts);
    setTimeout(() => {
      if (tir >= 2) {
        onFinish(nousEncerts);
      } else {
        setTir(2);
        setUltimResultat(null);
      }
    }, 900);
  };

  return (
    <div className="minijoc">
      <div className="minijoc-titol">🎯 Tir lliure · {tir}/2</div>
      <div className="minijoc-sub">Para la barra dins la zona verda per encistellar</div>
      {ultimResultat === null
        ? <BarraPotencia key={tir} dificultat={8} onResultat={resoldre} />
        : <div className={`minijoc-resultat ${ultimResultat ? 'encert' : 'fallat'}`}>{ultimResultat ? '🏀 DINS!' : '❌ Fora!'}</div>}
    </div>
  );
}
