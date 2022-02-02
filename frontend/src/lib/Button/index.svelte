<script type="ts">
  export let container = false;
  let className = "";
  export { className as class };
</script>

<button class={`inline-flex w-fit justify-center items-center shadow-sm rounded-md font-bold focus:outline-none mx-0.5 text-base ${className} ${!container && "px-2 py-1"} bg-slate-500 hover:bg-slate-600 text-white`}>
  <slot></slot>
</button>