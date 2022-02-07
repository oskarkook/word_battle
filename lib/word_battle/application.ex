defmodule WordBattle.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    WordBattle.Words.load_words!()

    children = [
      {Cluster.Supervisor,
       [Application.get_env(:libcluster, :topologies), [name: WordBattle.ClusterSupervisor]]},
      {WordBattle.GameList, name: WordBattle.GameList},
      WordBattleWeb.Telemetry,
      {Phoenix.PubSub, name: WordBattle.PubSub},
      WordBattleWeb.Endpoint
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
