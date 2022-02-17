import { Channel, Socket } from "phoenix";
import { writable } from "svelte/store";
import { globalAlerts } from "$src/global";
import { GameInfo, setLocalGameInfo } from "$src/helpers/gameInfo";
import { game } from "$src/stores/game";

export interface LobbyInfo {
  nodes: string[];
  default_node: string;
  ping: number;
  queuedForNode: string | undefined;
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
let channel: Channel | undefined;
const { subscribe, update } = writable<LobbyInfo>({
  nodes: defaultNode ? [defaultNode] : [],
  default_node: defaultNode || "",
  ping: 0,
  queuedForNode: undefined,
});

export const lobby = {
  subscribe,
  connect: (socket: Socket) => {
    if(channel !== undefined) {
      channel.leave();
    }
    channel = socket.channel("player:lobby", {});
    return new Promise<void>((resolve, reject) => {
      channel.onClose(() => {
        update(state => ({...state, queuedForNode: undefined}));
      });

      channel.onError((reason) => {
        update(state => ({...state, queuedForNode: undefined}));
        if(reason !== undefined) {
          globalAlerts.push({message: "Connection error!", time: 5000});
        }
      });

      channel.on("game_join", (gameInfo: GameInfo) => {
        setLocalGameInfo(gameInfo);
        update(state => ({...state, queuedForNode: undefined}));
        globalAlerts.push({ message: "Game found! Get ready!", time: 2500 });
        game.connect(socket, gameInfo);
      });

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
  },
  joinQueue: (node: string) => {
    channel.push("join_queue", { node })
      .receive("ok", resp => {
        update(state => ({...state, queuedForNode: node}));
      })
      .receive("error", resp => {
        globalAlerts.push({ message: resp, time: 1500 });
      });
  },
  leaveQueue: () => {
    channel.push("leave_queue", {})
      .receive("ok", resp => {
        update(state => ({...state, queuedForNode: undefined}));
      })
      .receive("error", resp => {
        globalAlerts.push({ message: resp, time: 1500 });
      });
  }
};