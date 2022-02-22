defmodule WordBattleWeb.Router do
  use WordBattleWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :put_root_layout, {WordBattleWeb.LayoutView, :root}
    plug :put_secure_browser_headers
  end

  scope "/", WordBattleWeb do
    pipe_through :browser

    get "/*path", GameController, :index
  end
end
