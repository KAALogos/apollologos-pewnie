import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const edition = JSON.parse(read('src/data/pewnie.json'));
const manifest = JSON.parse(read('docs/edition.manifest.json'));
const stanzas = edition.poem.split('\n\n').map(stanza => stanza.split('\n'));
const annotationSource = read('src/data/annotations.ts');
const annotationRe = /\{verse:'([^']+)',phrase:'([^']+)',ids:\[([^\]]+)\](?:,echoes:\[[^\]]+\])?\}/g;
const annotations = [...annotationSource.matchAll(annotationRe)].map(([,verse,phrase,ids]) => ({
  verse, phrase, ids: ids.split(',').map(Number),
}));
const glossIds = new Set(edition.glosses.map(g => g.id));

test('wiersz jest kanoniczny i nie został przepisany', () => {
  assert.equal(read('docs/poem.canonical.txt'), edition.poem);
  assert.equal(createHash('sha256').update(edition.poem).digest('hex'), manifest.poem_sha256);
  assert.equal(edition.title,'PEWNIE');
  assert.equal(stanzas.length,7);
  assert.deepEqual(stanzas.slice(-1)[0].map(line=>[...line].length),[26,26,26]);
  assert.ok(edition.poem.includes('By nie zasłaniać innym\u00a0\n'));
  assert.ok(edition.poem.includes('Emocje i reakcje znam\u00a0\n'));
  assert.ok(edition.poem.includes('niż oni sami i one same.'));
});

test('glosy 1–36 są unikatowe, niepuste i zachowują referencje', () => {
  assert.equal(edition.glosses.length,36);
  assert.deepEqual([...glossIds].sort((a,b)=>a-b),Array.from({length:36},(_,i)=>i+1));
  for(const g of edition.glosses){
    assert.ok(g.title && g.fragment && g.body,`Pusta glosa ${g.id}`);
    for(const r of g.related) assert.ok(glossIds.has(r),`${g.id} → ${r}`);
  }
});

test('adnotacje znajdują dokładne fragmenty, nie nachodzą na siebie i obejmują 36 glos', () => {
  assert.ok(annotations.length>=30);
  const covered = new Set();
  const grouped = new Map();
  for(const a of annotations){
    const [si,li]=a.verse.split(':').map(Number);
    const line=stanzas[si]?.[li];
    assert.equal(typeof line, 'string', a.verse);
    const start=line.indexOf(a.phrase);
    assert.ok(start>=0,`${a.verse}: ${a.phrase}`);
    const groupedRanges=grouped.get(a.verse)??[];
    groupedRanges.push([start,start+a.phrase.length]);
    grouped.set(a.verse,groupedRanges);
    for(const id of a.ids){assert.ok(glossIds.has(id));covered.add(id);}
  }
  for(const [verse,ranges] of grouped){
    ranges.sort((a,b)=>a[0]-b[0]);
    for(let i=1;i<ranges.length;i++) assert.ok(ranges[i][0]>=ranges[i-1][1],`${verse}: overlapping`);
    const [si,li]=verse.split(':').map(Number);
    const line=stanzas[si][li];
    const parts=[];
    let n=0;
    for(const [start,end] of ranges){parts.push(line.slice(n,start),line.slice(start,end));n=end;}
    parts.push(line.slice(n));
    assert.equal(parts.join(''),line,`Zmiana treści w ${verse}`);
  }
  assert.deepEqual([...covered].sort((a,b)=>a-b),[...glossIds].sort((a,b)=>a-b));
});

test('znaki przy strofach wskazują istniejące strofoidy i glosy', () => {
  const marks = [...annotationSource.matchAll(/\{stanza:(\d+),ids:\[([^\]]+)\],shape:'(wedge|rect|cycle)'/g)];
  assert.equal(marks.length, 6);
  for (const [, stanza, ids] of marks) {
    assert.ok(stanzas[Number(stanza)], `brak strofoidy ${stanza}`);
    for (const id of ids.split(',').map(Number)) assert.ok(glossIds.has(id), `strofoida ${stanza} → glosa ${id}`);
  }
  assert.deepEqual(stanzas.slice(-1)[0].length, 3);
});

test('struktura repo obsługuje publikację na GitHub Pages', () => {
  assert.ok(existsSync(new URL('.github/workflows/deploy.yml',root)));
  assert.ok(read('vite.config.ts').includes("base: './'"));
  assert.ok(read('.github/workflows/deploy.yml').includes('actions/deploy-pages@v4'));
  const app=read('src/App.tsx');
  assert.ok(app.includes("'Otwórz glosy'"));
  assert.ok(app.includes("useState(false)"));
});
