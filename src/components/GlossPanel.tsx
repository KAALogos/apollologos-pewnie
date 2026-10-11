import { useMemo, useState, type CSSProperties } from 'react';
import { edition, glossById } from '../lib/model';
import { GlossBody } from './GlossBody';
import { Schema } from './Schema';

type Mode = 'entry' | 'index' | 'connections';
interface Props {
  activeId: number | null;
  availableIds: number[];
  mode: Mode;
  trail: number[];
  visited: ReadonlySet<number>;
  onBack(): void;
  onTrail(index:number): void;
  onShow(): void;
  onMode(mode:Mode): void;
  onChoose(id:number): void;
  onDismiss(): void;
  onHide(): void;
}

const pad=(id:number)=>String(id).padStart(2,'0');

export function GlossPanel({activeId,availableIds,mode,trail,visited,onBack,onTrail,onShow,onMode,onChoose,onDismiss,onHide}:Props){
  const seen=(id:number)=>visited.has(id)?' seen':'';
  const shown=trail.slice(-6),base=trail.length-shown.length;
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
        <div className="entry-nav">
          <button type="button" onClick={onBack} disabled={trail.length<2}>← Wróć{trail.length>1?` do ${pad(trail[trail.length-2])}`:''}</button>
          <button type="button" onClick={onShow}>Pokaż w wierszu ↗</button>
        </div>
        {trail.length>1 && <ol className="trail" aria-label="Ścieżka lektury">{shown.map((id,i)=>
          <li key={base+i}><button type="button" aria-current={base+i===trail.length-1} onClick={()=>onTrail(base+i)}>{pad(id)}</button></li>)}</ol>}
        <div className="entry-index">GLOSA <span>{String(entry.id).padStart(2,'0')}</span> <small>/ 36</small></div>
        <h2 className="entry-title">{entry.title}</h2>
        <p className="entry-fragment">{entry.fragment}</p>
        {availableIds.length>1 && <div className="entry-variants" aria-label="Inne glosy do tego fragmentu">
          {availableIds.map(id => <button key={id} type="button" aria-pressed={id===activeId} className={seen(id).trim()}
            onClick={()=>onChoose(id)}>{pad(id)}</button>)}
        </div>}
        <GlossBody id={entry.id} body={entry.body}/>
        <Schema id={entry.id}/>
        {entry.related.length>0 && <section className="related-section">
          <h3>PRZEJŚCIA ZNACZENIOWE</h3>
          <div className="related-list">{entry.related.map(id => <button key={id} type="button" className={seen(id).trim()}
            onClick={()=>onChoose(id)}><span>{pad(id)} →</span>{glossById.get(id)?.title}</button>)}</div>
        </section>}
      </> : <div className="panel-placeholder"><span>36</span><p>Wybierz podświetlony fragment wiersza albo otwórz indeks glos.</p></div>)}
      {mode === 'index' && <section className="index-view">
        <label htmlFor="gloss-search">Wyszukaj w glosach</label>
        <input id="gloss-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Słowo, fraza, numer…" />
        <p className="index-count">{results.length} z 36 glos</p>
        <div className="index-list">{results.map(g=><button key={g.id} type="button"
          className={`${activeId===g.id?'selected':''}${seen(g.id)}`} onClick={()=>onChoose(g.id)}>
          <span className="index-n">{pad(g.id)}</span><span>{g.title}</span>
        </button>)}</div>
        {!results.length&&<p className="empty-results">Brak wyników dla podanego zapytania.</p>}
      </section>}
      {mode === 'connections' && <section className="network-view">
        <h2>Sieć odczytań</h2>
        <p>Każde przejście przenosi do glosy związanej z aktualnym odczytaniem, a następnie wskazuje jej miejsce w wierszu.</p>
        {entry ? <>
          <div className="network-centre"><span>{String(entry.id).padStart(2,'0')}</span><strong>{entry.title}</strong></div>
          <div className="network-branches">{entry.related.map((id,index) =>
            <button key={id} className={`network-node${seen(id)}`} type="button" onClick={()=>onChoose(id)} style={{'--node-index':index} as CSSProperties}>
              <span>{pad(id)}</span><small>{glossById.get(id)?.title}</small>
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
