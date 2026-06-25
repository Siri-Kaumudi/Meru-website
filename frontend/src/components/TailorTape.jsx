import { useEffect } from 'react';

// ── Dimensions ─────────────────────────────────────────────────────────────
const CM_PX   = 40;                      // px per centimetre
const IN_PX   = 2.54 * CM_PX;           // px per inch ≈ 101.6 px
const TAPE_CM = 60;                      // cm per tape segment
const TAPE_PX = TAPE_CM * CM_PX;        // 2400 px
const TIP_W   = 26;                      // gold metal end-cap width (px)
const GAP_PX  = 240;                     // gap between tape segments
const UNIT_PX = GAP_PX + TAPE_PX + TIP_W; // ≈ 2666 px — one animation unit
const COPIES  = 3;                       // 3 copies → covers any viewport
const H       = 42;                      // total strip height (px)
const H_CM    = 16;                      // upper cm-scale strip height
const H_IN    = H - H_CM;               // lower inch-scale strip height = 26
const SPEED   = 55;                      // seconds per unit
const TIP_X   = GAP_PX + TAPE_PX;       // x where gold cap starts

// ── Pre-generate marks (module-level, one time) ────────────────────────────
const CM_MARKS = [];
for (let c = 0; c <= TAPE_CM; c++) {
  CM_MARKS.push({ x: GAP_PX + c * CM_PX, c });
}

const HALF_CM_MARKS = [];
for (let c = 0; c < TAPE_CM; c++) {
  HALF_CM_MARKS.push({ x: GAP_PX + c * CM_PX + CM_PX * 0.5 });
}

const maxIn = Math.ceil(TAPE_CM / 2.54);
const INCH_MARKS = [];
for (let i = 0; i <= maxIn; i++) {
  const x = GAP_PX + i * IN_PX;
  if (x <= GAP_PX + TAPE_PX + 1) INCH_MARKS.push({ x, i });
}

const HALF_IN_MARKS = [];
for (let i = 0; i < maxIn; i++) {
  const x = GAP_PX + (i + 0.5) * IN_PX;
  if (x <= GAP_PX + TAPE_PX - 1) HALF_IN_MARKS.push({ x });
}

// ── Component ──────────────────────────────────────────────────────────────
export default function TailorTape() {
  useEffect(() => {
    const id = 'tailor-tape-kf';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      @keyframes tape-scroll {
        from { transform: translateX(0); }
        to   { transform: translateX(-${UNIT_PX}px); }
      }
    `;
    document.head.appendChild(s);
  }, []);

  const totalW = UNIT_PX * COPIES;

  return (
    <div
      aria-hidden="true"
      style={{
        overflow  : 'hidden',
        height    : H,
        lineHeight: 0,
        background: '#1e3a8a',       /* primary-900 — fills the gap between tapes */
        boxShadow : '0 2px 5px rgba(0,0,0,0.25)',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={totalW}
        height={H}
        style={{
          display   : 'block',
          animation : `tape-scroll ${SPEED}s linear infinite`,
          willChange: 'transform',
        }}
      >
        <defs>
          {/* Orange tape gradient */}
          <linearGradient id="tt-tape" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#F49B5C" />
            <stop offset="100%" stopColor="#D9722A" />
          </linearGradient>

          {/* Upper cm strip — very slightly lighter */}
          <linearGradient id="tt-upper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#F8B07A" />
            <stop offset="100%" stopColor="#EF9050" />
          </linearGradient>

          {/* Gold end-cap gradient */}
          <linearGradient id="tt-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#FEF3A0" />
            <stop offset="20%"  stopColor="#F5C842" />
            <stop offset="60%"  stopColor="#C49000" />
            <stop offset="100%" stopColor="#7A5500" />
          </linearGradient>

          {/* Gold sheen */}
          <linearGradient id="tt-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#fff" stopOpacity="0.4" />
            <stop offset="45%"  stopColor="#fff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {Array.from({ length: COPIES }, (_, copy) => {
          const dx = copy * UNIT_PX;
          return (
            <g key={copy} transform={`translate(${dx},0)`}>

              {/* ── Tape body ── */}
              <rect x={GAP_PX} y={0}      width={TAPE_PX} height={H}    fill="url(#tt-tape)"  />
              <rect x={GAP_PX} y={0}      width={TAPE_PX} height={H_CM} fill="url(#tt-upper)" />

              {/* Top / bottom edges */}
              <line x1={GAP_PX} y1={0.75}   x2={GAP_PX+TAPE_PX} y2={0.75}   stroke="#2A0E00" strokeWidth="1.5" />
              <line x1={GAP_PX} y1={H-0.75} x2={GAP_PX+TAPE_PX} y2={H-0.75} stroke="#2A0E00" strokeWidth="1.5" />

              {/* Dividing line between cm and inch strips */}
              <line x1={GAP_PX} y1={H_CM} x2={GAP_PX+TAPE_PX} y2={H_CM} stroke="#2A0E00" strokeWidth="0.9" />

              {/* ── CM scale (upper strip) ── */}
              {CM_MARKS.map(({ x, c }) => (
                <g key={`c${c}`}>
                  {/* Vertical divider — taller every 10 cm */}
                  <line
                    x1={x} y1={0}
                    x2={x} y2={c % 10 === 0 ? H_CM : H_CM * 0.8}
                    stroke="#2A0E00"
                    strokeWidth={c % 10 === 0 ? 1.3 : 0.8}
                  />
                  {/* CM number (skip 0) */}
                  {c > 0 && (
                    <text
                      x={x - CM_PX * 0.5}
                      y={H_CM - 3}
                      textAnchor="middle"
                      fontSize={c % 10 === 0 ? 9.5 : 8}
                      fontFamily="Arial, Helvetica, sans-serif"
                      fontWeight={c % 10 === 0 ? '900' : '700'}
                      fill="#1A0800"
                    >
                      {c}
                    </text>
                  )}
                </g>
              ))}

              {/* Half-cm small ticks */}
              {HALF_CM_MARKS.map(({ x }, idx) => (
                <line
                  key={`hc${idx}`}
                  x1={x} y1={0}
                  x2={x} y2={H_CM * 0.45}
                  stroke="#2A0E00"
                  strokeWidth="0.6"
                  strokeOpacity="0.7"
                />
              ))}

              {/* ── Inch scale (lower strip) ── */}
              {INCH_MARKS.map(({ x, i }) => (
                <g key={`in${i}`}>
                  {/* Full-height divider in lower strip */}
                  <line
                    x1={x} y1={H_CM}
                    x2={x} y2={H}
                    stroke="#2A0E00"
                    strokeWidth="1.1"
                  />
                  {/* Inch number (skip 0) */}
                  {i > 0 && (
                    <text
                      x={x - IN_PX * 0.5}
                      y={H - 5}
                      textAnchor="middle"
                      fontSize="13"
                      fontFamily="Arial, Helvetica, sans-serif"
                      fontWeight="900"
                      fill="#1A0800"
                    >
                      {i}
                    </text>
                  )}
                </g>
              ))}

              {/* Half-inch downward triangle markers */}
              {HALF_IN_MARKS.map(({ x }, idx) => (
                <polygon
                  key={`hi${idx}`}
                  points={`${x-3.5},${H_CM+3} ${x+3.5},${H_CM+3} ${x},${H_CM+9}`}
                  fill="#2A0E00"
                  fillOpacity="0.65"
                />
              ))}

              {/* ── Gold metal end-cap ── */}
              <rect x={TIP_X}   y={0} width={TIP_W} height={H} fill="url(#tt-gold)"  />
              <rect x={TIP_X}   y={0} width={TIP_W} height={H} fill="url(#tt-sheen)" />
              {/* Highlight top */}
              <line x1={TIP_X+1} y1={1}   x2={TIP_X+TIP_W-1} y2={1}   stroke="#FEF3A0" strokeWidth="0.9" strokeOpacity="0.7" />
              {/* Shadow bottom */}
              <line x1={TIP_X+1} y1={H-1} x2={TIP_X+TIP_W-1} y2={H-1} stroke="#7A5500" strokeWidth="1"                       />
              {/* Left seam */}
              <line x1={TIP_X}   y1={0}   x2={TIP_X}          y2={H}   stroke="#2A0E00" strokeWidth="0.8"                     />
              {/* Rivet */}
              <circle cx={TIP_X+TIP_W*0.5} cy={H*0.5} r={3.2} fill="#6B3300" />
              <circle cx={TIP_X+TIP_W*0.5} cy={H*0.5} r={1.9} fill="#2D1000" />
              <circle cx={TIP_X+TIP_W*0.5-0.7} cy={H*0.5-0.7} r={0.8} fill="#FEF3A0" fillOpacity="0.65" />

            </g>
          );
        })}
      </svg>
    </div>
  );
}
