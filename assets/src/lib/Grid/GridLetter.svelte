<script lang="ts">
  import { colorClasses, LetterType } from "$src/helpers/letter";
  export let type: LetterType = undefined;
  export let active: boolean = false;
</script>

<div class:pop={active} class:border-gray-500={active} class={`w-6 h-6 sm:w-14 sm:h-14 inline-flex leading-none text-sm sm:text-3xl text-white m-0.5 items-center justify-center font-bold box-border uppercase transition-colors ${colorClasses[type]} ${type === undefined && "bg-white text-black border-2 border-gray-200"}`}>
  <slot></slot>
</div>

<style>
  @keyframes pop {
    from {
      transform: scale(0.8);
      opacity: 0;
    }

    60% {
      transform: scale(1.1);
      opacity: 1;
    }
  }

  .pop {
    animation: pop 100ms;
  }
</style>