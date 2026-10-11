import type { ReactNode } from 'react';

// Presentation-only emphasis; editorial texts are kept byte-for-byte in JSON.
const terms: Record<number, string[]> = {
  2:['pewnie','na pewno'], 3:['Wędrówka','pewnie'],
  7:['bronić czegoś jak niepodległości','niepodległość','podległość','Sprawa','Słuszna sprawa'],
  9:['pro bono','dobro'], 11:['całkowicie pięknym'],
  12:['mimesis','realizm'], 13:['nim','świat','widz'],
  16:['Prawdziwy stand-uper','prawdziwość'],
  17:['Przyzwoicie','Nieprzyzwoicie','Najnieprzyzwoiciej','nieprzyzwoicie dobry','naj-nie-przyzwoiciej'],
  18:['Oni','one','widzowie'], 19:['na pamięć','neuroróżnorodności'],
  20:['co najmniej','pamięć'], 21:['dobro','piękno','prawda'],
  23:['odpowiedzieć na dobro'], 24:['wypowiedzieć piękno'],
  25:['Mógłbym powiedzieć prawdę','a teraz nie mogę','Mógłbym'],
  28:['A tak','Byłbym','mógłbym','Jestem','pewnym'],
  29:['pewny siebie'], 30:['siebie','nauczycielem','pro bono'],
  31:['uczę siebie','uczę się siebie'],
  32:['jedną wartością','wszystkich'], 34:['26 znaków'],
  35:['trzy przesunięcia cykliczne'], 36:['do składni'],
};

export function GlossBody({id,body}:{id:number;body:string}) {
  const words = terms[id] ?? [];
  return <div className="gloss-copy">{body.split('\n\n').map((paragraph,i) =>
    <p key={i}>{markWords(paragraph,words)}</p>
  )}</div>;
}

function markWords(input: string, words: string[]): ReactNode[] {
  if (!words.length) return [input];
  // Longer matches first, so 'nieprzyzwoicie dobry' wins over 'Nieprzyzwoicie'.
  const escaped = [...words].sort((a,b) => b.length-a.length)
    .map(v => v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  const expression = new RegExp(`(${escaped.join('|')})`,'gi');
  const pieces: ReactNode[] = [];
  let last = 0;
  for (const match of input.matchAll(expression)) {
    const start = match.index ?? 0;
    if (start > last) pieces.push(input.slice(last,start));
    pieces.push(<strong key={`em-${start}`}>{match[0]}</strong>);
    last=start+match[0].length;
  }
  if (last < input.length) pieces.push(input.slice(last));
  return pieces.length ? pieces : [input];
}
