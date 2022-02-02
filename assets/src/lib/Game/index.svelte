<script lang="ts">
  import Alert from "$src/lib/Alert/index.svelte";
  import GridContainer from "$src/lib/Grid/GridContainer.svelte";
  import GridLetter from "$src/lib/Grid/GridLetter.svelte";
  import GridRow from "$src/lib/Grid/GridRow.svelte";
  import { allowedLetters, Classification, prefillGrid } from "$src/lib/helpers/letter";
  import { onDestroy } from "svelte";

  let alertComponent: Alert;
  let shakeTimer: NodeJS.Timer | undefined;
  const guessesAllowed = 6;
  const letterCount = 5;

  // We are storing the whole grid in one data structure so they can be all rendered as one bunch.
  // This ensures that animations and transitions work as expected when rows change.
  let rows: Classification[][] = prefillGrid([], guessesAllowed, letterCount);
  let active = {row: 0, column: 0};

  function handleKeydown(e: KeyboardEvent) {
    if(e.ctrlKey || e.metaKey) return;
    if(active.row >= guessesAllowed) return;

    if(e.key === "Backspace") {
      if(active.column > 0) active.column -= 1;
      rows[active.row][active.column].letter = "";
    } else if(e.key === "Enter") {
      if(active.column >= letterCount) {
        // TODO: send guess to server
        rows[active.row] = rows[active.row].map(cls => ({letter: cls.letter, type: "absent"}));
        if(active.row < rows.length) {
          active.row += 1;
          active.column = 0;
        }
      } else {
        if(!shakeTimer) {
          shakeTimer = setTimeout(() => shakeTimer = undefined, 600);
        }
        alertComponent.pushAlert("Not enough letters", 1000);
      }
    } else {
      if(active.column >= letterCount) return;
      const letter = e.key.toUpperCase();
      if(!allowedLetters.includes(letter)) return;
      rows[active.row][active.column].letter = letter;
      active.column += 1;
    }
  }

  onDestroy(() => {
    if(shakeTimer) clearTimeout(shakeTimer);
  });
</script>

<svelte:window on:keydown={handleKeydown}/>
<GridContainer>
  {#each rows as row, i}
    <GridRow shake={shakeTimer && i === active.row}>
      {#each row as {letter, type}}
        <GridLetter {type} active={i === active.row && letter !== ""}>
          {letter}
        </GridLetter>
      {/each}
    </GridRow>
  {/each}
</GridContainer>

<Alert bind:this={alertComponent}/>