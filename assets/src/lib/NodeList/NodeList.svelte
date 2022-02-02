<script lang="ts">
  import Button from "$src/lib/Button/Button.svelte";
  import { lobby } from "$src/stores/lobby";
</script>

<Button container>
  <select class="px-2 py-1 appearance-none text-center bg-transparent font-bold cursor-pointer">
    <option value="" disabled selected hidden>🤔</option>
    {#each $lobby.nodes as node}
      <option selected={node === $lobby.active_node}>{node}</option>
    {/each}
  </select>
</Button>