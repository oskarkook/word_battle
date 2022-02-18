<script lang="ts">
  export let percentage: number;
  export let duration: number;
  let className: string = "";
  export { className as class };
</script>

<div class="h-4 w-full bg-gray-200 rounded-full m-1 overflow-hidden">
  <div
    class="{className} w-full h-full rounded-full move-timer"
    style="margin-left: -{100 - percentage}%; animation-duration: {duration}ms"
  />
</div>

<style>
  @keyframes move-timer {
    from {
      transform: translateX(0%);
    }
    to {
      transform: translateX(-100%);
    }
  }

  .move-timer {
    animation: move-timer 1s linear;
  }
</style>