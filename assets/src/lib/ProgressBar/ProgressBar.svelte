<script lang="ts">
  export let percentage: number;
  export let duration: number;
  let className: string = "";
  export { className as class };
</script>

<div class="h-4 w-full bg-gray-200 rounded-full m-1 overflow-hidden progress-bar">
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
    /* https://stackoverflow.com/a/70837483/ */
    animation: move-timer 1s linear 0.0001s;
  }

  .progress-bar {
    /* https://discourse.webflow.com/t/safari-not-hiding-overflow-on-rounded-corner-divs/55060/2 */
    -webkit-mask-image: -webkit-radial-gradient(white, black);
  }
</style>