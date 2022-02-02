<script lang="ts">
  import { onDestroy } from "svelte";
  import { fade } from "svelte/transition";

  interface Ref {
    message: string;
    timer: NodeJS.Timeout | undefined;
  }
  let alerts: Ref[] = [];

  export function pushAlert(message: string, time: number) {
    let timer: NodeJS.Timeout | undefined;
    const ref: Ref = {message, timer};
    if(time !== undefined) {
      ref.timer = setTimeout(() => removeAlert(ref), time);
    }
    alerts = [ref, ...alerts];
  }

  function removeAlert(ref: Ref) {
    const index = alerts.indexOf(ref);
    if(index === -1) return;
    alerts.splice(index, 1);
    alerts = alerts;
  }

  onDestroy(() => {
    alerts.forEach(ref => {
      if(ref.timer) clearTimeout(ref.timer);
    });
  });
</script>

<div class="absolute z-10 w-full flex flex-col items-center">
  {#each alerts as ref (ref)}
    <div out:fade={{duration: 250}} class="z-10 w-fit rounded font-bold p-2 m-2 bg-black text-white" role="alert">
      {ref.message}
    </div>
  {/each}
</div>