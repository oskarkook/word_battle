<script lang="ts">
  import Button from "$src/lib/Button/Button.svelte";
  import { lobby } from "$src/stores/lobby";
</script>

<Button container>
  <label class="px-2 py-1">
    <select class="text-center bg-transparent font-bold">
      {#each $lobby.nodes as node}
        <option selected={node === $lobby.active_node}>{node}</option>
      {/each}
    </select>
  </label>
</Button>