import { useMemo, useState, type CSSProperties } from 'react';
import { edition, glossById } from '../lib/model';
import { GlossBody } from './GlossBody';

type Mode = 'entry' | 'index' | 'connections';
interface Props {
  activeId: number | null;
  availableIds: number[];
  mode: Mode;
  onMode(mode:Mode): void;
  onChoose(id:number): void;
  onDismiss(): void;
  onHide(): void;
}

export function GlossPanel({activeId,availableIds,mode,onMode,onChoose,onDismiss,onHide}:Props){
  const [query,setQuery]=useState('');
  const entry=activeId===null?null:glossById.get(activeId)??null;
  const results=useMemo(() => edition.glosses.filter(g =>
    `${g.id} ${g.title} ${g.fragment} ${g.body}`.toLocaleLowerCase('pl').includes(query.trim().toLocaleLowerCase('pl'))
  ),[query]);
  return <aside className="gloss-panel" aria-label="Panel glos" id="gloss-panel">
    <div className="panel-topline">
      <div className="panel-eyebrow">APOLLOLOGOS <span className="slash">/</span> 36 GLOS</div>
      <button type="button" className="icon-action" onClick={onDismiss} aria-label="Zamknij panel">×</button>
    </div>
    <div className="panel-tabs" role="tablist" aria-label="Narzędzia lektury">
      <button role="tab" aria-selected={mode==='entry'} onClick={() => onMode('entry')}>Glosa</button>
      <button role="tab" aria-selected={mode==='index'} onClick={() => onMode('index')}>Indeks</button>
      <button role="tab" aria-selected={mode==='connections'} onClick={() => onMode('connections')}>Relacje</button>
    </div>
    <div className="panel-content">
      {mode === 'entry' && (entry ? <>
        <div className="entry-index">GLOSA <span>{String(entry.id).padStart(2,'0')}</span> <small>/ 36</small></div>
        <h2 className="entry-title">{entry.title}</h2>
        <p className="entry-fragment">{entry.fragment}</p>
        {availableIds.length>1 && <div className="entry-variants" aria-label="Inne glosy do tego fragmentu">
          {availableIds.map(id => <button key={id} type="button" aria-pressed={id===activeId}
            onClick={()=>onChoose(id)}>{String(id).padStart(2,'0')}</button>)}
        </div>}
        <GlossBody id={entry.id} body={entry.body}/>
        {entry.related.length>0 && <section className="related-section">
          <h3>PRZEJŚCIA ZNACZENIOWE</h3>
          <div className="related-list">{entry.related.map(id => <button key={id} type="button"
            onClick={()=>onChoose(id)}><span>{String(id).padStart(2,'0')} →</span>{glossById.get(id)?.title}</button>)}</div>
        </section>}
      </> : <div className="panel-placeholder"><span>36</span><p>Wybierz podświetlony fragment wiersza albo otwórz indeks glos.</p></div>)}
      {mode === 'index' && <section className="index-view">
        <label htmlFor="gloss-search">Wyszukaj w glosach</label>
        <input id="gloss-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Słowo, fraza, numer…" />
        <p className="index-count">{results.length} z 36 glos</p>
        <div className="index-list">{results.map(g=><button key={g.id} type="button"
          className={activeId===g.id?'selected':''} onClick={()=>onChoose(g.id)}>
          <span className="index-n">{String(g.id).padStart(2,'0')}</span><span>{g.title}</span>
        </button>)}</div>
        {!results.length&&<p className="empty-results">Brak wyników dla podanego zapytania.</p>}
      </section>}
      {mode === 'connections' && <section className="network-view">
        <h2>Sieć odczytań</h2>
        <p>Każde przejście przenosi do glosy związanej z aktualnym odczytaniem, a następnie wskazuje jej miejsce w wierszu.</p>
        {entry ? <>
          <div className="network-centre"><span>{String(entry.id).padStart(2,'0')}</span><strong>{entry.title}</strong></div>
          <div className="network-branches">{entry.related.map((id,index) =>
            <button key={id} className="network-node" type="button" onClick={()=>onChoose(id)} style={{'--node-index':index} as CSSProperties}>
              <span>{String(id).padStart(2,'0')}</span><small>{glossById.get(id)?.title}</small>
            </button>)}</div>
        </> : <p className="network-empty">Najpierw wybierz glosę, żeby zobaczyć jej powiązania.</p>}
      </section>}
    </div>
    <div className="panel-footer">
      <button onClick={onHide} type="button">Wyłącz glosy i wróć do lektury</button>
    </div>
  </aside>;
}
export type {Mode as PanelMode};
