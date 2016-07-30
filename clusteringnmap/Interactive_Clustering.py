__author__ = "xzhao"

from Divisive_Cluster import Cluster
import numpy as np
from scipy.spatial.distance import cdist


class interactive_Clustering:
    def __init__(self):
        self.clusters = set()

    def fit(self, vectors):
        non_fixed_clusters = set()
        fixed_clusters = set()
        vectors = np.matrix(vectors)
        non_fixed_clusters.add(Cluster(vectors, range(vectors.shape[0])))
        while len(non_fixed_clusters) > 0:
            tmp_copy_non_fixed_clusters = non_fixed_clusters.copy()
            for cluster in tmp_copy_non_fixed_clusters:
                if cluster.divide_decision():
                    [cluster1, cluster2] = cluster.divide()
                    non_fixed_clusters.remove(cluster)
                    non_fixed_clusters.update([cluster1, cluster2])
                else:
                    non_fixed_clusters.remove(cluster)
                    fixed_clusters.add(cluster)
        self.clusters = fixed_clusters

    def fit_predict(self, vectors):
        vectors = np.matrix(vectors)
        self.fit(vectors)
        result = np.zeros(vectors.shape[0])
        clusterID = 0
        for cluster in self.clusters:
            result[cluster.index] = clusterID
            clusterID += 1
        return result












