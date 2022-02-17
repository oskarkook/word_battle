<script lang="ts">
  import Game from "$src/lib/Game/Game.svelte";
  import Keyboard from "$src/lib/Keyboard/Keyboard.svelte";
  import Button from "$src/lib/Button/Button.svelte";
  import NodeList from "$src/lib/NodeList/NodeList.svelte";
  import Timer from "$src/lib/Timer/Timer.svelte";
  import { lobby } from "$src/stores/lobby";
  import { game } from "$src/stores/game";

  let theme = localStorage.getItem("theme") || "theme-default";
  function toggleColorblind() {
    const otherTheme = theme === "theme-default" ? "theme-colorblind" : "theme-default";
    localStorage.setItem("theme", otherTheme);
    theme = otherTheme;
  }

  function joinQueue() {
    lobby.joinQueue($lobby.default_node);
  }

  function leaveQueue() {
    lobby.leaveQueue();
  }

  function leaveGame() {
    game.leave();
  }
</script>

<main class={`${theme} h-screen w-full overflow-x-hidden bg-slate-50 py-2 md:py-4`}>
  <h1 class="text-3xl font-bold leading-7 text-gray-900 tracking-wider px-4 pb-1 text-center">
    Placeholder
  </h1>
  <div class="flex flex-col justify-center items-center w-100 h-100 max-w-screen-sm mx-auto">
    <div class="m-0.5 sm:m-1">
      {#if $game.connected}
        <Button on:click={leaveGame}>Leave game</Button>
      {:else if $lobby.queuedForNode === undefined}
        <Button on:click={joinQueue}>Find game</Button>
      {:else}
        <Button class="animate-pulse" on:click={leaveQueue}>Searching...</Button>
      {/if}
      <NodeList/>
      <Button container>
        <label class="px-2 py-1 cursor-pointer">
          <span>Colorblind</span>
          <input on:click={toggleColorblind} checked={theme === "theme-colorblind"} type="checkbox" class="ml-1"/>
        </label>
      </Button>
    </div>
    <div class="flex w-full">
      <div class="flex flex-1"></div>
      <div class="flex flex-1 flex-col items-center justify-center select-none">
        <Game/>
      </div>
      <div class="flex flex-1 text-sm sm:text-2xl">
        <div class="sm:pl-6 py-2">
          <Timer endTime="2022-02-02T03:52:16.442555Z"/>
        </div>
      </div>
    </div>
    <Keyboard/>
  </div>
</main>
