import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Poem } from './components/Poem';
import { GlossPanel, type PanelMode } from './components/GlossPanel';
import { edition } from './lib/model';
import { firstAnchorFor } from './data/annotations';

interface Selection {id:number|null;ids:number[]}
const initial:Selection={id:null,ids:[]};

export default function App(){
  const [enabled,setEnabled]=useState(false);
  const [selection,setSelection]=useState<Selection>(initial);
  const [panelMode,setPanelMode]=useState<PanelMode>('entry');
  const [showPanel,setShowPanel]=useState(false);
  const [fontSize,setFontSize]=useState(22);
  const poemRef=useRef<HTMLDivElement>(null);
  const switchRef=useRef<HTMLButtonElement>(null);

  const turnOn=()=>{
    if(enabled){setEnabled(false);setSelection(initial);setShowPanel(false);return;}
    setEnabled(true);setPanelMode('entry');
    // On phones, activate marks without immediately covering the poem.
    setShowPanel(!window.matchMedia('(max-width: 640px)').matches);
    window.requestAnimationFrame(()=>poemRef.current?.scrollIntoView({behavior:'smooth',block:'start'}));
  };
  const turnOff=()=>{
    setEnabled(false);setSelection(initial);setShowPanel(false);
    window.requestAnimationFrame(()=>switchRef.current?.focus());
  };
  const pick=useCallback((ids:number[])=>{
    setSelection({id:ids[0]??null,ids});
    setPanelMode('entry');setShowPanel(true);
  },[]);
  const jumpTo=useCallback((id:number)=>{
    const targetVerse=firstAnchorFor(id);
    const anchorCandidates=[...document.querySelectorAll<HTMLButtonElement>('[data-glosses]')];
    const anchor=anchorCandidates.find(e=>e.dataset.glosses?.split(' ').includes(String(id)));
    const ids=anchor?.dataset.glosses?.split(' ').map(Number)??[id];
    setSelection({id,ids});setPanelMode('entry');setShowPanel(true);
    if(targetVerse){window.requestAnimationFrame(()=>{
      const target=anchor??document.querySelector(`[data-verse="${targetVerse}"]`);
      target?.scrollIntoView({behavior:'smooth',block:'center'});
    });}
  },[]);

  useEffect(()=>{
    const handleKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'&&showPanel){setShowPanel(false);return;}
      if(!enabled||!showPanel||selection.id===null||event.altKey||event.ctrlKey||event.metaKey) return;
      if(['INPUT','TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) return;
      if(event.key==='ArrowRight'&&selection.id<36){event.preventDefault();jumpTo(selection.id+1);}
      if(event.key==='ArrowLeft'&&selection.id>1){event.preventDefault();jumpTo(selection.id-1);}
    };
    window.addEventListener('keydown',handleKey);
    return ()=>window.removeEventListener('keydown',handleKey);
  },[enabled,showPanel,selection.id,jumpTo]);

  const changeSize=(delta:number)=>setFontSize(s=>Math.max(17,Math.min(30,s+delta)));
  return <div className={`app ${enabled?'annotations-enabled':''} ${enabled&&showPanel?'panel-open':''}`}
    style={{'--poem-font':`${fontSize}px`} as CSSProperties}>
    <a href="#poem-root" className="skip-link">Przejdź do wiersza</a>
    <header className="topbar">
      <a className="identity" href="#poem-root" aria-label="ApolloLogos — powrót do wiersza">
        <svg viewBox="0 0 46 34" aria-hidden="true" className="logo-mark">
          <path d="M8 2v30M23 2v30M38 2v30" />
          <circle cx="8" cy="17" r="3.5"/><circle cx="23" cy="17" r="3.5"/><circle cx="38" cy="17" r="3.5"/>
        </svg><span><strong>APOLLOLOGOS</strong><small>WIERSZE / LEKTURA INTERAKTYWNA</small></span>
      </a>
      <div className="top-tools">
        <div className="font-tools" aria-label="Rozmiar pisma">
          <button type="button" onClick={()=>changeSize(-1)} aria-label="Zmniejsz pismo" disabled={fontSize<=17}>A−</button>
          <button type="button" onClick={()=>changeSize(1)} aria-label="Powiększ pismo" disabled={fontSize>=30}>A+</button>
        </div>
        {enabled&&<button type="button" className="top-index" onClick={()=>{setPanelMode('index');setShowPanel(true);}}>Indeks <span>36</span></button>}
      </div>
    </header>
    <main className="workspace" id="poem-root" ref={poemRef}>
      <div className="reader-col">
        <div className="reading-note"><span>UTWÓR</span><span>01 / {edition.title}</span></div>
        <div className="page-shell">
          <div className="poem-scroll" tabIndex={0} aria-label="Wiersz; w razie potrzeby przewiń poziomo, aby zachować oryginalny układ wersów">
            <Poem glossesEnabled={enabled} activeId={selection.id} onPick={ids=>pick(ids)}/>
          </div>
          <div className="reading-switch">
            <button className="activate-button" type="button" ref={switchRef} onClick={turnOn}
              aria-expanded={enabled} aria-controls="gloss-panel">
              <span aria-hidden="true">{enabled?'−':'+'}</span> {enabled?'Wyłącz glosy':'Otwórz glosy'}
            </button>
            {!enabled&&<p>Najpierw wiersz. Dopiero potem jego możliwe odczytania.</p>}
            {enabled&&<p>Wybierz fragment tekstu. Przejścia do innych glos znajdziesz w panelu.</p>}
          </div>
        </div>
        <footer className="reader-footer"><span>APOLLOLOGOS</span><span>Tekst zachowany bez zmian · 36 glos</span></footer>
      </div>
      {enabled&&showPanel&&<>
        <button className="panel-scrim" aria-label="Zamknij panel glos" type="button" onClick={()=>setShowPanel(false)}/>
        <GlossPanel activeId={selection.id} availableIds={selection.ids} mode={panelMode}
          onChoose={jumpTo} onMode={setPanelMode} onDismiss={()=>setShowPanel(false)} onHide={turnOff}/>
      </>}
      {enabled&&!showPanel&&selection.id!==null&&<button className="reopen-panel" type="button" onClick={()=>setShowPanel(true)}>Otwórz panel glos →</button>}
    </main>
  </div>;
}
