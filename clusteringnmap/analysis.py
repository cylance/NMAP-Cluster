import numpy as np
from json import loads as jloads


def get_common_features_from_cluster(vectors, labels, vectorizer):
    all_shared_positive = vectors.sum(0) == vectors.shape[0]
    all_shared_negative = vectors.sum(0) == 0

    all_shared_positive_str = []
    all_shared_negative_str = []
    for x in xrange(all_shared_positive.shape[0]):
        if all_shared_positive[x]:
            all_shared_positive_str.append(vectorizer.tokenized_strings[x])
        if all_shared_negative[x]:
            all_shared_negative_str.append(vectorizer.tokenized_strings[x])

    shared_str = {}
    for label in set(labels):
        shared_str[label] = {"positive": [], "negative": []}
        vectors_set = []
        for label_index in xrange(labels.shape[0]):
            if labels[label_index] == label:
                vectors_set.append(vectors[label_index, :])

        vectors_set = np.vstack(vectors_set)
        shared_positive = vectors_set.sum(0) == vectors_set.shape[0]
        shared_negative = vectors_set.sum(0) == 0

        for x in xrange(shared_positive.shape[0]):
            if shared_positive[x]:
                shared_str[label]['positive'].append(vectorizer.tokenized_strings[x])
            if shared_negative[x]:
                shared_str[label]['negative'].append(vectorizer.tokenized_strings[x])

    return all_shared_positive_str, all_shared_negative_str, shared_str


def get_common_feature_stats(vectors, labels, vectorizer):
    asp, asn, ss = get_common_features_from_cluster(vectors, labels, vectorizer)

    total_shared_positive = len(asp)
    shared_pos = []
    shared_neg = []
    for cluster_id in ss.keys():
        shared_pos.append(len(ss[cluster_id]['positive']))
        shared_neg.append(len(ss[cluster_id]['negative']))

    min_shared_pos = min(shared_pos)
    min_shared_neg = min(shared_neg)
    return total_shared_positive, min_shared_pos, min_shared_neg


def reduce_shared_features(shared_features):
    to_keep = []
    feature_lists = []

    for feature in shared_features:
        feature_lists.append([i.encode("unicode-escape") for i in jloads(feature)])

    for f_i in xrange(len(feature_lists)):
        keep = True
        for o_i in xrange(len(feature_lists)):
            if f_i == o_i:
                continue
            if len(feature_lists[f_i]) < len(feature_lists[o_i]):
                if feature_lists[f_i] == feature_lists[o_i][:len(feature_lists[f_i])]:
                    keep = False
        if keep:
            to_keep.append(feature_lists[f_i])

    return to_keep