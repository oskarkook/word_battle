defmodule WordBattleWeb.PlayerChannel do
  use WordBattleWeb, :channel

  @impl true
  def join("player:lobby", _payload, socket) do
    nodes = [node() | Node.list()]
    {:ok, %{nodes: nodes, default_node: node()}, socket}
  end

  @impl true
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end
end
