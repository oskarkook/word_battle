import { writable } from "svelte/store";

export interface Alert {
  message: string;
  time?: number;
}

export function createAlertsStore() {
  const { subscribe, update } = writable<Alert[]>([]);

  return {
    subscribe,
    push: (alert: Alert) => {
      if(alert.time !== undefined) {
        setTimeout(() => {
          update(alerts => {
            const index = alerts.indexOf(alert);
            if(index === -1) return;
            alerts.splice(index, 1);
            return alerts;
          });
        }, alert.time);
      }
      update(alerts => [alert, ...alerts]);
    }
  };
}