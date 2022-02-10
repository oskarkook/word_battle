import App from "./App.svelte";
import { Socket } from "phoenix";
import { lobby } from "./stores/lobby";
import { globalAlerts } from "$src/global";

const socket = new Socket("/game", {params: {}});
socket.onError(() => {
	globalAlerts.push({ message: "Connection error!", time: 4500 });
});
socket.connect();
lobby.connect(socket);

const app = new App({
	target: document.getElementById("svelte"),
	props: {},
});

export default app;