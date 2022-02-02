<script lang="ts">
  import { fade } from "svelte/transition";
  import { createAlertsStore } from "$src/stores/alerts";
  export let alerts: ReturnType<typeof createAlertsStore>;
</script>

<div class="absolute z-10 w-full flex flex-col items-center">
  {#each $alerts as ref (ref)}
    <div out:fade={{duration: 250}} class="z-10 w-fit rounded font-bold p-2 m-2 bg-black text-white" role="alert">
      {ref.message}
    </div>
  {/each}
</div>