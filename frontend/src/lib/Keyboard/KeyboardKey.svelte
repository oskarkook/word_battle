<script lang="ts">
  import { colorClasses } from "$lib/helpers/letter";
  import type { LetterType } from "$lib/types";
  let className: string = "";
  export { className as class };
  export let type: LetterType;
  export let value: string;

  function handleClick(e) {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: value }))
    e.target.blur(); // required to remove focus so enter key won't interact with it
  }
</script>

<button on:click={handleClick} class={`text-white flex basis-0 items-center justify-center h-14 rounded mx-0.5 font-bold cursor-pointer select-none ${className} ${colorClasses[type]} ${type === undefined && "text-black bg-slate-200"}`}>
  <slot>{value}</slot>
</button>