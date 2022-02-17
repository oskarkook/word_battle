defmodule WordBattle.PlayerQueue do
  use GenServer
  require Logger
  alias WordBattle.GameState

  # === Client ===

  def start_link(opts) when is_list(opts) do
    GenServer.start_link(__MODULE__, nil, opts)
  end

  def join(node) when is_atom(node) do
    GenServer.call({__MODULE__, node}, :join)
  end

  def leave(node) when is_atom(node) do
    GenServer.call({__MODULE__, node}, :leave)
  end

  # === Server ===

  @impl GenServer
  def init(_) do
    {:ok, Map.new()}
  end

  @impl GenServer
  def handle_call(:join, {pid, _tag}, map) do
    max_players = Application.fetch_env!(:word_battle, :game)[:max_players]

    cond do
      Map.has_key?(map, pid) ->
        {:reply, :exists, map}

      map_size(map) >= max_players - 1 ->
        {:ok, _pid} =
          [pid | Map.keys(map)]
          |> GameState.start()

        Map.values(map)
        |> Enum.each(&Process.demonitor/1)

        {:reply, :ok, Map.new()}

      true ->
        ref = Process.monitor(pid)
        map = Map.put(map, pid, ref)
        Logger.debug("Participant joined queue")
        {:reply, :ok, map}
    end
  end

  @impl GenServer
  def handle_call(:leave, {pid, _tag}, state) do
    {:reply, :ok, remove(state, pid)}
  end

  @impl GenServer
  def handle_info({:DOWN, _ref, :process, pid, _reason}, state) do
    {:noreply, remove(state, pid)}
  end

  defp remove(map, pid) do
    {ref, map} = Map.pop(map, pid)

    if ref != nil do
      Process.demonitor(ref)
      Logger.debug("Participant left the queue")
    end

    map
  end
end
