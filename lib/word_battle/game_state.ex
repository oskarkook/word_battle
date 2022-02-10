defmodule WordBattle.GameState do
  use GenServer
  alias WordBattle.GameDefinition

  # === Client ===
  def start(pids, opts \\ []) when is_list(pids) and is_list(opts) do
    id = for _ <- 1..10, into: "", do: <<Enum.random('0123456789abcdef')>>
    opts = Keyword.put(opts, :name, {:via, Registry, {WordBattle.GameRegistry, id}})

    case GenServer.start(__MODULE__, {id, pids}, opts) do
      {:ok, pid} -> {:ok, pid}
      {:error, {:already_started, _pid}} -> start(pids, opts)
      other -> other
    end
  end

  def verify(node, game_id, token)
      when is_atom(node) and is_binary(game_id) and is_binary(token) do
    case verify_token(token) do
      {:ok, {^node, ^game_id, _player_id}} = response ->
        response

      {:ok, _values} ->
        {:error, :incorrect_token}

      {:error, _} = response ->
        response
    end
  end

  def get_info(node, game_id) when is_atom(node) and is_binary(game_id) do
    if node == node() do
      [{pid, nil}] = Registry.lookup(WordBattle.GameRegistry, game_id)
      GenServer.call(pid, :get_info)
    else
      :rpc.call(node, __MODULE__, :get_info, [node, game_id])
    end
  end

  def add_player_guess(node, game_id, player_id, guess)
      when is_atom(node) and is_binary(game_id) do
    if node == node() do
      [{pid, nil}] = Registry.lookup(WordBattle.GameRegistry, game_id)
      GenServer.call(pid, {:add_player_guess, player_id, guess})
    else
      :rpc.call(node, __MODULE__, :add_player_guess, [node, game_id, player_id, guess])
    end
  end

  def game_state(%GameDefinition{begin_at: begin_at, finish_at: finish_at}) do
    now = DateTime.utc_now()

    cond do
      finish_at != nil && DateTime.compare(now, finish_at) !== :lt ->
        :completed

      begin_at != nil && DateTime.compare(now, begin_at) == :lt ->
        :waiting

      true ->
        :running
    end
  end

  # === Server ===
  @impl GenServer
  def init({game_id, player_pids}) do
    player_guesses =
      for n <- 0..(length(player_pids) - 1), into: %{} do
        {n, []}
      end

    solution = WordBattle.Words.random_solution()
    now = DateTime.utc_now()

    state = %{
      game_definition: %GameDefinition{
        node: node(),
        id: game_id,
        solution: solution,
        word_length: String.length(solution),
        guesses_allowed: 6,
        begin_at: DateTime.add(now, 10, :second),
        finish_at: DateTime.add(now, 210, :second)
      },
      player_guesses: player_guesses
    }

    {:ok, state, {:continue, player_pids}}
  end

  @impl GenServer
  def handle_continue(player_pids, state) do
    player_pids
    |> Enum.with_index()
    |> Enum.each(fn {pid, i} ->
      %GameDefinition{node: node, id: game_id} = state.game_definition
      token = sign_token(node, game_id, i)
      send(pid, {:game_join, node, game_id, token})
    end)

    {:noreply, state}
  end

  @impl GenServer
  def handle_call(:get_info, _, state) do
    {:reply, state, state}
  end

  @impl GenServer
  def handle_call({:add_player_guess, player_id, guess}, _, state) do
    state = update_in(state, [:player_guesses, player_id], fn guesses -> guesses ++ [guess] end)
    {:reply, :ok, state}
  end

  # === Private ===
  defp sign_token(node, game_id, player_id) do
    Phoenix.Token.sign(WordBattleWeb.Endpoint, "game_state", {node, game_id, player_id})
  end

  defp verify_token(token) do
    Phoenix.Token.verify(WordBattleWeb.Endpoint, "game_state", token)
  end
end
