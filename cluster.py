from clusteringnmap.vectorize import Vectorizer, vectorize
from clusteringnmap.clustering import cluster_with_dbscan, cluster_with_kmeans, precompute_distances, cluster_with_agglomerative, cluster_interactive
from clusteringnmap.validation import validate_clusters, get_average_distance_per_cluster
from clusteringnmap.analysis import get_common_features_from_cluster, get_common_feature_stats
from clusteringnmap.display import print_cluster_details, generate_dot_graph_for_gephi, create_plot, display_vector_index_details, display_shared_vector_indeces_details
from clusteringnmap.optimizing import sort_items_by_multiple_keys
from clusteringnmap.reduction import pca
from sklearn.preprocessing import normalize
import clusteringnmap.interactive_state


# bit of a hack to allow custom static resources in bokeh
from os.path import abspath
from tornado.web import StaticFileHandler

import bokeh.core.templates
from jinja2 import Template
with open("webstatic/file.html", "r") as f:
    bokeh.core.templates.FILE = Template(f.read())

import bokeh.server.urls
from bokeh.settings import settings
class newStaticHandler(StaticFileHandler):
    ''' Implements a custom Tornado static file handler for BokehJS
    JavaScript and CSS resources.
    '''
    def __init__(self, tornado_app, *args, **kw):
        kw['path'] = abspath("webstatic/static")

        # Note: tornado_app is stored as self.application
        super(newStaticHandler, self).__init__(tornado_app, *args, **kw)

    # We aren't using tornado's built-in static_path function
    # because it relies on TornadoApplication's autoconfigured
    # static handler instead of our custom one. We have a
    # custom one because we think we might want to serve
    # static files from multiple paths at once in the future.
    @classmethod
    def append_version(cls, path):
        # this version is cached on the StaticFileHandler class,
        # keyed by absolute filesystem path, and only invalidated
        # on an explicit StaticFileHandler.reset(). The reset is
        # automatic on every request if you set
        # static_hash_cache=False in TornadoApplication kwargs.
        version = StaticFileHandler.get_version(dict(static_path=settings.bokehjsdir()), path)
        return ("%s?v=%s" % (path, version))

bokeh.server.urls.toplevel_patterns[1] = (r'/static/(.*)', newStaticHandler)

from bokeh.command.subcommands.serve import Serve
import logging
from json import loads as jloads
from pprint import pprint


def cluster(
        vector_names,
        vectors,
        reduced_vectors,
        normalized_vectors,
        vectorizer,
        strategy="automatic",
        cluster_method="kmeans",
        n_clusters=2,
        epsilon=0.5,
        min_samples=5,
        metric="euclidean",
):
    """
    Clustering options:

    Manual:
     The user supplies all required information to do the clustering. This includes the clustering algorithm and
     hyper parameters

    Assisted:
     The user assists the algorithm by suggesting that some samples should or should not be clustered together

    Automatic:
     The multiple clustering strategies and parameters are used in an attempt to get the best clusters
    """
    if strategy == "manual":
        if cluster_method == "kmeans":
            return cluster_with_kmeans(normalized_vectors, n_clusters=n_clusters)

        elif cluster_method == "dbscan":
            return cluster_with_dbscan(normalized_vectors, epsilon=epsilon, min_samples=min_samples, metric=metric)

        elif cluster_method == "agglomerative":
            return cluster_with_agglomerative(normalized_vectors, n_clusters=n_clusters, metric=metric)

        else:
            # Unknown clustering method
            raise NotImplementedError()

    elif strategy == "assisted":
        """
        To display a information about a vector to a user, you can use the following:
        display_vector_index_details(vector_index, vectors, vector_names, vectorizer)
        """
        # todo Try with normalized vectors
        return cluster_interactive(reduced_vectors)
    elif strategy == "viz":
        clusteringnmap.interactive_state._vector_names = vector_names
        clusteringnmap.interactive_state._vectors = vectors
        clusteringnmap.interactive_state._vectorizer = vectorizer
        clusteringnmap.interactive_state._reduced_vectors = reduced_vectors
        clusteringnmap.interactive_state._normalized_vectors = normalized_vectors
        clusteringnmap.interactive_state._labels = [0] * vectors.shape[0]

        print "Go to http://localhost:5006/Interactive_Clustering_bokeh"
        print "Press CTRL-C to exit web interface"
        parser = argparse.ArgumentParser(Serve.args)
        s = Serve(parser)
        s.invoke(parser.parse_args(["clusteringnmap/Interactive_Clustering_bokeh.py"]))
        return clusteringnmap.interactive_state._labels
    elif strategy == "automatic":
        results = []
        smallest_cluster_count = vectors.shape[0]
        for cluster_method in [
            "kmeans",
            "dbscan",
            "agglomerative",
        ]:
            if cluster_method == "kmeans":
                logging.debug("Starting prospective KMeans clusterings")
                move_to_next_method = False
                for n_clusters in xrange(2, smallest_cluster_count):
                    logging.debug("Trying {0}".format("kmeans(n_clusters={0})".format(n_clusters)))
                    labels = cluster_with_kmeans(reduced_vectors, n_clusters=n_clusters)
                    overall_score, per_cluster_score = validate_clusters(vectors, labels)
                    mean_distance = get_average_distance_per_cluster(vectors, labels)[0]

                    tsp, msp, msn = get_common_feature_stats(vectors, labels, vectorizer)

                    # If any cluster has 0 shared features, we just ignore the result
                    if msp <= tsp:
                        logging.debug("Not all clusters are informative")
                        continue
                    if len(set(labels)) > smallest_cluster_count:
                        move_to_next_method = True
                        break
                    if len(set(labels)) < smallest_cluster_count:
                        smallest_cluster_count = len(set(labels))

                    logging.debug(repr((
                            overall_score,
                            min(per_cluster_score.values()),
                            mean_distance,
                            labels,
                            len(set(labels)),
                            tsp,
                            msp,
                            msn,
                            "kmeans(n_clusters={0})".format(n_clusters)
                        )))
                    results.append(
                        (
                            overall_score,
                            min(per_cluster_score.values()),
                            mean_distance,
                            labels,
                            len(set(labels)),
                            tsp,
                            msp,
                            msn,
                            "kmeans(n_clusters={0})".format(n_clusters)
                        )
                    )
                if move_to_next_method:
                    continue

            if cluster_method == "agglomerative":
                logging.debug("Starting prospective Agglomerative clusterings")
                move_to_next_method = False
                for n_clusters in xrange(2, smallest_cluster_count):
                    logging.debug("Trying {0}".format("agglomerative(n_clusters={0})".format(n_clusters)))
                    labels = cluster_with_agglomerative(reduced_vectors, n_clusters=n_clusters, metric=metric)
                    overall_score, per_cluster_score = validate_clusters(vectors, labels)
                    mean_distance = get_average_distance_per_cluster(vectors, labels)[0]

                    tsp, msp, msn = get_common_feature_stats(vectors, labels, vectorizer)

                    # If any cluster has 0 shared features, we just ignore the result
                    if msp <= tsp:
                        logging.debug("Not all clusters are informative")
                        continue
                    if len(set(labels)) > smallest_cluster_count:
                        move_to_next_method = True
                        break
                    if len(set(labels)) < smallest_cluster_count:
                        smallest_cluster_count = len(set(labels))


                    logging.debug(repr((
                        overall_score,
                        min(per_cluster_score.values()),
                        mean_distance,
                        labels,
                        len(set(labels)),
                        tsp,
                        msp,
                        msn,
                        "agglomerative(n_clusters={0})".format(n_clusters)
                    )))
                    results.append(
                        (
                            overall_score,
                            min(per_cluster_score.values()),
                            mean_distance,
                            labels,
                            len(set(labels)),
                            tsp,
                            msp,
                            msn,
                            "agglomerative(n_clusters={0})".format(n_clusters)
                        )
                    )
                if move_to_next_method:
                    continue

            if cluster_method == "dbscan":
                logging.debug("Starting prospective DBSCAN clusterings")
                distance_matrix = precompute_distances(vectors, metric=metric)
                min_distance = sorted(set(list(distance_matrix.flatten())))[1]
                max_distance = sorted(set(list(distance_matrix.flatten())))[-1]
                num_steps = 25.0
                step_size = float(max_distance - min_distance) / float(num_steps)
                epsilon = min_distance
                while True:
                    logging.debug("Trying {0}".format("dbscan(epsilon={0})".format(epsilon)))
                    labels = cluster_with_dbscan(reduced_vectors, epsilon=epsilon, min_samples=1, distances=distance_matrix)
                    if len(set(labels)) == 1 and list(set(labels))[0] == 0:
                        break
                    overall_score, per_cluster_score = validate_clusters(vectors, labels)
                    mean_distance = get_average_distance_per_cluster(vectors, labels)[0]

                    tsp, msp, msn = get_common_feature_stats(vectors, labels, vectorizer)

                    # If any cluster has 0 shared features, we just ignore the result
                    if msp <= tsp:
                        logging.debug("Not all clusters are informative")
                        epsilon += step_size
                        continue

                    logging.debug(repr((
                        overall_score,
                        min(per_cluster_score.values()),
                        mean_distance,
                        labels,
                        len(set(labels)),
                        tsp,
                        msp,
                        msn,
                        "dbscan(epsilon={0})".format(epsilon)
                    )))
                    results.append(
                        (
                            overall_score,
                            min(per_cluster_score.values()),
                            mean_distance,
                            labels,
                            len(set(labels)),
                            tsp,
                            msp,
                            msn,
                            "dbscan(epsilon={0})".format(epsilon)
                        )
                    )
                    epsilon += step_size

        # Pick best result
        """
        We want to maximize the silhouette score while minimizing the number of labels
        """
        sorted_results = sort_items_by_multiple_keys(
            results,
            {
                #0: True,  # AVG Silhouette
                #1: True,  # Min Silhouette
                #2: False,  # Average distance
                4: False,  # Number of clusters
                #6: True,   # Min common features per cluster
            },
            {
                #0: 1,
                #1: 1,
                #2: 1,
                4: 1,
                #6: 1
            }
        )
        logging.debug(sorted_results)
        best_result = results[sorted_results[0][0]]
        logging.debug(best_result)

        best_method = best_result[-1]
        best_silhouette = best_result[0]
        best_labels = best_result[3]

        logging.info("Best clustering method: {0} (adjusted silhouette == {1})".format(best_method, best_silhouette))
        return best_labels

    else:
        # Unknown strategy
        raise NotImplementedError()


if __name__ == "__main__":
    # todo Parse arguments
    import argparse
    parser = argparse.ArgumentParser(description=u'Cluster NMap Output')

    parser.add_argument('path', metavar='path', type=str, nargs='+', default=None,
                        help="Paths to files or directories to scan")

    parser.add_argument('-s', '--strategy', default="automatic", choices=["manual", "automatic", "assisted", "viz"])
    parser.add_argument('-c', '--method', default="kmeans", choices=["kmeans", "dbscan", "agglomerative"])
    parser.add_argument('--metric', default="euclidean", choices=["euclidean", "cosine", "jaccard"])

    parser.add_argument('-n', '--n_clusters', type=int, default=2, help='Number of kmeans clusters to aim for')
    parser.add_argument('-e', '--epsilon', type=float, default=0.5, help='DBSCAN Epsilon')
    parser.add_argument('-m', '--min_samples', type=int, default=5, help='DBSCAN Minimum Samples')

    parser.add_argument('-p', '--plot', default=False, required=False, action='store_true',
                        help='Plot clusters on 2D plane')

    parser.add_argument("-v", "--verbosity", action="count", help="increase output verbosity")
    args = parser.parse_args()

    logging.basicConfig(format='%(asctime)s %(process)s %(module)s %(funcName)s %(levelname)-8s :%(message)s',
                        datefmt='%m-%d %H:%M')

    if args.verbosity == 1:
        logging.getLogger().setLevel(logging.INFO)
    elif args.verbosity > 1:
        logging.getLogger().setLevel(logging.DEBUG)

    # Vectorize our input
    logging.info("Vectorizing")
    vector_names, vectors, vectorizer = vectorize(args.path)
    logging.debug("Loaded {0} vectors with {1} features".format(len(vector_names), vectors.shape[1]))
    logging.info("Vectorizing complete")

    logging.info("Reducing vector dimensions with PCA")
    normalized_vectors = normalize(vectors)
    reduced_vectors = pca(vectors)

    # Cluster the vectors
    logging.info("Clustering")
    labels = cluster(vector_names, vectors, reduced_vectors, normalized_vectors, vectorizer, args.strategy, args.method, args.n_clusters, args.epsilon, args.min_samples, args.metric)
    logging.info("Clustering Complete")

    # Test cluster validity
    overall_score, per_cluster_score = validate_clusters(vectors, labels)

    # Analysis relevant to the person reading results
    universal_positive_features, universal_negative_features, shared_features = get_common_features_from_cluster(vectors, labels, vectorizer)

    # Reduce results and relevant information to per cluster data
    cluster_details = {}
    for cluster_id in per_cluster_score.keys():
        cluster_details[cluster_id] = {
            "silhouette": per_cluster_score[cluster_id],
            "shared_positive_features": shared_features[cluster_id]['positive'],
            #"shared_negative_features": shared_features[cluster_id]['negative'],
            "ips": [vector_names[x] for x in xrange(len(vector_names)) if labels[x] == cluster_id]
        }

    print_cluster_details(cluster_details, shared_features)
    if args.plot:
        create_plot(reduced_vectors, labels, vector_names)

    # Write DOT diagram out to cluster.dot, designed for input into Gephi (https://gephi.org/)
    with open("cluster.dot", "w") as f:
        f.write(generate_dot_graph_for_gephi(precompute_distances(vectors, metric=args.metric), vector_names, labels))

