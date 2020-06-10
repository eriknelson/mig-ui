// NATODO
import { takeLatest, select, race, take, call, put, delay } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import { CoreNamespacedResource, CoreNamespacedResourceKind } from '../../../client/resources';
import { IToken, IMigToken } from './types';

function fetchTokenSecrets(client: IClusterClient, migTokens): Array<Promise<any>> {
  const secretRefs: Array<Promise<any>> = [];

  migTokens.forEach((token) => {
    const secretRef = token.spec.secretRef;
    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret,
      secretRef.namespace
    );
    secretRefs.push(client.get(secretResource, secretRef.name));
  });

  return secretRefs;
}

function groupTokens(migTokens: IMigToken[], secretRefs: any[]): IToken[] {
  return migTokens.map((mt) => ({
    MigToken: mt,
    Secret: secretRefs.find(s => s.kind === 'Secret' && s.metadata.name === mt.spec.secretRef.name),
  }));
}

function* fetchTokensGenerator() {
  const state = yield select();
  const client: IClusterClient = ClientFactory.cluster(state);
  const resource = new MigResource(MigResourceKind.MigToken, state.migMeta.namespace);
  try {
    let tokenList = yield client.list(resource);
    tokenList = yield tokenList.data.items;
    const secretRefPromises = yield Promise.all(fetchTokenSecrets(client, tokenList));
    const secrets = secretRefPromises.map(s => s.data);
    const groupedTokens = groupTokens(tokenList, secrets);
    return { updatedTokens: groupedTokens };
  } catch (e) {
    throw e;
  }
}

export default {
  // NATODO: Implement and/or remove unecessary copies
  // watchRemoveClusterRequest,
  // watchAddClusterRequest,
  // watchUpdateClusterRequest,
  // watchClusterAddEditStatus,
  fetchTokensGenerator,
};
