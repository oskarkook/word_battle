<script lang="ts">
  import type { LetterType } from "$src/helpers/letter";
  import { colorblind } from "$src/stores/colorblind";

  export let type: LetterType;
</script>

<div>
  {#if type === "correct"}
    {#if $colorblind}
      🟧
    {:else}
      🟩
    {/if}
  {:else if type === "present"}
    {#if $colorblind}
      🟦
    {:else}
      🟨
    {/if}
  {:else if type === "absent"}
    ⬜
  {/if}
</div>