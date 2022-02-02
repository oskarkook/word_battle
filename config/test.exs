import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :word_battle, WordBattleWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "sVIjS2b9yyjTvJh7DiZN2xA2aMJVZ6uT0yOG5cq6KSMCYHj03IUdzkHvs1hCiATP",
  server: false

# Print only warnings and errors during test
config :logger, level: :warn

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime
