from sklearn.metrics import silhouette_samples, silhouette_score
from scipy.spatial.distance import pdist
import numpy as np

def validate_clusters(vectors, labels, ignore_single_point_clusters=False):
    """

    :param vectors:
    :param labels:
    :return: (adjusted silhouette score average (removing single point clusters) and all label silhouette scores)
    """
    overall_sum = 0
    overall_count = 0
    has_single_point_clusters = 0
    per_sample = silhouette_samples(vectors, labels)
    per_cluster = {}
    for cluster_id in set(labels):
        total = 0
        count = 0
        for sample_index in xrange(per_sample.shape[0]):
            if labels[sample_index] == cluster_id:
                total += per_sample[sample_index]
                count += 1
        per_cluster[cluster_id] = float(total) / float(count)
        if count > 1 or not ignore_single_point_clusters:
            overall_sum += float(total) / float(count)
            overall_count += 1
    return float(overall_sum) / float(overall_count), per_cluster


def get_average_distance_per_cluster(vectors, labels):
    overall_sum = 0
    overall_count = 0
    per_cluster = {}
    for cluster_id in set(labels):
        total = 0
        count = 0
        c_vecs = []

        for sample_index in xrange(vectors.shape[0]):
            if labels[sample_index] == cluster_id:
                c_vecs.append(vectors[sample_index, :])

        c_vecs = np.vstack(c_vecs)
        c_distances = pdist(c_vecs)
        if c_distances.shape[0] > 0:
            mean_distances = c_distances.mean()
        else:
            mean_distances = 0
        overall_sum += c_distances.sum()
        overall_count += c_vecs.shape[0]

        per_cluster[cluster_id] = mean_distances

    return float(overall_sum) / float(overall_count), per_cluster