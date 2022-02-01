import type { LetterType } from "$lib/types";

export const colorClasses: Record<LetterType, string> = {
  correct: "bg-letter-correct-100",
  present: "bg-letter-present-100",
  absent: "bg-slate-500",
  unused: "",
};

export function classifyGuesses(guesses: string[], results: string[]) {
  return guesses.map((guess, i) => {
    const result = results[i];
    return classifyGuess(guess, result);
  });
}

export function classifyGuess(guess: string, result: string) {
  return guess.split("").map((letter, i) => {
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