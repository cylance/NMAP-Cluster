
"""
Here we are optimizing in the sense of picking the best value based on constraints
Not optimizing for performance
"""


def sort_items_by_multiple_keys(items, sort_directions, sort_weights):
    weights = [0] * len(items)
    for key in sort_directions.keys():
        sorted_items = sorted(enumerate(items), key=lambda x: x[1][key], reverse=sort_directions[key])
        for index in xrange(len(sorted_items)):
            weights[sorted_items[index][0]] += index * sort_weights[key]

    return sorted(enumerate(weights), key=lambda x: x[1])