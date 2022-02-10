import App from "./App.svelte";
import { Socket } from "phoenix";
import { lobby } from "$src/stores/lobby";
import { globalAlerts } from "$src/global";
import { getLocalGameInfo } from "$src/helpers/gameInfo";
import { game } from "$src/stores/game";

function startSocket() {
	const socket = new Socket("/game", {params: {}});
	socket.onError(() => {
		globalAlerts.push({ message: "Connection error!", time: 4500 });
	});
	socket.connect();
	return socket;
}

function joinLobby(socket) {
	lobby.connect(socket);
}

function restoreGame(socket) {
	const gameInfo = getLocalGameInfo();
	if(gameInfo !== undefined) {
		game.connect(socket, gameInfo);
	}
}

const socket = startSocket();
restoreGame(socket);
joinLobby(socket);

const app = new App({
	target: document.getElementById("svelte"),
	props: {},
});

export default app;