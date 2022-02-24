defmodule WordBattle.NodeRegion do
  def get(nodes) do
    for node <- nodes do
      region =
        :persistent_term.get({:node_region, node}, nil) ||
          :erpc.call(node, System, :get_env, ["REGION"]) ||
          Atom.to_string(node)

      :persistent_term.put({:node_region, node}, region)

      %{node: node, region: region}
    end
  end
end
