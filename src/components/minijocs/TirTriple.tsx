import { useState } from 'react';
import { BarraPotencia } from './BarraPotencia';

export function TirTriple({ onFinish }: { onFinish: (encerts: number) => void }) {
  const [resultat, setResultat] = useState<boolean | null>(null);

  const resoldre = (encert: boolean) => {
    setResultat(encert);
    setTimeout(() => onFinish(encert ? 1 : 0), 900);
  };

  return (
    <div className="minijoc">
      <div className="minijoc-titol">🏹 Tir de tres</div>
      <div className="minijoc-sub">Clica just quan la barra passi per la zona verda</div>
      {resultat === null
        ? <BarraPotencia dificultat={13} onResultat={resoldre} />
        : <div className={`minijoc-resultat ${resultat ? 'encert' : 'fallat'}`}>{resultat ? '🎯 TRIPLE!' : '❌ Fora!'}</div>}
    </div>
  );
}
