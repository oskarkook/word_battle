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

<div class:shake={shakeTimer !== undefined} class="flex grow w-full h-full">
  <slot/>
</div>

<style>
  @keyframes shake {
    10%, 90% {
      transform: translateX(-1px);
    }

    20%, 80% {
      transform: translateX(2px);
    }

    30%, 50%, 70% {
      transform: translateX(-4px);
    }

    40%, 60% {
      transform: translateX(4px);
    }
  }

  .shake {
    animation: shake 600ms;
  }
</style>