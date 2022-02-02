import type { LetterType } from "$src/lib/types";

export const allowedLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const colorClasses: Record<LetterType, string> = {
  correct: "bg-letter-correct-100",
  present: "bg-letter-present-100",
  absent: "bg-slate-500",
};

export type Classification = {letter: string, type: LetterType};
export function classifyGuesses(guesses: string[], results: string[]): Classification[][] {
  return guesses.map((guess, i) => {
    const result = results[i];
    return classifyGuess(guess.split(""), result);
  });
}

export function classifyGuess(guess: string[], result: string): Classification[] {
  return guess.map((letter, i) => {
    const descriptor = result[i];

    let type: LetterType;
    if(descriptor === "0") {
      type = "absent";
    } else if(descriptor === "1") {
      type = "present";
    } else if(descriptor === "2") {
      type = "correct";
    } else {
      throw new Error(`Unknown descriptor ${descriptor}!`);
    }

    return {letter, type};
  });
}

export function prefillGrid(guesses: Classification[][], rows: number, columns: number): Classification[][] {
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