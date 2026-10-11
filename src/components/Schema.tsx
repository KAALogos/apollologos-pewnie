import { edition, stanzaLines } from '../lib/model';

// Schemes are computed from the canonical poem, so they cannot drift away from the text.
const stanzas = stanzaLines(edition.poem);
const length = (line: string) => [...line.trim()].length;
const words = (line: string) => line.trim().split(/\s+/);
const bare = (word: string) => word.replace(/[.,;:!?]/g, '').toLocaleLowerCase('pl');
const WORD_COLOR: Record<string, string> = {pewnie: '#9cb8d7', jestem: '#9fb9a1', człowiekiem: '#d1a08b'};

interface BarsProps { groups: {stanza: number; label: string}[]; caption: string }

function Bars({groups, caption}: BarsProps) {
  const data = groups.map(g => ({...g, lens: stanzas[g.stanza].map(length)}));
  const max = Math.max(...data.flatMap(d => d.lens));
  const rows = Math.max(...data.map(d => d.lens.length));
  const W = 300, gap = 16, cw = (W - gap * (data.length - 1)) / data.length, rowH = 10;
  const H = rows * rowH + 34, scale = cw / max;
  return <figure className="schema">
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={caption}>
      {data.map((d, gi) => {
        const x0 = gi * (cw + gap);
        const equal = d.lens.every(n => n === d.lens[0]);
        const edge = d.lens.map((n, i) => `${x0 + n * scale},${i * rowH + 2.5}`).join(' ');
        return <g key={d.stanza}>
          {d.lens.map((n, i) => <rect key={i} className="bar" x={x0} y={i * rowH} width={n * scale} height={5} rx={1}/>)}
          {equal
            ? <rect className="outline" x={x0 - 3} y={-3} width={d.lens[0] * scale + 6} height={d.lens.length * rowH - 1} rx={2}/>
            : <polyline className="edge" points={edge}/>}
          <text className="cap" x={x0} y={rows * rowH + 14}>{d.label}</text>
          <text className="num" x={x0} y={rows * rowH + 27}>{equal ? `${d.lens.length} × ${d.lens[0]} zn.` : `${Math.min(...d.lens)}–${Math.max(...d.lens)} zn.`}</text>
        </g>;
      })}
    </svg>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Rotation() {
  const rows = stanzas[6].map(words);
  const W = 300, colW = 100, rowH = 38, H = rows.length * rowH;
  const centre = (r: number, c: number) => [c * colW + colW / 2, r * rowH + rowH / 2];
  const names = Object.keys(WORD_COLOR);
  return <figure className="schema">
    <svg viewBox={`0 0 ${W} ${H + 4}`} role="img" aria-label="Siatka trzech cyklicznych przestawień wyrazów w finale">
      {names.map(name => <polyline key={name} className="path" stroke={WORD_COLOR[name]}
        points={rows.map((r, ri) => centre(ri, r.findIndex(w => bare(w) === name)).join(',')).join(' ')}/>)}
      {rows.map((r, ri) => r.map((w, ci) => {
        const [cx, cy] = centre(ri, ci), colour = WORD_COLOR[bare(w)] ?? '#888';
        return <g key={`${ri}-${ci}`}>
          <rect className="cell" x={ci * colW + 4} y={ri * rowH + 5} width={colW - 8} height={rowH - 10} rx={5} fill={colour}/>
          <text className="word" x={cx} y={cy + 4} textAnchor="middle">{w}</text>
        </g>;
      }))}
    </svg>
    <figcaption>Każdy wyraz zajmuje kolejno wszystkie trzy pozycje; linie łączą te same wyrazy w kolejnych wersach.</figcaption>
  </figure>;
}

function Wandering() {
  const rows = [
    {label: 'adwokat', line: stanzas[1][0]}, {label: 'aktor', line: stanzas[2][0]}, {label: 'stand-uper', line: stanzas[3][0]},
    {label: 'finał 1', line: stanzas[6][0]}, {label: 'finał 2', line: stanzas[6][1]}, {label: 'finał 3', line: stanzas[6][2]},
  ];
  return <figure className="schema">
    <div className="strip">{rows.map(r => {
      const w = words(r.line), at = w.findIndex(x => bare(x) === 'pewnie');
      return <div className="strip-row" key={r.label}>
        <span className="strip-label">{r.label}</span>
        <span className="strip-words">{w.map((x, i) => <span key={i} className={i === at ? 'chip chip-on' : 'chip'}>{x}</span>)}</span>
        <span className="strip-pos">{at + 1}.</span>
      </div>;
    })}</div>
    <figcaption>Pozycja wyrazu „pewnie” w pierwszych wersach trzech strofoid zawodowych i w finale.</figcaption>
  </figure>;
}

export function Schema({id}: {id: number}) {
  if (id === 3) return <Wandering/>;
  if (id === 33) return <Bars caption="Długość wersów w znakach: trzy kliny o coraz szerszym otwarciu." groups={[
    {stanza: 1, label: 'adwokat'}, {stanza: 2, label: 'aktor'}, {stanza: 3, label: 'stand-uper'}]}/>;
  if (id === 34) return <Bars caption="Zwężanie ustępuje stabilności: w finale każdy wers ma tyle samo znaków." groups={[
    {stanza: 4, label: 'wartości'}, {stanza: 5, label: 'nauczyciel'}, {stanza: 6, label: 'finał'}]}/>;
  if (id === 35) return <Rotation/>;
  return null;
}
