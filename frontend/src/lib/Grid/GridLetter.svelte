<script lang="ts">
  import type { LetterType } from "$lib/types";
  import { colorClasses } from "$lib/helpers/letter";
  export let type: LetterType;
</script>

<div class={`w-6 h-6 sm:w-14 sm:h-14 inline-flex leading-none text-sm sm:text-3xl text-white m-0.5 items-center justify-center font-bold box-border uppercase transition-colors ${colorClasses[type]} ${type === "unused" && "bg-white text-black border-2 border-gray-200"}`}>
  <slot></slot>
</div>