from sklearn.decomposition import PCA


def pca(vectors, dimensions=2):
    pca = PCA(n_components=dimensions)
    return pca.fit_transform(vectors)
