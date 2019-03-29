import newClient from './client';
import uuidv4 from 'uuid/v4';
import migResources from './mig'

const hostClusterApi = 'https://api.host.example.com:6443';
const fooCluster = {
  name: 'foo',
  clusterApi: 'https://api.foo.example.com:6443',
  token: uuidv4(),
};
const barCluster = {
  name: 'foo',
  clusterApi: 'https://api.bar.example.com:6443',
  token: uuidv4(),
};
const userToken = uuidv4();

const state = {
  auth: {
    user: {
      token: userToken,
    }
  },
  mig: {
    clusters: [{
      name: 'foo-cluster',
      clusterApi: fooClusterApi,
      token: fooClusterToken
    }]
  },
  migMeta: {
    clusterApi: hostClusterApi,
  }
};

test(() => {
  const client = newClient(state.migMeta.clusterApi, () => state);
  client.migplans().then(plans => consoekl)
})
