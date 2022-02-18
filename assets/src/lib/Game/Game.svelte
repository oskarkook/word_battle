<script lang="ts">
  import Alert from "$src/lib/Alert/Alert.svelte";
  import GridContainer from "$src/lib/Grid/GridContainer.svelte";
  import GridLetter from "$src/lib/Grid/GridLetter.svelte";
  import GridRow from "$src/lib/Grid/GridRow.svelte";
  import { allowedLetters, buildGrid } from "$src/helpers/letter";
  import { createAlertsStore } from "$src/stores/alerts";
  import { globalAlerts } from "$src/global";
  import { lobby } from "$src/stores/lobby";
  import { createGameStore } from "$src/stores/game";
  export let game: ReturnType<typeof createGameStore>;

  const alerts = createAlertsStore();
  let loading = false;

  $: guessesAllowed = $game.game_definition.guesses_allowed;
  $: wordLength = $game.game_definition.word_length;
  $: guessedRows = $game.my_guessed_words;
  $: rows = buildGrid(guessedRows, guessesAllowed, wordLength);
  $: activeRow = guessedRows.length;
  $: inEdit = id ? "" : "";
  let rowComponents: GridRow[] = [];

  let enterTimeout: NodeJS.Timeout | undefined = undefined;
  function handleKeydown(e: KeyboardEvent) {
    if(e.ctrlKey || e.metaKey || e.altKey) return;
    if(activeRow >= guessesAllowed) return;

    if(e.key === "Backspace") {
      inEdit = inEdit.slice(0, -1);
    } else if(e.key === "Enter") {
      if(enterTimeout) return;
      enterTimeout = setTimeout(() => enterTimeout = undefined, 1000);
      if(inEdit.length >= wordLength) {
        if($lobby.ping >= 500) {
          // below 500ms the loader just makes the app feel unresponsive unnecessarily
          loading = true;
        }
        game.guess(inEdit)
          .then(() => {
            inEdit = "";
          })
          .catch(resp => {
            if(resp.r === "w") {
              rowComponents[activeRow].shake();
            }
            alerts.push({ message: resp.m, time: 1500 });
          });
      } else {
        rowComponents[activeRow].shake();
        alerts.push({ message: "Not enough letters", time: 1000 });
      }
    } else {
      if(inEdit.length >= wordLength) return;
      const letter = e.key.toUpperCase();
      if(!allowedLetters.includes(letter)) return;
      inEdit += letter;
    }
  }

  $: state = $game.state; // https://github.com/sveltejs/svelte/issues/4535
  $: {
    let message: string | undefined;
    if(state === "waiting") {
      message = "Game found! Get ready!";
    } else if(state === "running") {
      message = "Game has started!";
    } else if(state === "completed") {
      message = "Game has ended!";
    }

    if(message) {
      alerts.push({message, time: 1500});
    }
  }
</script>

<svelte:window on:keydown={handleKeydown}/>
<GridContainer>
  {#each rows as row, i}
    <GridRow bind:this={rowComponents[i]}>
      {#each row as {letter, type}, j}
        <GridLetter {type} active={i === activeRow && inEdit.length > j}>
          {i === activeRow ? (inEdit[j] || "") : letter}
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