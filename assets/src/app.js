import App from "./App.svelte";
import { Socket } from "phoenix";
import { lobby as lobbyStore } from "$src/stores/lobby";
import { globalAlerts } from "$src/global";
import { getLocalGameInfo, clearLocalGameInfo } from "$src/helpers/gameInfo";
import { createGameStore } from "$src/stores/game";

function startSocket() {
	const socket = new Socket("/game", {params: {}});
	socket.onError(() => {
		globalAlerts.push({ message: "Connection error!", time: 4500 });
	});
	socket.connect();
	return socket;
}

function restoreGame(game) {
	const gameInfo = getLocalGameInfo();
	if(gameInfo !== undefined) {
		const deadAt = new Date(gameInfo.dead_at);
		const now = new Date();
		if(now < deadAt) {
			game.connect(gameInfo);
		} else {
			clearLocalGameInfo();
		}
	}
}

const socket = startSocket();
const gameStore = createGameStore(socket);
restoreGame(gameStore);
lobbyStore.connect(socket, gameStore);

const app = new App({
	target: document.getElementById("svelte"),
	props: {game: gameStore},
});

export default app;