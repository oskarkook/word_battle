defmodule WordBattleWeb.PlayerChannel do
  use WordBattleWeb, :channel
  alias WordBattle.PlayerQueue

  @impl true
  def join("player:lobby", _payload, socket) do
    nodes = [node() | Node.list()]
    socket = assign(socket, queued_on: nil)
    {:ok, %{nodes: nodes, default_node: node()}, socket}
  end

  @impl true
  def handle_in("join_queue", %{"node" => node}, socket) do
    if socket.assigns.queued_on do
      {:reply, {:error, "You have already queued for a game!"}, socket}
    else
      node = String.to_existing_atom(node)
      PlayerQueue.join(node)
      {:reply, :ok, assign(socket, queued_on: node)}
    end
  end

  @impl true
  def handle_in("leave_queue", _info, socket) do
    PlayerQueue.leave(socket.assigns.queued_on)
    {:reply, :ok, assign(socket, queued_on: nil)}
  end

  @impl true
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  @impl true
  def handle_info({:game_join, node, game_id, token, dead_at}, socket) do
    push(socket, "game_join", %{node: node, game_id: game_id, token: token, dead_at: dead_at})
    {:noreply, assign(socket, queued_on: nil)}
  end
end
