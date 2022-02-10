export type LetterType = "correct" | "present" | "absent" | undefined;

export const allowedLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const colorClasses: Record<LetterType, string> = {
  correct: "bg-letter-correct-100",
  present: "bg-letter-present-100",
  absent: "bg-slate-500",
};

export function classifyLetter(descriptor: string): LetterType {
  if(descriptor === "0") {
    return "absent";
  } else if(descriptor === "1") {
    return "present";
  } else if(descriptor === "2") {
    return "correct";
  } else {
    throw new Error(`Unknown descriptor ${descriptor}!`);
  }
}

export type Classification = {letter: string, type: LetterType};
export function buildGrid(guesses: Classification[][], rows: number, columns: number): Classification[][] {
  if(guesses.length === rows) return guesses;
  const emptyRows: Classification[][] = [];
  for(let i = guesses.length; i < rows; i++) {
    const row: Classification[] = [];
    for(let j = 0; j < columns; j++) {
      row.push({letter: "", type: undefined});
    }
    emptyRows.push(row);
  }
  return guesses.concat(emptyRows);
}