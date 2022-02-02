<script>
  import Game from "$lib/Game/index.svelte";
  import Keyboard from "$lib/Keyboard/index.svelte";
</script>

<main class="theme-default h-screen w-full overflow-x-hidden bg-slate-50 py-2 md:py-4">
  <h1 class="text-3xl font-bold leading-7 text-gray-900 tracking-wider px-4 pb-1 text-center">
    Placeholder
  </h1>
  <div class="flex flex-col justify-center items-center max-w-screen-sm mx-auto">
    <div class="flex w-full">
      <div class="flex flex-1"/>
      <div class="flex flex-1 flex-col items-center justify-center select-none">
        <Game/>
      </div>
      <div class="flex flex-1"/>
  </div>
  <Keyboard/>
</main>
