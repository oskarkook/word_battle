import { Channel, Socket } from "phoenix";
import { writable } from "svelte/store";
import { globalAlerts } from "$src/global";

export interface LobbyInfo {
  nodes: string[];
  default_node: string;
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

let defaultNode = localStorage.getItem("default_node");
const { subscribe, update } = writable<LobbyInfo>({
  nodes: defaultNode ? [defaultNode] : [],
  default_node: defaultNode || "",
  ping: 0,
});

export const lobby = {
  subscribe,
  connect: (socket: Socket) => {
    return new Promise<void>((resolve, reject) => {
      const channel = socket.channel("player:lobby", {});
      channel.join()
        .receive("ok", resp => {
          if(!defaultNode || !resp.nodes.includes(defaultNode)) {
            defaultNode = resp.default_node;
            localStorage.setItem("default_node", defaultNode);
          }
          update(info => ({...info, ...resp, default_node: defaultNode}));
          measurePing(channel).then(ping => update(state => ({...state, ping})));
          resolve();
        })
        .receive("error", resp => {
          globalAlerts.push({message: "Could not connect to server!", time: 5000});
          reject();
        });
    });
  },
  setNode: (node: string) => {
    localStorage.setItem("default_node", node);
    update(info => ({...info, default_node: node}));
  }
};