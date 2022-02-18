# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

# Configures the endpoint
config :word_battle, WordBattleWeb.Endpoint,
  url: [host: "localhost"],
  render_errors: [view: WordBattleWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: WordBattle.PubSub,
  live_view: [signing_salt: "5SgeAfM+"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Tailwind
config :tailwind,
  version: "3.0.18",
  default: [
    args: ~w(
    --config=tailwind.config.js
    --input=css/app.css
    --output=../priv/static/assets/tailwind.css
  ),
    cd: Path.expand("../assets", __DIR__)
  ]

# Game config
config :word_battle, :game,
  max_players: 8,
  # game lasts for 3 minutes
  game_length: 3 * 60_000,
  # game starts after 5 seconds
  start_delay: 5_000,
  # game state is purged after 5 minutes
  finish_delay: 5 * 60_000

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
