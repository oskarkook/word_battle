import { writable } from "svelte/store";

interface Ref {
  message: string;
  timer: NodeJS.Timeout | undefined;
}

export function createAlertsStore() {
  const { subscribe, update } = writable<Ref[]>([]);

  return {
    subscribe,
    push: (message: string, time: number | undefined) => {
      let timer: NodeJS.Timeout | undefined;
      const ref: Ref = {message, timer};
      if(time !== undefined) {
        ref.timer = setTimeout(() => {
          update(alerts => {
            const index = alerts.indexOf(ref);
            if(index === -1) return;
            alerts.splice(index, 1);
            return alerts;
          });
        }, time);
      }
      update(alerts => [ref, ...alerts]);
    }
  };
}