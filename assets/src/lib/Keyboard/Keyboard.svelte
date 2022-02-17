<script context="module" lang="ts">
  const rows = [
    "QWERTYUIOP".split(""),
    "ASDFGHJKL".split(""),
    "ZXCVBNM".split(""),
  ];
</script>

<script lang="ts">
  import KeyboardKey from "./KeyboardKey.svelte";
  import { game } from "$src/stores/game";
  import { letterTypes } from "$src/helpers/letter";

  $: letterMap = letterTypes($game.my_guessed_words);
</script>

<div class="w-full mt-0.5 sm:mt-2 px-1">
  <div class="flex justify-center mb-1 touch-manipulation">
    {#each rows[0] as key}
      <KeyboardKey value={key} type={letterMap.get(key)} class="grow"/>
    {/each}
  </div>
  <div class="flex justify-center mb-1 touch-manipulation">
    <div class="grow-0.5"/>
    {#each rows[1] as key}
      <KeyboardKey value={key} type={letterMap.get(key)} class="grow">
        {key}
      </KeyboardKey>
    {/each}
    <div class="grow-0.5"/>
  </div>
  <div class="flex justify-center mb-1 touch-manipulation">
    <KeyboardKey value="Enter" type={undefined} class="grow-1.5">
      Enter
    </KeyboardKey>
    {#each rows[2] as key}
      <KeyboardKey value={key} type={letterMap.get(key)} class="grow">
        {key}
      </KeyboardKey>
    {/each}
    <KeyboardKey value="Backspace" type={undefined} class="grow-1.5">
      Delete
    </KeyboardKey>
  </div>
</div>