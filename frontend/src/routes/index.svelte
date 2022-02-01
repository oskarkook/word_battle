<script>
  import GridRow from '$lib/Grid/GridRow.svelte';
  import GridContainer from '$lib/Grid/GridContainer.svelte';
  import GridLetter from '$lib/Grid/GridLetter.svelte';
  import { classifyGuesses } from '$lib/helpers/letter';

  const guesses = classifyGuesses(['weary', 'pilot'], ['01120', '00010']);
  const guessesAllowed = 6;
  const letterCount = 5;
</script>

<main class="theme-default">
  <GridContainer>
    {#each guesses as guess}
      <GridRow>
        {#each guess as {letter, type}}
          <GridLetter {type}>{letter}</GridLetter>
        {/each}
      </GridRow>
    {/each}
    {#each {length: guessesAllowed - guesses.length} as _}
      <GridRow>
        {#each {length: letterCount} as _}
          <GridLetter type='unused'/>
        {/each}
      </GridRow>
    {/each}
  </GridContainer>
</main>
