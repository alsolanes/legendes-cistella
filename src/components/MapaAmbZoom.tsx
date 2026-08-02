// ── Zoom/pan real per al mapa SVG ──────────────────────────────
// Gestiona: roda del ratolí (zoom al cursor), pinch amb 2 dits (zoom+pan),
// arrossegar (pan) i botons +/−/⌂. El viewBox es recalcula dinàmicament.
// PITFALL: NO es pot fer setPointerCapture — segresta el click dels paths
// (les comarques deixen de ser clicables). En lloc seu: pan amb llindar de
// moviment (si el dit no es mou, el click passa naturalment a l'SVG).
import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Plus, Minus, Crosshair } from 'lucide-react';

const AMPLE = 360;   // viewBox base
const ALT = 420;
const MIN_S = 1;
const MAX_S = 14;
const LLINDAR_DRAG = 6; // px de moviment per considerar-lo arrossegament

interface Vista { x: number; y: number; s: number }

const ZoomContext = createContext(1);
export const useZoom = () => useContext(ZoomContext);

interface Props {
  children: ReactNode;
  botons?: boolean;
  instruccions?: boolean;
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

export function MapaAmbZoom({ children, botons = true, instruccions = true }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [vista, setVista] = useState<Vista>({ x: 0, y: 0, s: 1 });
  const vistaRef = useRef(vista);
  vistaRef.current = vista;
  const arrossegant = useRef(false);
  const pointers = useRef(new Map<number, { px: number; py: number; iniX: number; iniY: number }>());
  const pinchPrev = useRef<{ dist: number; cx: number; cy: number } | null>(null);

  const viewBox = `${vista.x} ${vista.y} ${AMPLE / vista.s} ${ALT / vista.s}`;

  /** Punt del cursor en píxels del SVG base (0..360, 0..420) */
  const puntBase = (clientX: number, clientY: number) => {
    const el = wrapRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { px: ((clientX - r.left) / r.width) * AMPLE, py: ((clientY - r.top) / r.height) * ALT };
  };

  /** Aplica un nou estat amb límits de pan/zoom */
  const aplicar = (nx: number, ny: number, ns: number) => {
    const s = clamp(ns, MIN_S, MAX_S);
    const w = AMPLE / s;
    const h = ALT / s;
    const x = clamp(nx, 0, Math.max(0, AMPLE - w));
    const y = clamp(ny, 0, Math.max(0, ALT - h));
    setVista({ x, y, s });
  };

  /** Zoom mantenint el punt sota el cursor fix */
  const zoomCentrat = (clientX: number, clientY: number, factor: number) => {
    const p = puntBase(clientX, clientY);
    if (!p) return;
    const v = vistaRef.current;
    const ns = clamp(v.s * factor, MIN_S, MAX_S);
    const pxMon = v.x + p.px / v.s;
    const pyMon = v.y + p.py / v.s;
    aplicar(pxMon - p.px / ns, pyMon - p.py / ns, ns);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const p = puntBase(e.clientX, e.clientY);
    if (!p) return;
    pointers.current.set(e.pointerId, { ...p, iniX: e.clientX, iniY: e.clientY });
    pinchPrev.current = null;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = puntBase(e.clientX, e.clientY);
    if (!p) return;
    const actius = pointers.current;

    if (actius.size === 2) {
      // Pinch: zoom + pan amb 2 dits
      arrossegant.current = true;
      const [a, b] = [...actius.values()];
      const dist = Math.hypot(a.px - b.px, a.py - b.py);
      const cx = (a.px + b.px) / 2;
      const cy = (a.py + b.py) / 2;
      const prev = pinchPrev.current;
      if (prev && prev.dist > 0) {
        const v = vistaRef.current;
        const ns = clamp(v.s * (dist / prev.dist), MIN_S, MAX_S);
        const pxMon = v.x + prev.cx / v.s;
        const pyMon = v.y + prev.cy / v.s;
        aplicar(pxMon - cx / ns, pyMon - cy / ns, ns);
      }
      pinchPrev.current = { dist, cx, cy };
      return;
    }

    const info = actius.get(e.pointerId);
    if (!info) return;
    // Llindar: si el dit gairebé no s'ha mogut, és un clic → deixem passar el click natural
    const mogut = Math.hypot(e.clientX - info.iniX, e.clientY - info.iniY);
    if (!arrossegant.current && mogut < LLINDAR_DRAG) return;
    arrossegant.current = true;
    const v = vistaRef.current;
    aplicar(v.x - (p.px - info.px) / v.s, v.y - (p.py - info.py) / v.s, v.s);
    actius.set(e.pointerId, { ...p, iniX: info.iniX, iniY: info.iniY });
    pinchPrev.current = null;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    pinchPrev.current = null;
    // Allibera l'estat d'arrossegament quan s'aixeca el darrer dit
    if (pointers.current.size === 0) {
      setTimeout(() => { arrossegant.current = false; }, 0);
    }
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomCentrat(e.clientX, e.clientY, e.deltaY < 0 ? 1.3 : 0.77);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div className="mapa-zoom">
      <div
        ref={wrapRef}
        className="mapa-zoom-wrap"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <ZoomContext.Provider value={vista.s}>
          <svg viewBox={viewBox} className="mapa-catalunya" role="img" aria-label="Mapa de Catalunya per comarques (amb zoom)">
            {children}
          </svg>
        </ZoomContext.Provider>
      </div>

      {botons && (
        <div className="mapa-zoom-botons">
          <button className="btn btn-secundari" onClick={() => zoomCentrat(AMPLE / 2, ALT / 2, 1.5)} aria-label="Apropa">
            <Plus size={16} />
          </button>
          <button className="btn btn-secundari" onClick={() => zoomCentrat(AMPLE / 2, ALT / 2, 0.67)} aria-label="Allunya">
            <Minus size={16} />
          </button>
          <button className="btn btn-secundari" onClick={() => aplicar(0, 0, 1)} aria-label="Centra el mapa">
            <Crosshair size={16} />
          </button>
        </div>
      )}

      {instruccions && vista.s > 1 && (
        <div className="mapa-zoom-hint">Arrossega per moure · roda/pinch per fer zoom</div>
      )}
    </div>
  );
}
