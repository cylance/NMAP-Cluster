The purpose of this project is to assist anyone trying to port scan a large number of computers in their analysis of the results.

For instance, someone auditing the security of a network may wish to scan a /16 network (65k IPs), and with 65k results coming back, one can hardly inspect them to get a general feel of what types of systems are on the network.

The most popular port scanning utility, NMap, allows for XML output of scan data. We parse this XML output, which can contain information for a single IP or many IPs, create incremental strings for each result, and tokenize these strings to features (one string per feature).

Due to the less direct nature of clustering, and the undoubtful misperception from the users that the clustering algorithm has any idea what similar means to the user, the difficult task with this project is giving the security minded individual with limited to no machine learning training, the power to cluster these items.


Current clustering strategies:

Manual:
This method allows the user to input their own hyper parameters for KMeans or DBSCAN, and really only makes sense for the advanced user, or for testing.

Automatic:
The idea of this method is to provide a meaningful result without ever asking the user for any additional information. We have to assume that this method will not always give the user what they want. Various strategies are being tested to produce the best results here, but ultimately, I imagine a feedback based model will be needed to tune the engine that chooses the best clustering results (silhouette has not been effective).

Assisted:
The idea of this method is to provide the user with questions, and based on these questions (simple yes/no/unknown) we provide them with the clustered results. I feel this method is the most useful, but it has not been developed yet.
A sample question would be "Should IP A and IP B be in the same cluster?", and provide some information about the IP addresses. The answers to these will act as the ground truth to determine the best way to cluster the samples.


The current method for displaying results to the user is by giving them a list of IPs in each cluster, then showing the shared features (the string representation of these features in a redundancy reduced form) for each cluster. It is likely that better methods to display the results will be needed.