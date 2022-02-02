defmodule WordBattleWeb.PlayerChannel do
  use WordBattleWeb, :channel

  @impl true
  def join("player:lobby", _payload, socket) do
    nodes = ["EU"]
    {:ok, %{nodes: nodes, active_node: "EU"}, socket}
  end

end