defmodule WordBattleWeb.GameChannel do
  use WordBattleWeb, :channel
  alias WordBattle.GameState

  @impl true
  def join("game:" <> node_and_id, %{"token" => token}, socket) do
    {node, game_id} = parse_node_and_id(node_and_id)

    with {:ok, {node, game_id, player_id}} <- GameState.verify(node, game_id, token),
         {:ok, game_info} <- GameState.get_info(node, game_id) do
      %{game_definition: game_definition, player_guesses: player_guesses} = game_info
      solution_map = new_letter_map(game_definition.solution)

      reply = %{
        player_id: player_id,
        game_definition:
          game_definition
          |> Map.take([:begin_at, :finish_at, :word_length, :guesses_allowed]),
        player_guesses:
          player_guesses
          |> Enum.map(fn {player_id, guesses} ->
            guesses = Enum.map(guesses, &obfuscate_guess(&1, solution_map))
            {player_id, guesses}
          end)
          |> Enum.into(%{}),
        my_guessed_words: Map.get(player_guesses, player_id, [])
      }

      socket =
        assign(socket,
          game_definition: game_definition,
          player_id: player_id,
          solution_map: solution_map
        )

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
          {:error, %{r: "s", m: "Game has ended"}}

        game_state == :waiting ->
          {:error, %{r: "s", m: "Game has not started yet"}}

        !WordBattle.Words.is_valid_guess?(word) ->
          {:error, %{r: "w", m: "Not in word list"}}

        true ->
          :ok =
            GameState.add_player_guess(
              game_definition.node,
              game_definition.id,
              assigns.player_id,
              word
            )

          obfuscated_guess = obfuscate_guess(word, assigns.solution_map)
          # TODO: broadcast
          {:ok, %{r: obfuscated_guess}}
      end

    {:reply, reply, socket}
  end

  defp obfuscate_guess(guess, solution_map) do
    for {letter, position} <- String.graphemes(guess) |> Enum.with_index(), into: <<>> do
      letter_positions = Map.get(solution_map, letter)

      cond do
        letter_positions == nil -> "0"
        Enum.member?(letter_positions, position) -> "2"
        true -> "1"
      end
    end
  end

  defp new_letter_map(word) when is_binary(word) do
    for {letter, i} <- String.graphemes(word) |> Enum.with_index(), reduce: %{} do
      acc -> Map.update(acc, letter, [i], fn positions -> [i | positions] end)
    end
  end

  defp parse_node_and_id(string) when is_binary(string) do
    [node, id] = String.split(string, ":", parts: 2)
    {String.to_existing_atom(node), id}
  end
end
