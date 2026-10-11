// Fragments are never inserted or rewritten in the poem itself.
// The renderer finds each phrase in the canonical line, retaining the surrounding
// punctuation, spaces and original U+00A0 non-breaking spaces verbatim.
export interface Annotation {
  verse: string;
  phrase: string;
  ids: number[];
  /** Glosses that only light this fragment up (it is not a hotspot for them). */
  echoes?: number[];
}
export const annotations: Annotation[] = [
  {verse:'0:0',phrase:'PEWNIE',ids:[1,2,3]},
  {verse:'1:0',phrase:'Pewnie',ids:[2,3,4]},
  {verse:'1:0',phrase:'dobrym adwokatem',ids:[6,5,33]},
  {verse:'1:1',phrase:'Bronię racji nie jak podległości',ids:[7,33]},
  {verse:'1:2',phrase:'słuszną sprawę',ids:[8,7]},
  {verse:'1:3',phrase:'pro bono',ids:[9,30]},
  {verse:'1:4',phrase:'nie z urzędu',ids:[10,30]},
  {verse:'2:0',phrase:'Byłbym pewnie',ids:[3,4]},
  {verse:'2:0',phrase:'zupełnie pięknym aktorem',ids:[11,5,33]},
  {verse:'2:1',phrase:'naśladować świat',ids:[12,33]},
  {verse:'2:2',phrase:'nim siebie',ids:[13,15]},
  {verse:'2:3',phrase:'nie zasłaniać innym',ids:[14,13]},
  {verse:'2:4',phrase:'Widoku ich samych',ids:[14]},
  {verse:'3:0',phrase:'Stand-uperem',ids:[33]},
  {verse:'3:0',phrase:'pewnie',ids:[3,4]},
  {verse:'3:0',phrase:'prawdziwym',ids:[16,5]},
  {verse:'3:1',phrase:'Trzymam pion najnieprzyzwoiciej',ids:[17]},
  {verse:'3:2',phrase:'Znam się na żartach lepiej',ids:[18]},
  {verse:'3:3',phrase:'oni sami i one same',ids:[18]},
  {verse:'3:4',phrase:'Emocje i reakcje znam',ids:[19]},
  {verse:'3:5',phrase:'co najmniej na pamięć',ids:[20,19]},
  {verse:'4:0',phrase:'Mógłbym',ids:[27,26]},
  {verse:'4:0',phrase:'odpowiedzieć na dobro',ids:[23,21,22,34]},
  {verse:'4:1',phrase:'Mógłbym',ids:[27,26]},
  {verse:'4:1',phrase:'wypowiedzieć piękno',ids:[24,21,22]},
  {verse:'4:2',phrase:'Mógłbym',ids:[27,26]},
  {verse:'4:2',phrase:'powiedzieć prawdę',ids:[25,21,22]},
  {verse:'5:0',phrase:'A tak',ids:[28]},
  {verse:'5:0',phrase:'pewnym',ids:[29,32,34],echoes:[1,2,3,4]},
  {verse:'5:1',phrase:'siebie nauczycielem',ids:[30,31,15,29,32]},
  {verse:'6:0',phrase:'Pewnie',ids:[1,2,3]},
  {verse:'6:0',phrase:'człowiekiem jestem',ids:[35,36,34]},
  {verse:'6:1',phrase:'Jestem pewnie człowiekiem',ids:[35,3,36,34]},
  {verse:'6:2',phrase:'Człowiekiem jestem pewnie',ids:[36,35,1,2,3,34]},
];

/** Whole-stanza marks in the left margin, for the glosses about the poem's geometry. */
export interface StanzaMark {
  stanza: number;
  ids: number[];
  shape: 'wedge' | 'rect' | 'cycle';
  label: string;
}
export const stanzaMarks: StanzaMark[] = [
  {stanza:1,ids:[33],shape:'wedge',label:'Klin'},
  {stanza:2,ids:[33],shape:'wedge',label:'Klin'},
  {stanza:3,ids:[33],shape:'wedge',label:'Klin'},
  {stanza:4,ids:[34],shape:'rect',label:'Od klina do prostokąta'},
  {stanza:5,ids:[34],shape:'rect',label:'Od klina do prostokąta'},
  {stanza:6,ids:[35,36,34],shape:'cycle',label:'Trzy przestawienia'},
];

export interface VersePiece {
  text: string;
  ids: number[];
  echoes: number[];
  key: string;
}

/** Pure transformation. No string rewriting and no overlapping annotations. */
export function renderPieces(text: string, verse: string): VersePiece[] {
  const candidates = annotations.filter(a => a.verse === verse);
  const ranges = candidates.map((a, index) => {
    const from = text.indexOf(a.phrase);
    if (from === -1) throw new Error(`Fraza '${a.phrase}' nie występuje w wersie ${verse}`);
    return { ...a, from, to: from + a.phrase.length, index };
  }).sort((a,b) => a.from-b.from || a.to-b.to);
  const result: VersePiece[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.from < cursor) throw new Error(`Nachodzące na siebie kotwice w ${verse}`);
    if (r.from > cursor) result.push({text:text.slice(cursor,r.from),ids:[],echoes:[],key:`${verse}-text-${cursor}`});
    result.push({text:text.slice(r.from,r.to),ids:r.ids,echoes:r.echoes??[],key:`${verse}-${r.index}`});
    cursor=r.to;
  }
  if (cursor < text.length) result.push({text:text.slice(cursor),ids:[],echoes:[],key:`${verse}-text-${cursor}`});
  return result.length ? result : [{text,ids:[],echoes:[],key:`${verse}-whole`}];
}

export function firstAnchorFor(id: number): string | undefined {
  return annotations.find(a => a.ids.includes(id))?.verse;
}
