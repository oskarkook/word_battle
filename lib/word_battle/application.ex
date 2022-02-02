defmodule WordBattle.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Telemetry supervisor
      WordBattleWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: WordBattle.PubSub},
      # Start the Endpoint (http/https)
      WordBattleWeb.Endpoint
      # Start a worker by calling: WordBattle.Worker.start_link(arg)
      # {WordBattle.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: WordBattle.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    WordBattleWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
