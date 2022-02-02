import { Socket } from "phoenix";
import { writable } from "svelte/store";
import { globalAlerts } from "$src/global";

export interface LobbyInfo {
  nodes: string[];
  active_node: string;
}
const { subscribe, set } = writable<LobbyInfo>({
  nodes: ["🤔"],
  active_node: "🤔",
});

export const lobby = {
  subscribe,
  connect: (socket: Socket) => {
    const channel = socket.channel("player:lobby", {});
    channel.join()
      .receive("ok", resp => {
        set(resp);
      })
      .receive("error", resp => {
        globalAlerts.push({message: "Could not connect to server!", time: 5000});
      });
  }
};