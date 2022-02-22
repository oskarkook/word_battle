<script lang="ts">
  import { Classification, LetterType } from "$src/helpers/letter";
  import { createGameStore, Game } from "$src/stores/game";
  import GuessResult from "$src/lib/GuessResult/GuessResult.svelte";
  export let game: ReturnType<typeof createGameStore>; 

  $: player_guesses = $game.player_guesses;
  $: player_id = String($game.player_id);
  $: wordLength = $game.game_definition.word_length;

  type Counts = Record<LetterType, number>;
  function sortGuesses(guesses: Classification[][]): Classification[][] {
    return guesses
      .map(guess => {
        const counts: Counts = {correct: 0, present: 0, absent: 0};
        guess.forEach(({letter, type}) => {
          counts[type]++;
        });
        return {guess, counts};
      })
      .sort((b, a) => {
        if(a.counts.correct === b.counts.correct) {
          if(a.counts.present === b.counts.present) {
            return 0;
          } else if(a.counts.present > b.counts.present) {
            return 1;
          } else {
            return -1;
          }
        } else if(a.counts.correct > b.counts.correct) {
          return 1;
        } else {
          return -1;
        }
      })
      .map(value => {
        return value.guess;
      });
  }

  function rankPlayerGuesses(players: Game["player_guesses"]): Array<{id: string, guess: Classification[]}> {
    const idMap = new Map<Classification[], string>();
    const bestGuesses = Object.keys(players).map(id => {
      const guesses = players[id];
      let bestGuess = sortGuesses(guesses)[0];
      if(bestGuess === undefined) {
        bestGuess = [];
        for(let i = 0; i < wordLength; i++) {
          bestGuess.push({letter: undefined, type: "absent"});
        }
      }
      idMap.set(bestGuess, id);
      return bestGuess;
    });

    return sortGuesses(bestGuesses).map(guess => {
      return {id: idMap.get(guess), guess};
    });
  }

  $: rankedGuesses = rankPlayerGuesses(player_guesses);
</script>

<div class="flex flex-col mx-2 mt-7">
  {#each rankedGuesses as {id, guess}}
    <div class="flex px-1 {id === player_id ? "bg-gray-200 rounded p-1" : ""}">
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