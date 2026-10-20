import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { render } from '../build.mjs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const sha = (s) => createHash('sha256').update(s).digest('hex');
const data = JSON.parse(read('data/celownik.json'));
const manifest = JSON.parse(read('docs/edition.manifest.json'));
const text = data.poem.map(s => s.t).join('');
const anchors = data.poem.filter(s => s.g).map(s => s.g);
const keys = Object.keys(data.glosses);

test('wiersz jest kanoniczny i nie zostal zmieniony', () => {
  assert.equal(read('docs/poem.canonical.txt'), text);
  assert.equal(sha(text), manifest.poem_sha256);
});

test('glosy nie zostaly zmienione', () => {
  assert.equal(sha(JSON.stringify(data.glosses)), manifest.glosses_sha256);
  assert.equal(keys.length, manifest.glosses);
  for (const k of keys) {
    const g = data.glosses[k];
    assert.ok(g.title && g.fragment && g.body, `pusta glosa ${k}`);
  }
});

test('kazda kotwica ma glose i kazda glosa ma dokladnie jedna kotwice', () => {
  assert.equal(anchors.length, manifest.anchors);
  assert.equal(new Set(anchors).size, anchors.length, 'zduplikowana kotwica');
  for (const a of anchors) assert.ok(data.glosses[a], `kotwica bez glosy: ${a}`);
  for (const k of keys) assert.ok(anchors.includes(k), `glosa bez kotwicy: ${k}`);
});

test('tresc glos zawiera tylko <p> i <strong>', () => {
  for (const [k, g] of Object.entries(data.glosses)) {
    const tags = new Set((g.body.match(/<\/?[a-z][^>]*>/gi) ?? []).map(t => t.replace(/[<\/>]/g, '').split(' ')[0]));
    for (const t of tags) assert.ok(['p', 'strong'].includes(t), `${k}: niedozwolony znacznik ${t}`);
    assert.ok(!/\son\w+=/i.test(g.body), `${k}: atrybut zdarzenia`);
  }
});

test('zbudowany index.html jest aktualny i zawiera wiersz bez zmian', () => {
  const html = render();
  assert.equal(read('index.html'), html, 'uruchom: npm run build');
  const open = '<div class="poem" id="poemText">';
  const start = html.indexOf(open) + open.length;
  const inner = html.slice(start, html.indexOf('</div>\n<div class="gloss-start"'));
  assert.equal(sha(inner), manifest.poem_inner_html_sha256);
  const plain = inner.replace(/<[^>]+>/g, '');
  assert.equal(plain, text);
});

test('strona nie zawiera metaopisu', () => {
  const html = read('index.html');
  for (const s of ['pierwsza lektura', 'wiersz z glosami', 'Kliknij podświetlony', 'Liczba aktywnych glos', 'Po pierwszej lekturze'])
    assert.ok(!html.includes(s), s);
});
