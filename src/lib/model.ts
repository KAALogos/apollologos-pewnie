import raw from '../data/pewnie.json';

export type GlossStatus = 'zaakceptowana' | 'zmieniona';
export interface Gloss {
  id: number;
  title: string;
  fragment: string;
  body: string;
  status: GlossStatus;
  related: number[];
}
export interface Edition {
  title: string;
  poem: string;
  glosses: Gloss[];
  anchors: Record<string, number[]>;
  source_notes: string[];
}

// The editorial text is stored separately from its visual presentation.
// The cast documents the JSON schema; assertions guard against accidental corruption.
export const edition = raw as unknown as Edition;
export const glossById = new Map<number, Gloss>(edition.glosses.map(g => [g.id, g]));

export function stanzaLines(poem: string): string[][] {
  return poem.split('\n\n').map(stanza => stanza.split('\n'));
}

export function assertEdition(e: Edition): void {
  if (e.title !== 'PEWNIE') throw new Error('Nieoczekiwany tytuł');
  if (e.glosses.length !== 36) throw new Error('Oczekiwano 36 glos');
  const ids = new Set(e.glosses.map(g => g.id));
  if (ids.size !== 36 || [...ids].some(id => id < 1 || id > 36)) throw new Error('Nieprawidłowe numery glos');
  for (const g of e.glosses) {
    if (!g.title || !g.body.trim()) throw new Error(`Pusta glosa ${g.id}`);
    for (const linked of g.related) if (!ids.has(linked)) throw new Error(`Glosa ${g.id}: błędne powiązanie ${linked}`);
  }
  for (const [verse, glossaryIds] of Object.entries(e.anchors)) {
    const [stanza, line] = verse.split(':').map(Number);
    if (stanzaLines(e.poem)[stanza]?.[line] === undefined) throw new Error(`Kotwica poza wierszem: ${verse}`);
    for (const id of glossaryIds) if (!ids.has(id)) throw new Error(`Kotwica ${verse}: brak glosy ${id}`);
  }
}
assertEdition(edition);
