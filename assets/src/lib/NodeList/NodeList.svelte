<script lang="ts">
  import Button from "$src/lib/Button/Button.svelte";
  import { lobby } from "$src/stores/lobby";

  function handleChange(e) {
    lobby.setNode(e.target.value);
  }
</script>

<Button container class="w-10">
  <select class="px-2 py-1 appearance-none text-center bg-transparent font-bold cursor-pointer" value={$lobby.default_node} on:change={handleChange}>
    {#if !$lobby.nodes.includes($lobby.default_node)}
      <option>{$lobby.default_node}</option>
    {/if}
    {#each $lobby.nodes as node}
      <option>{node}</option>
    {/each}
  </select>
</Button>