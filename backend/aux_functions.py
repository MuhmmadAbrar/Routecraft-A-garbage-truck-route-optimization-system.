import networkx as nx
from geopy.distance import geodesic
import itertools
def plan_optimized_route(dustbins):
    """
    Plan optimized route for waste collection based on dustbin coordinates and capacities.
    Returns the sequence of dustbin IDs in the optimized order.
    """
    # Simple greedy algorithm for TSP
    # Start from the first dustbin and find the closest dustbin iteratively
    print(dustbins)
    dict={}
    for i in range(len(dustbins)):
        dict[i]={}
        dict[i]['latitude']=dustbins[i][0]
        dict[i]['longitude']=dustbins[i][1]
        dict[i]['capacity']=dustbins[i][2]
    print(dict)
        
    # Create a weighted graph
    G = nx.Graph()

    # Add nodes to the graph
    for bin_id, attrs in dict.items():
        G.add_node(bin_id, **attrs)

    # Calculate and add weighted edges to the graph considering effective capacity
    for start, start_attrs in dict.items():
        for end, end_attrs in dict.items():
            if start != end:
                dist = geodesic((start_attrs['latitude'], start_attrs['longitude']), (end_attrs['latitude'], end_attrs['longitude'])).kilometers
                start_remaining = start_attrs['capacity']
                end_remaining = end_attrs['capacity']
                weight = dist / min(start_remaining, end_remaining)
                G.add_edge(start, end, weight=weight)

    # Find the optimal path visiting all bins in the network
    all_bins = list(dict.keys())
    all_paths = []
    starting_bin = max(dict, key=lambda x: dict[x]['capacity'])  # Start from the most filled bin
    for perm in itertools.permutations(all_bins, len(all_bins)):
        if perm[0] == starting_bin:
            try:
                path_length = sum(nx.astar_path_length(G, perm[i], perm[i + 1], weight='weight') for i in range(len(perm) - 1))
                all_paths.append((perm, path_length))
            except nx.NetworkXNoPath:
                pass

    if all_paths:
        optimal_path = min(all_paths, key=lambda x: x[1])
        print("Optimal Path Routing Order considering all bins and their capacities:", list(optimal_path[0]))
        print("Path Length:", optimal_path[1])
    else:
        print("No feasible path found.")
        
    #print(optimized_route)
    return list(optimal_path[0])
