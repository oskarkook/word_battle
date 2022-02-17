<script lang="ts">
  import { onDestroy } from "svelte";
  let shakeTimer: NodeJS.Timer | undefined;
  export function shake() {
    if(!shakeTimer) {
      shakeTimer = setTimeout(() => shakeTimer = undefined, 600);
    }
  }

  onDestroy(() => {
    if(shakeTimer) clearTimeout(shakeTimer);
  });
</script>

<div class:animate-shake={shakeTimer !== undefined} class="flex grow w-full h-full">
  <slot/>
</div>