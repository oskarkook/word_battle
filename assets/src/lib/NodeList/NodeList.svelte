<script lang="ts">
  import Button from "$src/lib/Button/Button.svelte";
  import { lobby } from "$src/stores/lobby";

  function handleChange(e) {
    const node = $lobby.nodes.find(({ node }) => node === e.target.value);
    if($lobby.queuedForNode !== undefined) {
      lobby.leaveQueue();
    }
    lobby.setNode(node);
  }

  function prettify(name: string): string {
    return name.toUpperCase();
  }
</script>

<Button container class="w-10 overflow-x-hidden">
  <select class="px-2 py-1 appearance-none text-center bg-transparent font-bold cursor-pointer" value={$lobby.default_node.node} on:change={handleChange}>
    {#if !$lobby.nodes.some(({ node }) => node === $lobby.default_node.node)}
      <option value={$lobby.default_node}>{prettify($lobby.default_node.region)}</option>
    {/if}
    {#each $lobby.nodes as {node, region}}
      <option value={node}>{prettify(region)}</option>
    {/each}
  </select>
</Button>