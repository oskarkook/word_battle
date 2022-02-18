<script lang="ts">
  import { colorClasses } from "$src/helpers/letter";
  import ProgressBar from "$src/lib/ProgressBar/ProgressBar.svelte";
  import { createGameStore, GameState } from "$src/stores/game";
  export let game: ReturnType<typeof createGameStore>;

  function getColorClass(state: GameState["state"]): string | undefined {
    if(state === "waiting") return colorClasses["present"];
    if(state === "running") return colorClasses["correct"];
    return undefined;
  }
  
  let state = $game.state;
  let duration: number;
  let percentage: number;
  $: {
    if(state !== $game.state) {
      state = $game.state;
      let fromDate: Date | undefined;
      let toDate: Date | undefined;
      if($game.state === "waiting") {
        fromDate = new Date();
        toDate = new Date($game.game_definition.begin_at);
      } else if($game.state === "running") {
        fromDate = new Date($game.game_definition.begin_at);
        toDate = new Date($game.game_definition.finish_at);
      }
  
      if(fromDate && toDate) {
        duration = toDate.getTime() - fromDate.getTime();
        percentage = (toDate.getTime() - Date.now()) / ((toDate.getTime() - fromDate.getTime()) / 100);
      }
    }
  }
</script>

{#key state}
  <ProgressBar class={getColorClass(state)} percentage={percentage} duration={duration}/>
{/key}