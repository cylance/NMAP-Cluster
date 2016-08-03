from clusteringnmap.analysis import reduce_shared_features, get_common_features_from_cluster
import matplotlib.pyplot as plt
import numpy as np


def display_vector_index_details(vector_index, vectors, vector_names, vectorizer):
    # borrow the feature -> string method from get_common_features_from_cluster
    output = ""
    upf, unf, shared_features = get_common_features_from_cluster(vectors[vector_index, :].reshape(1, -1), np.array([0]), vectorizer)
    ip = vector_names[vector_index]
    features = set()
    for feature in reduce_shared_features(shared_features[0]['positive']):
        features.add(" - ".join([i.encode("unicode-escape") for i in feature]))

    features = sorted(list(features))
    output += "IP: {0}\n".format(ip)
    for f in features:
        output += f + "\n"
    return output + "\n"


def display_shared_vector_indeces_details(vector_indeces, vectors, vector_names, vectorizer):
    # borrow the feature -> string method from get_common_features_from_cluster
    output = ""
    upf, unf, shared_features = get_common_features_from_cluster(vectors[vector_indeces, :], np.array([0] * len(vector_indeces)), vectorizer)

    features = set()
    for feature in reduce_shared_features(shared_features[0]['positive']):
        features.add(" - ".join([i.encode("unicode-escape") for i in feature]))

    features = sorted(list(features))
    if len(features) == 0:
        return "No shared features\n"
    for f in features:
        output += f + "\n"
    return output + "\n"


def print_cluster_details(cluster_details, shared_features):
    for cluster_id in cluster_details.keys():
        print "Cluster ID: {0}".format(cluster_id)
        print "Silhouette Score: {0}".format(cluster_details[cluster_id]["silhouette"])
        print "IPs: {0}".format(", ".join(sorted(cluster_details[cluster_id]["ips"])))
        print ""
        print "Shared Features:"
        for feature in reduce_shared_features(shared_features[cluster_id]['positive']):
            print " - ".join([i.encode("unicode-escape") for i in feature])

        print ""
        print ""


def generate_dot_graph_for_gephi(distance_matrix, vector_names, labels, graph_name="nmapcluster"):
    dot_string = "digraph nmapcluster {\n"
    max_distance = distance_matrix.max()
    for index, vn in enumerate(vector_names):
        dot_string += "{0} [label=\"{2} - {1}\" cluster_id=\"{2}\" size=\"64\"];\n".format(index, vn, labels[index])

    for x in xrange(len(vector_names) - 1):
        for y in xrange(x + 1, len(vector_names)):
            dist = ((max_distance - distance_matrix[x, y]) / max_distance)
            if dist <= 0:
                dist = 0.00001
            dot_string += "{0} -> {1} [weight=\"{2}\"]\n".format(x, y, dist)

    dot_string += "}\n"
    return dot_string


def create_plot(reduced_vectors, labels, vector_names):
    plt.figure()
    colors = plt.get_cmap('jet')(np.linspace(0, 1.0, len(set(labels))))
    for index in range(len(labels)):
        plt.scatter(reduced_vectors[index, 0], reduced_vectors[index, 1], c=colors[labels[index]], label=labels[index])
        plt.annotate(vector_names[index], xy=(reduced_vectors[index, 0], reduced_vectors[index, 1]))
    plt.legend(loc='best')
    plt.show()
