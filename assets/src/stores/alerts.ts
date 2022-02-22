import { writable } from "svelte/store";

export interface Alert {
  message: string;
  time?: number;
}

export function createAlertsStore() {
  const { subscribe, update, set } = writable<Alert[]>([]);

  const store = {
    subscribe,
    push: (alert: Alert) => {
      if(alert.time !== undefined) {
        setTimeout(() => {
          store.hide(alert);
        }, alert.time);
      }
      update(alerts => [alert, ...alerts]);
    },
    hide: (alert: Alert) => {
      update(alerts => {
        const index = alerts.indexOf(alert);
        if(index === -1) {
          return alerts;
        }

        alerts.splice(index, 1);
        return alerts;
      });
    },
    clear: () => {
      set([]);
    }
  };

  return store;
}