import App from "./App.svelte";
import { Socket } from "phoenix";
import { lobby } from "./stores/lobby";

const socket = new Socket("/game", {params: {}});
socket.connect();
lobby.connect(socket);

const app = new App({
	target: document.getElementById("svelte"),
	props: {},
});

export default app;