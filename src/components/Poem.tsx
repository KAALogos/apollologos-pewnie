import { memo } from 'react';
import { edition, stanzaLines } from '../lib/model';
import { renderPieces, stanzaMarks } from '../data/annotations';

interface Props {
  glossesEnabled: boolean;
  activeId: number | null;
  visited: ReadonlySet<number>;
  onPick(ids: number[], key: string): void;
}

const icons = {
  wedge: <path d="M3 4.5h12L9 15z"/>,
  rect: <rect x="3.5" y="4.5" width="11" height="9"/>,
  cycle: <><path d="M9 3.5a5.5 5.5 0 1 1-5.2 3.7"/><path d="M2.6 3.8l1.2 3.4 3.3-1.3"/></>,
};

export const Poem = memo(function Poem({glossesEnabled,activeId,visited,onPick}:Props) {
  const stanzas=stanzaLines(edition.poem);
  return <article className="poem" aria-label="Tekst wiersza PEWNIE">
    {stanzas.map((lines,si) => {
      const mark=glossesEnabled?stanzaMarks.find(m=>m.stanza===si):undefined;
      const linked=!!(mark&&activeId&&mark.ids.includes(activeId));
      return <div className={`stanza stanza-${si} ${linked?'stanza-linked':''}`} key={si}>
        <div className="stanza-gutter">{mark&&<button type="button" key={`mark-${si}`}
            className={`stanza-mark ${linked?'stanza-mark-active':''} ${visited.has(mark.ids[0])?'stanza-mark-read':''}`}
            data-glosses={mark.ids.join(' ')} data-key={`stanza-${si}`} title={`${mark.label} — glosa ${mark.ids[0]}`}
            aria-label={`Cała strofoida: ${mark.label}, glosy: ${mark.ids.join(', ')}`} aria-pressed={linked}
            onClick={()=>onPick(mark.ids,`stanza-${si}`)}>
          <svg viewBox="0 0 18 18" aria-hidden="true">{icons[mark.shape]}</svg><span className="bracket"/>
        </button>}</div>
        <div className="stanza-lines">
          {lines.map((line,li) => {
            const verse=`${si}:${li}`;
            return <div className={`verse ${si === 0 ? 'poem-title' : ''}`} key={verse} data-verse={verse}>
              {renderPieces(line,verse).map(piece => piece.ids.length && glossesEnabled
                ? <button key={piece.key} data-key={piece.key}
                    className={`hotspot ${activeId && (piece.ids.includes(activeId) || piece.echoes.includes(activeId)) ? 'hotspot-active' : ''} ${visited.has(piece.ids[0]) ? 'hotspot-read' : ''}`}
                    data-glosses={piece.ids.join(' ')} type="button" aria-label={`${piece.text}, glosy: ${piece.ids.join(', ')}${visited.has(piece.ids[0]) ? ' (przeczytane)' : ''}`}
                    aria-pressed={!!activeId && piece.ids.includes(activeId)}
                    onClick={() => onPick(piece.ids,piece.key)}>{piece.text}</button>
                : <span key={piece.key}>{piece.text}</span>
              )}
            </div>;
          })}
        </div>
      </div>;
    })}
  </article>;
});
