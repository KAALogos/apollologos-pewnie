import { memo } from 'react';
import { edition, stanzaLines } from '../lib/model';
import { renderPieces } from '../data/annotations';

interface Props {
  glossesEnabled: boolean;
  activeId: number | null;
  onPick(ids: number[], verse: string): void;
}

export const Poem = memo(function Poem({glossesEnabled,activeId,onPick}:Props) {
  const stanzas=stanzaLines(edition.poem);
  return <article className="poem" aria-label="Tekst wiersza PEWNIE">
    {stanzas.map((lines,si) => <div className={`stanza stanza-${si}`} key={si}>
      {lines.map((line,li) => {
        const verse=`${si}:${li}`;
        return <div className={`verse ${si === 0 ? 'poem-title' : ''}`} key={verse} data-verse={verse}>
          {renderPieces(line,verse).map(piece => piece.ids.length && glossesEnabled
            ? <button key={piece.key} className={`hotspot ${activeId && piece.ids.includes(activeId) ? 'hotspot-active' : ''}`}
                data-glosses={piece.ids.join(' ')} type="button" aria-label={`${piece.text}, glosy: ${piece.ids.join(', ')}`}
                aria-pressed={!!activeId && piece.ids.includes(activeId)}
                onClick={() => onPick(piece.ids,verse)}>{piece.text}</button>
            : <span key={piece.key}>{piece.text}</span>
          )}
        </div>;
      })}
    </div>)}
  </article>;
});
