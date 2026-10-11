// Fragments are never inserted or rewritten in the poem itself.
// The renderer finds each phrase in the canonical line, retaining the surrounding
// punctuation, spaces and original U+00A0 non-breaking spaces verbatim.
export interface Annotation {
  verse: string;
  phrase: string;
  ids: number[];
}
export const annotations: Annotation[] = [
  {verse:'0:0',phrase:'PEWNIE',ids:[1,2,3]},
  {verse:'1:0',phrase:'Pewnie',ids:[2,3,4]},
  {verse:'1:0',phrase:'dobrym adwokatem',ids:[5,6,33]},
  {verse:'1:1',phrase:'Bronię racji nie jak podległości',ids:[7,33]},
  {verse:'1:2',phrase:'słuszną sprawę',ids:[7,8]},
  {verse:'1:3',phrase:'pro bono',ids:[9,30]},
  {verse:'1:4',phrase:'nie z urzędu',ids:[10,30]},
  {verse:'2:0',phrase:'Byłbym pewnie',ids:[3,4]},
  {verse:'2:0',phrase:'całkowicie pięknym aktorem',ids:[5,11,33]},
  {verse:'2:1',phrase:'naśladować świat',ids:[12,33]},
  {verse:'2:2',phrase:'nim siebie',ids:[13,15]},
  {verse:'2:3',phrase:'nie zasłaniać innym',ids:[13,14]},
  {verse:'2:4',phrase:'Widoku ich samych',ids:[14]},
  {verse:'3:0',phrase:'Stand-uperem',ids:[33]},
  {verse:'3:0',phrase:'pewnie',ids:[3,4]},
  {verse:'3:0',phrase:'prawdziwym',ids:[5,16]},
  {verse:'3:1',phrase:'Trzymam pion najnieprzyzwoiciej',ids:[17]},
  {verse:'3:2',phrase:'Znam się na żartach lepiej',ids:[18]},
  {verse:'3:3',phrase:'oni sami i one same',ids:[18]},
  {verse:'3:4',phrase:'Emocje i reakcje znam',ids:[19]},
  {verse:'3:5',phrase:'co najmniej na pamięć',ids:[19,20]},
  {verse:'4:0',phrase:'Mógłbym',ids:[26,27]},
  {verse:'4:0',phrase:'odpowiedzieć na dobro',ids:[21,22,23,34]},
  {verse:'4:1',phrase:'Mógłbym',ids:[26,27]},
  {verse:'4:1',phrase:'wypowiedzieć piękno',ids:[21,22,24]},
  {verse:'4:2',phrase:'Mógłbym',ids:[26,27]},
  {verse:'4:2',phrase:'powiedzieć prawdę',ids:[21,22,25]},
  {verse:'5:0',phrase:'A tak',ids:[28]},
  {verse:'5:0',phrase:'pewnym',ids:[29,32,34]},
  {verse:'5:1',phrase:'siebie nauczycielem',ids:[15,29,30,31,32]},
  {verse:'6:0',phrase:'Pewnie',ids:[1,2,3]},
  {verse:'6:0',phrase:'człowiekiem jestem',ids:[34,35,36]},
  {verse:'6:1',phrase:'Jestem pewnie człowiekiem',ids:[3,34,35,36]},
  {verse:'6:2',phrase:'Człowiekiem jestem pewnie',ids:[1,2,3,34,35,36]},
];

export interface VersePiece {
  text: string;
  ids: number[];
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
    if (r.from > cursor) result.push({text:text.slice(cursor,r.from),ids:[],key:`${verse}-text-${cursor}`});
    result.push({text:text.slice(r.from,r.to),ids:r.ids,key:`${verse}-${r.index}`});
    cursor=r.to;
  }
  if (cursor < text.length) result.push({text:text.slice(cursor),ids:[],key:`${verse}-text-${cursor}`});
  return result.length ? result : [{text,ids:[],key:`${verse}-whole`}];
}

export function firstAnchorFor(id: number): string | undefined {
  return annotations.find(a => a.ids.includes(id))?.verse;
}
