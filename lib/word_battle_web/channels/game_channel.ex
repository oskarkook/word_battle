defmodule WordBattleWeb.GameChannel do
  use WordBattleWeb, :channel
  alias WordBattle.GameState

  @impl true
  def join("game:" <> node_and_id, %{"token" => token}, socket) do
    {node, game_id} = parse_node_and_id(node_and_id)

    with {:ok, {node, game_id, my_player_id}} <- GameState.verify(node, game_id, token),
         {:ok, game_info} <- GameState.get_info(node, game_id) do
      game_definition = game_info.game_definition
      disconnect_at(game_definition.dead_at)

      socket =
        assign(
          socket,
          game_definition: game_definition,
          player_id: my_player_id
        )

      reply =
        game_info_reply(socket, game_info)
        |> Map.merge(%{
          player_id: my_player_id,
          game_definition:
            Map.take(
              game_definition,
              [:begin_at, :finish_at, :word_length, :guesses_allowed]
            )
        })

      {:ok, reply, socket}
    else
      {:error, :not_found} ->
        {:error, %{reason: "Game not found"}}

      _other ->
        {:error, %{reason: "Unauthorized"}}
    end
  end

  @impl true
  def handle_in("guess_word", %{"word" => word}, %Phoenix.Socket{assigns: assigns} = socket) do
    game_definition = assigns.game_definition

    word =
      word
      |> String.slice(0..(game_definition.word_length - 1))
      |> String.upcase()

    game_state = GameState.game_state(game_definition)

    reply =
      cond do
        game_state == :completed ->
          {:error, %{r: "s", m: "Game has ended!"}}

        game_state == :waiting ->
          {:error, %{r: "s", m: "Game has not started yet!"}}

        !WordBattle.Words.is_valid_guess?(word) ->
          # TODO: if nodes can have different wordsets, then this should be removed
          {:error, %{r: "w", m: "Not in word list!"}}

        true ->
          result =
            GameState.add_player_guess(
              game_definition.node,
              game_definition.id,
              assigns.player_id,
              word
            )

          case result do
            :ok ->
              mask = mask_guess(word, game_definition.solution)
              # TODO: broadcast
              {:ok, %{r: mask}}

            _other ->
              {:error, %{reason: "Not allowed"}}
          end
      end

    {:reply, reply, socket}
  end

  @impl true
  def handle_in("refetch_state", _, socket) do
    game_definition = socket.assigns.game_definition

    case GameState.get_info(game_definition.node, game_definition.id) do
      {:ok, game_info} ->
        {:reply, {:ok, game_info_reply(socket, game_info)}, socket}

      _other ->
        {:reply, {:error, %{reason: "Game not found!"}}}
    end
  end

  @impl true
  def handle_info(:disconnect, socket) do
    {:stop, :normal, socket}
  end

  defp game_info_reply(socket, game_info) do
    game_definition = game_info.game_definition
    player_guesses = mask_player_guesses(game_info.player_guesses, game_definition.solution)

    case GameState.game_state(game_definition) do
      :completed ->
        %{
          player_guesses: player_guesses,
          solution: game_definition.solution
        }

      _other ->
        %{
          player_guesses: hide_other_players(player_guesses, socket.assigns.player_id)
        }
    end
  end

  defp parse_node_and_id(string) when is_binary(string) do
    [node, id] = String.split(string, ":", parts: 2)
    {String.to_existing_atom(node), id}
  end

  defp disconnect_at(dead_at) do
    now = DateTime.utc_now()
    Process.send_after(self(), :disconnect, DateTime.diff(dead_at, now, :millisecond))
  end

  defp new_letter_map(word) when is_binary(word) do
    for {letter, i} <- String.graphemes(word) |> Enum.with_index(), reduce: %{} do
      acc -> Map.update(acc, letter, [i], fn positions -> [i | positions] end)
    end
  end

  defp mask_player_guesses(player_guesses, solution) do
    letter_map = new_letter_map(solution)

    for {player_id, words} <- player_guesses, into: %{} do
      masks = Enum.map(words, &mask_guess(&1, letter_map))
      guesses = Enum.zip_with(words, masks, fn word, mask -> [word, mask] end)
      {player_id, guesses}
    end
  end

  defp mask_guess(guess, solution) when is_binary(solution) do
    letter_map = new_letter_map(solution)
    mask_guess(guess, letter_map)
  end

  defp mask_guess(guess, letter_map) when is_map(letter_map) do
    for {letter, position} <- String.graphemes(guess) |> Enum.with_index(), into: <<>> do
      letter_positions = Map.get(letter_map, letter)

      cond do
        letter_positions == nil -> "0"
        Enum.member?(letter_positions, position) -> "2"
        true -> "1"
      end
    end
  end

  defp hide_other_players(player_guesses, kept_player_id) do
    for {player_id, guesses} <- player_guesses, into: %{} do
      if player_id != kept_player_id do
        guesses = Enum.map(guesses, fn [_word, mask] -> [nil, mask] end)
        {player_id, guesses}
      else
        {player_id, guesses}
      end
    end
  end
end
