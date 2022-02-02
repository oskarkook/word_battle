defmodule WordBattleWeb.GameController do
  use WordBattleWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
