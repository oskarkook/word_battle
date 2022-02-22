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
  import GameProgress from "./GameProgress.svelte";
  export let game: ReturnType<typeof createGameStore>;

  const alerts = createAlertsStore();
  let loading = false;

  $: id = $game.id;
  $: guessesAllowed = $game.game_definition.guesses_allowed;
  $: wordLength = $game.game_definition.word_length;
  $: guessedRows = $game.player_guesses[$game.player_id];
  $: rows = buildGrid(guessedRows, guessesAllowed, wordLength);
  $: activeRow = guessedRows.length;

  let inEdit = "";
  let rowComponents: GridRow[] = [];

  let enterTimeout: NodeJS.Timeout | undefined = undefined;
  function handleKeydown(e: KeyboardEvent) {
    if(e.ctrlKey || e.metaKey || e.altKey) return;
    if(activeRow >= guessesAllowed) return;
    if($game.state !== "running") return;

    if(e.key === "Backspace") {
      inEdit = inEdit.slice(0, -1);
    } else if(e.key === "Enter") {
      if(enterTimeout) return;
      enterTimeout = setTimeout(() => enterTimeout = undefined, 200);
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

  // https://github.com/sveltejs/svelte/issues/4535
  $: state = $game.state; 
  $: solution = $game.solution;
  $: {
    if(state === "waiting") {
      alerts.push({message: "Game found! Get ready!", time: 1500});
    } else if(state === "running") {
      alerts.push({message: "Game has started!", time: 1500});
    } else if(state === "player-done") {
      if(solution !== undefined) {
        alerts.push({message: `Well done! The word was ${solution}`, time: 5000});
      } else {
        alerts.push({message: "You ran out of guesses!", time: 5000});
      }
    } else if(state === "completed" && solution !== undefined) {
      alerts.push({message: `Game has ended! The word was ${solution}`});
      inEdit = "";
    }
  }
  $: {
    if(id || !id) {
      alerts.clear();
      inEdit = "";
    }
  }
</script>

<svelte:window on:keydown={handleKeydown}/>
<GameProgress game={game}/>
{#key id}
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
{/key}
<div
  style="border-top-color:transparent"
  class:hidden={!loading}
  class="absolute flex z-10 w-8 h-8 border-4 border-cyan-500 border-solid rounded-full animate-spin"
/>
<Alert alerts={$alerts.concat($globalAlerts)}/>