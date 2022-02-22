<script lang="ts">
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import type { Alert } from "$src/stores/alerts";
  export let alerts: Alert[];

  const dispatch = createEventDispatcher();

  function onClick(alert: Alert) {
    dispatch("hide", { alert });
  }
</script>

<div class="absolute z-10 w-full flex flex-col items-center cursor-pointer">
  {#each alerts as ref (ref)}
    <div out:fade={{duration: 250}} on:click={() => onClick(ref)} class="z-10 w-fit rounded font-bold p-2 m-2 bg-black text-white" role="alert">
      {ref.message}
    </div>
  {/each}
</div>