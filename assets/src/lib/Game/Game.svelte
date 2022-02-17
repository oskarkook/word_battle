<script lang="ts">
  import Alert from "$src/lib/Alert/Alert.svelte";
  import GridContainer from "$src/lib/Grid/GridContainer.svelte";
  import GridLetter from "$src/lib/Grid/GridLetter.svelte";
  import GridRow from "$src/lib/Grid/GridRow.svelte";
  import { allowedLetters, buildGrid } from "$src/helpers/letter";
  import { createAlertsStore } from "$src/stores/alerts";
  import { globalAlerts } from "$src/global";
  import { lobby } from "$src/stores/lobby";
  import { game } from "$src/stores/game";

  const alerts = createAlertsStore();
  let loading = false;

  $: guessesAllowed = $game.game_definition.guesses_allowed;
  $: wordLength = $game.game_definition.word_length;
  $: rows = buildGrid($game.my_guessed_words, guessesAllowed, wordLength);
  $: active = {row: $game.my_guessed_words.length, column: 0};
  let rowComponents: GridRow[] = [];

  function handleKeydown(e: KeyboardEvent) {
    if(e.ctrlKey || e.metaKey || e.altKey) return;
    if(active.row >= guessesAllowed) return;

    if(e.key === "Backspace") {
      if(active.column > 0) active.column -= 1;
      rows[active.row][active.column].letter = "";
    } else if(e.key === "Enter") {
      if(active.column >= wordLength) {
        if($lobby.ping >= 500) {
          // below 500ms the loader just makes the app feel unresponsive unnecessarily
          loading = true;
        }
        game.guess(rows[active.row].map(({ letter }) => letter))
          .catch(resp => {
            if(resp.r === "w") {
              rowComponents[active.row].shake();
            }
            alerts.push({ message: resp.m, time: 1500 });
          });
      } else {
        rowComponents[active.row].shake();
        alerts.push({ message: "Not enough letters", time: 1000 });
      }
    } else {
      if(active.column >= wordLength) return;
      const letter = e.key.toUpperCase();
      if(!allowedLetters.includes(letter)) return;
      rows[active.row][active.column].letter = letter;
      active.column += 1;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown}/>
<GridContainer>
  {#each rows as row, i}
    <GridRow bind:this={rowComponents[i]}>
      {#each row as {letter, type}}
        <GridLetter {type} active={i === active.row && letter !== ""}>
          {letter}
        </GridLetter>
      {/each}
    </GridRow>
  {/each}
</GridContainer>
<div
  style="border-top-color:transparent"
  class:hidden={!loading}
  class="absolute flex z-10 w-8 h-8 border-4 border-cyan-500 border-solid rounded-full animate-spin"
/>

<Alert alerts={$alerts.concat($globalAlerts)}/>