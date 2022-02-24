<script lang="ts">
  import Game from "$src/lib/Game/Game.svelte";
  import Keyboard from "$src/lib/Keyboard/Keyboard.svelte";
  import Button from "$src/lib/Button/Button.svelte";
  import NodeList from "$src/lib/NodeList/NodeList.svelte";
  import { lobby } from "$src/stores/lobby";
  import { createGameStore } from "$src/stores/game";
  import { colorblind } from "$src/stores/colorblind";
  export let game: ReturnType<typeof createGameStore>;

  $: theme = $colorblind ? "theme-colorblind" : "theme-default";
  function toggleColorblind() {
    $colorblind = !$colorblind;
  }

  function leaveQueue() {
    lobby.leaveQueue();
  }

  function newGame() {
    game.leave();
    lobby.joinQueue($lobby.default_node);
  }
</script>

<main class="{theme} h-screen w-full overflow-x-hidden bg-slate-50 py-2 md:py-4">
  <h1 class="text-3xl font-bold leading-7 text-gray-900 tracking-wider px-4 pb-1 text-center">
    Word Battle
  </h1>
  <div class="flex flex-col justify-center items-center w-100 h-100 max-w-screen-sm mx-auto">
    <div class="m-0.5 sm:m-1">
      {#if $lobby.queuedForNode === undefined}
        <Button on:click={newGame}>New game</Button>
      {:else}
        <Button class="animate-pulse" on:click={leaveQueue}>Searching...</Button>
      {/if}
      {#if $lobby.nodes.length > 1}
        <NodeList/>
      {/if}
      <Button container>
        <label class="px-2 py-1 cursor-pointer">
          <span>Colorblind</span>
          <input on:click={toggleColorblind} checked={$colorblind} type="checkbox" class="ml-1"/>
        </label>
      </Button>
    </div>
    <Game game={game}/>
    <Keyboard guessedWords={$game.player_guesses[$game.player_id]} disabled={$game.player_id !== $game.view_player_id || $game.state !== "running"}/>
  </div>
</main>
