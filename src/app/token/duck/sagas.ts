// NATODO
import { takeLatest, select, race, take, call, put, delay } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import { CoreNamespacedResource, CoreNamespacedResourceKind } from '../../../client/resources';
import { IToken, IMigToken, ITokenFormValues, TokenType } from './types';
import { TokenActionTypes } from './actions';
import { createMigTokenSecret } from '../../../client/resources/conversions';

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

function* addTokenRequest(action) {
  const state = yield select();
  const { migMeta } = state;
  const tokenValues: ITokenFormValues = action.tokenValues;
  console.log('tokenValues: ', tokenValues);
  const client: IClusterClient = ClientFactory.cluster(state);

  let migTokenSecretData: string;
  switch(tokenValues.tokenType) {
    case TokenType.OAuth: {
      // NATODO: Get OAuth token from values and set the migTokenSecretData to that
      // should be coming out of localstorage, but let the event handler in the front-end
      // handle that and set the appropriate form value
      console.error("NOT IMPLEMENTED: Add OAuth TokenType")
      break;
    }
    case TokenType.ServiceAccount: {
      migTokenSecretData = tokenValues.serviceAccountToken;
      break;
    }
    default: {
      // NATODO: Rare edge case with unrecognized token type?
      console.error(`addTokenRequest: Unknown TokenType: [${tokenValues.tokenType}]`);
      break;
    }
  }

  const secretResource = new CoreNamespacedResource(
    CoreNamespacedResourceKind.Secret,
    migMeta.configNamespace
  );
  const migTokenResource = new MigResource(MigResourceKind.MigToken, migMeta.namespace);

  const migTokenSecret = createMigTokenSecret(
    tokenValues.name, migMeta.configNamespace, migTokenSecretData);

  try {
    const migTokenLookup = yield client.get(migTokenResource, tokenValues.name);
    // This should never happen -- we're using generateName which should ensure
    // that the secret's name that's created is unique, but just in case...
    if(migTokenLookup.status === 200) {
      throw new Error(`MigToken "${tokenValues.name} already exists`)
    }
  } catch (err) {
    //  If response is anything but a 404 response (the normal path), rethrow
    if(!err.response || err.response.status !== 404) {
      throw err;
    }
    // NATODO: Implement add edit status with token
    // yield put(
    //   TokenActionTypes.setClusterAddEditStatus(
    //     createAddEditStatusWithMeta(AddEditState.Critical, AddEditMode.Add, err.message, '')
    //   )
    // );
  }

  // None of the objects already exist, so try to create all of the objects
  // If any of the objects actually fail creation, we need to rollback the others
  // so the clusters are created, or fail atomically
  try {
    const migTokenSecretResult = yield client.create(secretResource, migTokenSecret);
    console.log('migTokenSecretResult: ', migTokenSecretResult);
  } catch (err) {
    console.error(err);
    //NATODO: Handle error
  }

  // try {
  //   const clusterAddResults = [];
  //   const tokenSecretAddResult = yield client.create(secretResource, tokenSecret);

  //   if (tokenSecretAddResult.status === 201) {
  //     clusterAddResults.push(tokenSecretAddResult);

  //     Object.assign(migCluster.spec.serviceAccountSecretRef, {
  //       name: tokenSecretAddResult.data.metadata.name,
  //       namespace: tokenSecretAddResult.data.metadata.namespace,
  //     });

  //     const clusterAddResult = yield client.create(migClusterResource, migCluster);

  //     if (clusterAddResult.status === 201) {
  //       clusterAddResults.push(clusterAddResult);
  //     }
  //   }

  //   // If any of the attempted object creation promises have failed, we need to
  //   // rollback those that succeeded so we don't have a halfway created "Cluster"
  //   // A rollback is only required if some objects have actually *succeeded*,
  //   // as well as failed.
  //   const isRollbackRequired =
  //     clusterAddResults.find((res) => res.status === 201) &&
  //     clusterAddResults.find((res) => res.status !== 201);

  //   if (isRollbackRequired) {
  //     const kindToResourceMap = {
  //       MigCluster: migClusterResource,
  //       Secret: secretResource,
  //     };

  //     // The objects that need to be rolled back are those that were fulfilled
  //     const rollbackObjs = clusterAddResults.reduce((rollbackAccum, res) => {
  //       return res.status === 201
  //         ? [...rollbackAccum, { kind: res.data.kind, name: res.data.metadata.name }]
  //         : rollbackAccum;
  //     }, []);

  //     const rollbackResults = yield Q.allSettled(
  //       rollbackObjs.map((r) => {
  //         return client.delete(kindToResourceMap[r.kind], r.name);
  //       })
  //     );

  //     // Something went wrong with rollback, not much we can do at this point
  //     // except inform the user about what's gone wrong so they can take manual action
  //     if (rollbackResults.find((res) => res.state === 'rejected')) {
  //       throw new Error(
  //         rollbackResults.reduce((msg, r) => {
  //           const kind = r.reason.request.response.kind;
  //           const name = r.reason.request.response.details.name;
  //           return msg + `- kind: ${kind}, name: ${name}`;
  //         }, 'Attempted to rollback objects, but failed ')
  //       );
  //     } else {
  //       // One of the objects failed, but rollback was successful. Need to alert
  //       // the user that something went wrong, but we were able to recover with
  //       // a rollback
  //       throw Error(clusterAddResults.find((res) => res.state === 'rejected').reason);
  //     }
  //   } // End rollback handling

  //   const cluster = clusterAddResults.reduce((accum, res) => {
  //     const data = res.data;
  //     accum[data.kind] = data;
  //     return accum;
  //   }, {});

  //   yield put(ClusterActions.addClusterSuccess(cluster));

  //   // Push into watching state
  //   yield put(
  //     ClusterActions.setClusterAddEditStatus(
  //       createAddEditStatus(AddEditState.Watching, AddEditMode.Edit)
  //     )
  //   );
  //   yield put(ClusterActions.watchClusterAddEditStatus(clusterValues.name));
  // } catch (err) {
  //   console.error('Cluster failed creation with error: ', err);
  //   put(AlertActions.alertErrorTimeout('Cluster failed creation'));
  //   return;
  // }
}

function* watchAddTokenRequest() {
  yield takeLatest(TokenActionTypes.ADD_TOKEN_REQUEST, addTokenRequest);
}

export default {
  // NATODO: Implement and/or remove unecessary copies
  // watchRemoveClusterRequest,
  watchAddTokenRequest,
  // watchUpdateClusterRequest,
  // watchClusterAddEditStatus,
  fetchTokensGenerator,
};
