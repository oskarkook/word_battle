import Config

# config/runtime.exs is executed for all environments, including
# during releases. It is executed after compilation and before the
# system starts, so it is typically used to load production configuration
# and secrets from environment variables or elsewhere. Do not define
# any compile-time configuration in here, as it won't be applied.
# The block below contains prod specific runtime configuration.

config :word_battle, WordBattle.Words,
  word_length: System.get_env("WORD_LENGTH", "5") |> String.to_integer()

# Start the phoenix server if environment is set and running in a release
if System.get_env("PHX_SERVER") && System.get_env("RELEASE_NAME") do
  config :word_battle, WordBattleWeb.Endpoint, server: true
end

if config_env() == :dev do
  default_solutions_path = Path.join([File.cwd!(), "words", "solutions.txt"])
  default_guesses_path = Path.join([File.cwd!(), "words", "valid_guesses.txt"])

  config :word_battle, WordBattle.Words,
    solutions_path: System.get_env("SOLUTIONS", default_solutions_path),
    valid_guesses_path: System.get_env("VALID_GUESSES", default_guesses_path)
end

if config_env() == :prod do
  config :word_battle, WordBattle.Words,
    solutions_path: System.fetch_env!("SOLUTIONS"),
    valid_guesses_path: System.fetch_env!("VALID_GUESSES")

  # The secret key base is used to sign/encrypt cookies and other secrets.
  # A default value is used in config/dev.exs and config/test.exs but you
  # want to use a different value for prod and you most likely don't want
  # to check this value into version control, so we use an environment
  # variable instead.
  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """

  host = System.get_env("PHX_HOST") || "example.com"
  port = String.to_integer(System.get_env("PORT") || "4000")

  config :word_battle, WordBattleWeb.Endpoint,
    url: [host: host, port: 443],
    http: [
      # Enable IPv6 and bind on all interfaces.
      # Set it to  {0, 0, 0, 0, 0, 0, 0, 1} for local network only access.
      # See the documentation on https://hexdocs.pm/plug_cowboy/Plug.Cowboy.html
      # for details about using IPv6 vs IPv4 and loopback vs public addresses.
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: port
    ],
    secret_key_base: secret_key_base

  app_name = System.fetch_env!("FLY_APP_NAME")

  config :libcluster,
    debug: true,
    topologies: [
      fly6pn: [
        strategy: Cluster.Strategy.DNSPoll,
        config: [
          polling_interval: 60_000,
          query: "#{app_name}.internal",
          node_basename: app_name
        ]
      ]
    ]
end
