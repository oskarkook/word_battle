<script lang="ts">
  import { Classification, LetterType } from "$src/helpers/letter";
  import { createGameStore, Game, PlayerId } from "$src/stores/game";
  import GuessResult from "$src/lib/GuessResult/GuessResult.svelte";
  export let game: ReturnType<typeof createGameStore>; 

  $: player_guesses = $game.player_guesses;
  $: player_id = $game.player_id;
  $: view_player_id = $game.view_player_id;
  $: wordLength = $game.game_definition.word_length;

  type Counts = Record<LetterType, number>;
  type PlayerGuess = {id: string, guess: Classification[], position: number};
  function compareNumbers(numbers: [number, number][]): number {
    if(numbers.length === 0) return 0;
    const [a, b] = numbers[0];
    const result = a - b;
    if(result !== 0) {
      return result;
    } else {
      return compareNumbers(numbers.slice(1));
    }
  }
  function sortGuesses(guesses: PlayerGuess[]): PlayerGuess[] {
    return guesses
      .map(guess => {
        const counts: Counts = {correct: 0, present: 0, absent: 0};
        guess.guess.forEach(({letter, type}) => {
          counts[type]++;
        });
        return {guess, counts};
      })
      .sort((b, a) => {
        return compareNumbers([
          [a.counts.correct, b.counts.correct],
          [a.counts.present, b.counts.present],
          [b.guess.position, a.guess.position]
        ]);
      })
      .map(value => {
        return value.guess;
      });
  }

  function rankPlayerGuesses(players: Game["player_guesses"]): Array<{id: PlayerId, guess: Classification[]}> {
    const bestGuesses = Object.keys(players).map((id, i) => {
      const guesses: PlayerGuess[] = players[id].map((guess, i) => ({id, guess, position: i}));
      let bestGuess = sortGuesses(guesses)[0];
      if(bestGuess === undefined) {
        bestGuess = {id, position: 0, guess: []};
        for(let i = 0; i < wordLength; i++) {
          bestGuess.guess.push({letter: undefined, type: "absent"});
        }
      }
      return bestGuess;
    });
    return sortGuesses(bestGuesses);
  }

  function classes(id: PlayerId) {
    if(id === player_id) {
      return "rounded p-1 bg-gray-200";
    } else if(id === view_player_id) {
      return "drop-shadow-md";
    }
    return "";
  }

  $: rankedGuesses = rankPlayerGuesses(player_guesses);
</script>

<div class="flex flex-col mx-2 mt-7">
  {#each rankedGuesses as {id, guess}}
    <div class="flex cursor-pointer px-1 {classes(id)}" on:click={() => game.viewPlayer(id)}>
      {#if guess !== undefined}
        {#each guess as {letter, type}}
          <GuessResult type={type}/>
        {/each}
      {:else}
        {#each {length: wordLength} as i}
          <GuessResult type="absent"/>
        {/each}
      {/if}
    </div>
  {/each}
</div>