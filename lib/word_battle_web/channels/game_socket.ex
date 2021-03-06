defmodule WordBattleWeb.GameSocket do
  use Phoenix.Socket

  channel "player:lobby", WordBattleWeb.PlayerChannel
  channel "game:*", WordBattleWeb.GameChannel

  @impl true
  def connect(_params, socket, _connect_info) do
    {:ok, socket}
  end

  @impl true
  def id(_socket), do: nil
end
