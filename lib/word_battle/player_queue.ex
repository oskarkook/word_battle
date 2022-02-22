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
    {:ok, {Map.new(), nil}}
  end

  @impl GenServer
  def handle_call(:join, {pid, _tag}, {map, timer}) do
    if Map.has_key?(map, pid) do
      {:reply, :exists, {map, timer}}
    else
      ref = Process.monitor(pid)
      map = Map.put(map, pid, ref)
      Logger.debug("Participant joined queue")

      state = {map, timer} |> schedule_game_creation()
      {:reply, :ok, state}
    end
  end

  @impl GenServer
  def handle_call(:leave, {pid, _tag}, state) do
    {:reply, :ok, handle_leave(state, pid)}
  end

  @impl GenServer
  def handle_info({:DOWN, _ref, :process, pid, _reason}, state) do
    {:noreply, handle_leave(state, pid)}
  end

  @impl GenServer
  def handle_info(:create_game, {map, timer}) do
    cancel_timer(timer)
    timer = nil

    if map_size(map) == 0 do
      {:noreply, {map, timer}}
    else
      {:ok, _pid} = Map.keys(map) |> GameState.start()
      Map.values(map) |> Enum.each(&Process.demonitor/1)
      {:noreply, {Map.new(), timer}}
    end
  end

  defp schedule_game_creation({map, timer}) do
    config = Application.fetch_env!(:word_battle, :game)
    player_count = map_size(map)

    cond do
      player_count == 0 ->
        cancel_timer(timer)
        {map, nil}

      player_count == 1 ->
        cancel_timer(timer)
        timer = Process.send_after(self(), :create_game, config[:queue_timeout])
        {map, timer}

      player_count >= config[:max_players] ->
        cancel_timer(timer)
        Process.send(self(), :create_game, [])
        {map, nil}

      true ->
        {map, timer}
    end
  end

  defp handle_leave({map, timer}, pid) do
    {ref, map} = Map.pop(map, pid)

    if ref != nil do
      Process.demonitor(ref)
      Logger.debug("Participant left the queue")
    end

    {map, timer} |> schedule_game_creation()
  end

  defp cancel_timer(nil), do: :ok
  defp cancel_timer(timer), do: Process.cancel_timer(timer)
end
