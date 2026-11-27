/** Original faceted wolf head for the Pack (no stock art). Ink facets, stamp-yellow eyes. */
export function Wolf({ className = "", eyes = "#edff00" }: { className?: string; eyes?: string }) {
  const f = ["#2b2346", "#362c57", "#211a38", "#3f3463", "#1d1730"];
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Wolf">
      <g stroke="#f7f7f5" strokeOpacity="0.16" strokeWidth="0.8" strokeLinejoin="round">
        <polygon points="50,14 80,68 38,82" fill={f[1]} />
        <polygon points="58,32 74,64 50,70" fill={f[2]} />
        <polygon points="150,14 162,82 120,68" fill={f[1]} />
        <polygon points="142,32 150,70 126,64" fill={f[2]} />
        <polygon points="80,68 100,58 120,68 100,104" fill={f[3]} />
        <polygon points="38,82 80,68 100,104 58,124" fill={f[0]} />
        <polygon points="162,82 142,124 100,104 120,68" fill={f[0]} />
        <polygon points="38,82 58,124 30,112" fill={f[4]} />
        <polygon points="162,82 170,112 142,124" fill={f[4]} />
        <polygon points="58,124 100,104 100,176 78,154" fill={f[1]} />
        <polygon points="142,124 122,154 100,176 100,104" fill={f[3]} />
        <polygon points="58,124 78,154 64,146" fill={f[2]} />
        <polygon points="142,124 136,146 122,154" fill={f[2]} />
      </g>
      <polygon points="70,92 90,98 74,102" fill={eyes} />
      <polygon points="130,92 126,102 110,98" fill={eyes} />
      <polygon points="91,160 109,160 100,174" fill="#f7f7f5" />
    </svg>
  );
}
