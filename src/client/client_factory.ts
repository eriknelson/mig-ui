import { ClusterClient } from './client';

export class ClientFactoryUnknownClusterError extends Error {
  constructor(clusterName: string) {
    super(`Unknown cluster requested: ${clusterName}`);
    Object.setPrototypeOf(this, ClientFactoryUnknownClusterError.prototype);
  }
}

export class ClientFactoryMissingUserError extends Error {
  constructor() {
    super('Current user missing from state tree');
    Object.setPrototypeOf(this, ClientFactoryMissingUserError.prototype);
  }
}

export class ClientFactoryMissingApiRoot extends Error {
  constructor() {
    super('apiRoot missing from migMeta');
    Object.setPrototypeOf(this, ClientFactoryMissingUserError.prototype);
  }
}

export const ClientFactory = {
  hostCluster: (state: any) => {
    if (!state.auth.user) {
      throw new ClientFactoryMissingUserError();
    }
    if (!state.migMeta.clusterApi) {
      throw new ClientFactoryMissingApiRoot();
    }

    return new ClusterClient(state.migMeta.clusterApi, state.auth.user.access_token);
  },
  forCluster: (clusterName: string, state: any) => {
    const { clusterApi, accessToken } = getAuthForCluster(clusterName, state);
    console.log('Got cluster api: ', clusterApi)
    console.log('Got accessToken:', accessToken)
    return new ClusterClient(clusterApi, accessToken);
  },
};

interface IAuthDetails {
  clusterApi: string;
  accessToken: string;
}

function getAuthForCluster(clusterName: string, state: any): IAuthDetails {
  console.log('getAuthForCluster, clusterList: ', state.cluster.clusterList)
  const cluster = state.cluster.clusterList
    .find(c => c.MigCluster.metadata.name === clusterName);
  console.log('found cluster: ', cluster)
  if (!cluster) {
    throw new ClientFactoryUnknownClusterError(clusterName);
  }
  const clusterApi =
    cluster.Cluster.spec.kubernetesApiEndpoints.serverEndpoints[0].serverAddress;
  const accessToken = atob(cluster.Secret.data.saToken);

  return { clusterApi, accessToken };
}
