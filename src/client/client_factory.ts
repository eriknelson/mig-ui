import ClusterClient from './client';

export class ClientFactoryUnknownClusterError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, ClientFactoryUnknownClusterError.prototype);
  }
}

export class ClientFactoryMissingUserError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, ClientFactoryMissingUserError.prototype);
  }
}

export class ClientFactoryMissingApiRoot extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, ClientFactoryMissingUserError.prototype);
  }
}

export class ClientFactory {
  private getState: () => any;

  constructor(getState: () => any) {
    this.getState = getState;
  }

  public hostCluster() {
    const state = this.getState();
    if(!!state.auth.user) {
      throw new ClientFactoryMissingUserError();
    }

    return new ClusterClient(state.migMeta.clusterApi, state.auth.user.token);
  }

  public forCluster(clusterName: string) {
    const state = this.getState();
    const clusters = state.kube.clusterregistry_k8s_io.clusters;
    const clusterNotFound = !(clusterName in clusters);
    if(clusterNotFound) {
      throw new ClientFactoryUnknownClusterError();
    }
    const cluster = clusters[clusterName];
    // TODO: Need to get some more information from the cluster registry about:
    // 1) Exactly where should this baseURL be retrieved from the cluster registry object?
    // Just guessing this path based on the published CRD...
    // Any reason to prefer an endpoint, since it's a list?
    // Will need an error if none of them exist?
    // See: https://github.com/kubernetes/cluster-registry/blob/master/cluster-registry-crd.yaml

    // const apiRoot = cluster.spec.kubernetesApiEndpoints.serverEndpoints[0].serverAddress;

    // TODO: Where in the state tree is the token available? It's not going to
    // be on the cluster, so it's going to require an additional call to the secret endpoint
    // to get the actual secret contents.

    // const token = state.kube.core.secrets.relevant_cluster.token;
    // return new ClusterClient(apiRoot, cluster.token);
    throw new Error('forCluster NOT IMPLEMENTED');
  }
}
