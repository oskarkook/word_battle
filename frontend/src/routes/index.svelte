<script>
  import Game from "$lib/Game/index.svelte";
  import Keyboard from "$lib/Keyboard/index.svelte";
  import Button from "$lib/Button/index.svelte";
  import { browser } from "$app/env";

  const localStorage = browser ? window.localStorage : {getItem: () => {}, setItem: () => {}};
  let theme = localStorage.getItem("theme") || "theme-default";
  function toggleColorblind() {
    const otherTheme = theme === "theme-default" ? "theme-colorblind" : "theme-default";
    localStorage.setItem("theme", otherTheme);
    theme = otherTheme;
  }
</script>

<main class={`${theme} h-screen w-full overflow-x-hidden bg-slate-50 py-2 md:py-4`}>
  <h1 class="text-3xl font-bold leading-7 text-gray-900 tracking-wider px-4 pb-1 text-center">
    Placeholder
  </h1>
  <div class="flex flex-col justify-center items-center w-100 h-100 max-w-screen-sm mx-auto">
    <div class="m-0.5 sm:m-1">
      <Button container>
        <label role="button" class="px-2 py-1">
          <span>Colorblind</span>
          <input on:click={toggleColorblind} checked={theme === "theme-colorblind"} type="checkbox" class="ml-1"/>
        </label>
      </Button>
    </div>
    <div class="flex flex-col justify-center items-center max-w-screen-sm mx-auto">
      <div class="flex w-full">
        <div class="flex flex-1"/>
        <div class="flex flex-1 flex-col items-center justify-center select-none">
          <Game/>
        </div>
        <div class="flex flex-1"/>
    </div>
  </div>
  <Keyboard/>
</main>
