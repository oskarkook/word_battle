defmodule WordBattle.GameDefinition do
  defstruct node: nil,
            id: nil,
            solution: nil,
            # We store word length here so it doesn't need to be recomputed everywhere
            word_length: nil,
            guesses_allowed: 6,
            begin_at: nil,
            finish_at: nil,
            dead_at: nil
end
