defmodule WordBattle.Words do
  require Logger

  @valid_letters_set "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                     |> String.graphemes()
                     |> Enum.reduce(MapSet.new(), &MapSet.put(&2, &1))

  def is_valid_guess?(word) do
    valid_guesses_set = :persistent_term.get(:valid_guesses_set)
    MapSet.member?(valid_guesses_set, word)
  end

  def random_solution() do
    solutions_tuple = :persistent_term.get(:solutions_tuple)
    size = tuple_size(solutions_tuple)
    random_index = Enum.random(0..(size - 1))
    elem(solutions_tuple, random_index)
  end

  def load_words!() do
    config = Application.fetch_env!(:word_battle, __MODULE__)

    solutions_list =
      config[:solutions_path]
      |> stream_words_file!()
      |> Enum.to_list()

    valid_guesses_set = Enum.reduce(solutions_list, MapSet.new(), &MapSet.put(&2, &1))
    solutions_tuple = List.to_tuple(solutions_list)
    :persistent_term.put(:solutions_tuple, solutions_tuple)

    valid_guesses_set =
      config[:valid_guesses_path]
      |> stream_words_file!()
      |> Enum.reduce(valid_guesses_set, &MapSet.put(&2, &1))

    :persistent_term.put(:valid_guesses_set, valid_guesses_set)

    Logger.debug(
      "#{tuple_size(solutions_tuple)} solutions and #{MapSet.size(valid_guesses_set)} valid guess words were loaded"
    )
  end

  defp stream_words_file!(path) do
    path
    |> File.stream!()
    |> Stream.map(&String.trim/1)
    |> Stream.map(&String.upcase/1)
    |> Stream.filter(&is_valid_word?/1)
  end

  defp is_valid_word?(word) do
    allowed_length = Application.fetch_env!(:word_battle, __MODULE__)[:word_length]

    if String.length(word) == allowed_length do
      word
      |> String.graphemes()
      |> Enum.all?(&MapSet.member?(@valid_letters_set, &1))
    else
      false
    end
  end
end
