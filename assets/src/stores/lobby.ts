import { Channel, Socket } from "phoenix";
import { writable } from "svelte/store";
import { globalAlerts } from "$src/global";

export interface LobbyInfo {
  nodes: string[];
  active_node: string;
  ping: number;
};

function measurePing(channel: Channel) {
  return new Promise<number>((resolve, reject) => {
    const measurements = [];
  
    measure(3);
    function measure(count: number) {
      const start = (new Date()).getTime();
      channel.push("ping", {})
        .receive("ok", () => {
          const end = (new Date()).getTime();
          measurements.push(end - start);
  
          if(count > 1) {
            measure(count - 1);
          } else {
            resolve(Math.ceil(measurements.reduce((a, b) => a + b, 0) / measurements.length));
          }
        })
        .receive("error", () => reject("error"))
        .receive("timeout", () => reject("timeout"));
    }
  });
}

const { subscribe, update } = writable<LobbyInfo>({
  nodes: [],
  active_node: "",
  ping: 0,
});

export const lobby = {
  subscribe,
  connect: (socket: Socket) => {
    const channel = socket.channel("player:lobby", {});
    channel.join()
      .receive("ok", resp => {
        update(info => ({...info, ...resp}));
        measurePing(channel).then(ping => update(state => ({...state, ping})));
      })
      .receive("error", resp => {
        globalAlerts.push({message: "Could not connect to server!", time: 5000});
      });
  }
};