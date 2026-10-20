// Buduje index.html z template.html + data/celownik.json. Bez zaleznosci.
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const root = new URL('./', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function render() {
  const data = JSON.parse(read('data/celownik.json'));
  const poem = data.poem.map(({ t, g, c }) =>
    g ? `<span class="${c ?? 'g'}" data-gloss="${g}" tabindex="0">${esc(t)}</span>` : esc(t)).join('');
  // "</" w JSON nie moze zamknac znacznika script
  const glosses = JSON.stringify(data.glosses).replace(/</g, '\u003c');
  return read('template.html').replace('{{POEM}}', () => poem).replace('{{GLOSSES}}', () => glosses);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  writeFileSync(new URL('index.html', root), render());
  console.log('index.html zbudowany');
}
