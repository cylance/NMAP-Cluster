__author__ = "xzhao"

import numpy as np
from scipy.spatial.distance import cdist

class Cluster:
    def __init__(self, data, index, distance_matrix = None):
        self.data = np.matrix(data)
        self.index = np.array(index)
        if distance_matrix is not None:
            self.distance_matrix = distance_matrix
        else:
            self.cal_distance_matrix()
        self.fixed = False

    def set_distance_matrix(self, X):
        self.distance_matrix = X

    def get_distance_matrix(self):
        return self.distance_matrix

    def cal_distance_matrix(self):
        self.distance_matrix = cdist(self.data, self.data,'euclidean')

    def query_for_split_decision(self, inds1, inds2):
        response = raw_input("should sample %d and sample %d be in one cluster? (Y/N)"%(inds1, inds2))
        if response.upper() == "Y" or response.upper() == "YES":
            return False   # If users think the two should be in one cluster, we don't split, so return False
        if response.upper() == "N" or response.upper() == "NO":
            return True    # vice versa

    def divide_decision(self, min_pts = 2):
        if len(self.data) <= min_pts:
            return False
        indx = np.argmax(sum(self.distance_matrix)) # find the sample i whose sum of the distance to the other samples is the largest
                                                    # i.e. i = max_i(sum_j(D_ij))
        if self.query_for_split_decision( self.index[np.argmax(self.distance_matrix[indx])], self.index[indx] ):
            # decision is based on the point which is found in last step and the point which is furthest to that point
            return True
        self.fixed = True
        return False

    def furthest_points(self):
        indx = np.argmax(sum(self.distance_matrix)) # find the sample i whose sum of the distance to the other samples is the largest
                                                    # i.e. i = max_i(sum_j(D_ij))
        return [self.index[np.argmax(self.distance_matrix[indx])], self.index[indx]]

    def d_point_set(self, Ids, S):
        if Ids in S:
            length = len(S) - 1
        else:
            length = len(S)
        if length == 0:
            return 0
        return np.sum(self.distance_matrix[Ids, list(S)]) #/length

    def _divide(self):
        A = set(range(self.data.shape[0]))
        B = set()
        IdsA = list(A)
        IdsB = list(B)
        Ids = np.argmax(sum(self.distance_matrix))
        while self.d_point_set(Ids, A) > self.d_point_set(Ids, B) and len(A) > 1:
            A.remove(IdsA[Ids])
            B.add(IdsA[Ids])
            IdsA = list(A)
            IdsB = list(B)
            Ids = np.argmax(np.sum(self.distance_matrix[IdsA][:, IdsA], axis = 1)/(len(A)-1)
                            - np.sum(self.distance_matrix[IdsA][:, IdsB], axis = 1)/len(B))
        return [ Cluster(self.data[IdsA], self.index[IdsA], distance_matrix = self.distance_matrix[IdsA][:, IdsA]),
                 Cluster(self.data[IdsB], self.index[IdsB], distance_matrix = self.distance_matrix[IdsB][:, IdsB]) ]

    def divide(self):
        return self._divide()