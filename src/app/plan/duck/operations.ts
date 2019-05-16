import { Creators as AlertCreators } from '../../common/duck/actions';
import { Creators } from './actions';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import {
  CoreClusterResource,
  CoreClusterResourceKind,
  CoreNamespacedResource,
  CoreNamespacedResourceKind,
} from '../../../client/resources';

import {
  createMigPlan,
  createMigMigration,
} from '../../../client/resources/conversions';
const uuidv1 = require('uuid/v1');
const migPlanFetchRequest = Creators.migPlanFetchRequest;
const migPlanFetchSuccess = Creators.migPlanFetchSuccess;
const migrationSuccess = Creators.migrationSuccess;
const addPlanSuccess = Creators.addPlanSuccess;
const addPlanFailure = Creators.addPlanFailure;
const removePlanSuccess = Creators.removePlanSuccess;
const removePlanFailure = Creators.removePlanFailure;
const sourceClusterNamespacesFetchSuccess = Creators.sourceClusterNamespacesFetchSuccess;

const runStage = plan => {
  return (dispatch, getState) => {
    dispatch(Creators.initStage(plan.planName));
    const planNameToStage = plan.planName;
    const interval = setInterval(() => {
      const planList = getState().plan.migPlanList;

      const planItem = planList.find(p => p.planName === planNameToStage);
      if (planItem.status.progress === 100) {
        dispatch(Creators.stagingSuccess(planItem.planName));
        clearInterval(interval);
        return;
      }

      const nextProgress = plan.status.progress + 10;
      dispatch(Creators.updatePlanProgress(plan.planName, nextProgress));
    }, 1000);
  };
};

const runMigration = plan => {
  return async (dispatch, getState) => {
    try {
      dispatch(Creators.initMigration(plan.MigPlan.metadata.name));
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());

      const migMigrationObj = createMigMigration(
        uuidv1(),
        plan.MigPlan.metadata.name,
        migMeta.namespace
      );
      const migMigrationResource = new MigResource(
        MigResourceKind.MigMigration,
        migMeta.namespace,
      );


      const arr = await Promise.all([
        // client.create(secretResource, tokenSecret),
        client.create(migMigrationResource, migMigrationObj),
      ]);
      const migration = arr.reduce((accum, res) => {
        accum[res.data.kind] = res.data;
        return accum;
      }, {});
      dispatch(migrationSuccess(migration.MigMigration.spec.migPlanRef.name));

      // const planNameToStage = plan.planName;
      // const interval = setInterval(() => {
      //   const planList = getState().plan.migPlanList;

      //   const planItem = planList.find(p => p.planName === planNameToStage);
      //   if (planItem.status.progress === 100) {
      //     dispatch(Creators.migrationSuccess(planItem.planName));
      //     clearInterval(interval);
      //     return;
      //   }

      //   const nextProgress = plan.status.progress + 20;
      //   dispatch(Creators.updatePlanProgress(plan.planName, nextProgress));
      // }, 1000);
    } catch (err) {
      dispatch(AlertCreators.alertError(err));
    }
  };
}


const addPlan = migPlan => {
  return async (dispatch, getState) => {
    try {
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());

      const migPlanObj = createMigPlan(
        migPlan.planName,
        migMeta.namespace,
        migPlan.sourceCluster,
        migPlan.targetCluster,
        migPlan.selectedStorage,
        'temp asset name',
      );


      // const assetCollectionObj = createAssetCollectionObj(
      //   clusterValues.name,
      //   migMeta.namespace,
      //   clusterValues.url,
      // );
      const secretResource = new CoreNamespacedResource(
        CoreNamespacedResourceKind.Secret,
        migMeta.configNamespace,
      );

      const migPlanResource = new MigResource(
        MigResourceKind.MigPlan,
        migMeta.namespace,
      );

      const arr = await Promise.all([
        // client.create(secretResource, tokenSecret),
        client.create(migPlanResource, migPlanObj),
      ]);

      const plan = arr.reduce((accum, res) => {
        accum[res.data.kind] = res.data;
        return accum;
      }, {});
      // storage.status = storageValues.connectionStatus;
      dispatch(addPlanSuccess(plan));
    } catch (err) {
      dispatch(AlertCreators.alertError(err));
    }
  };
};

const removePlan = id => {
  throw new Error('NOT IMPLEMENTED');
  // return dispatch => {
  //   removeStorageRequest(id).then(
  //     response => {
  //       dispatch(removeStorageSuccess(id));
  //       dispatch(fetchStorage());
  //     },
  //     error => {
  //       dispatch(removeStorageFailure(error));
  //     },
  //   );
  // };
};

const fetchPlans = () => {
  return async (dispatch, getState) => {
    dispatch(migPlanFetchRequest());
    try {
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());
      const resource = new MigResource(
        MigResourceKind.MigPlan,
        migMeta.namespace,
      );
      const res = await client.list(resource);
      //temporary for ui work
      const migPlans = res.data.items;
      const refs = await Promise.all(
        fetchMigPlanRefs(client, migMeta, migPlans),
      );
      const groupedPlans = groupPlans(migPlans, refs);
      dispatch(migPlanFetchSuccess(groupedPlans));
    } catch (err) {
      dispatch(AlertCreators.alertError(err));
    }
  };
};
function fetchMigPlanRefs(
  client: IClusterClient,
  migMeta,
  migPlans,
): Array<Promise<any>> {
  const refs: Array<Promise<any>> = [];

  migPlans.forEach(plan => {
    // const secretRef = plan.spec.backupStorageConfig.credsSecretRef;
    // const secretResource = new CoreNamespacedResource(
    //   CoreNamespacedResourceKind.Secret,
    //   secretRef.namespace,
    // );
    // refs.push(client.get(secretResource, secretRef.name));
  });

  return refs;
}

function groupPlans(migPlans: any[], refs: any[]): any[] {
  const newPlanState = {
    migrations: [],
    persistentVolumes: [],
    status: {
      state: 'Not Started',
      progress: 0,
    },
  };

  return migPlans.map(mp => {
    const fullPlan = {
      MigPlan: mp,
      planState: newPlanState,
    };
    // fullStorage['Secret'] = refs.find(i =>
    //   i.data.kind === 'Secret' && i.data.metadata.name === ms.metadata.name,
    // ).data;


    return fullPlan;
  });
}

const fetchNamespacesForCluster = (clusterName) => {
  return (dispatch, getState) => {
    const client: IClusterClient = ClientFactory.forCluster(clusterName, getState());
    const nsResource = new CoreClusterResource(CoreClusterResourceKind.Namespace);
    console.log('trying to list namespaces')
    client.list(nsResource).then(res => {
      console.log('got list of namespaces: ', res.data.items)
      dispatch(sourceClusterNamespacesFetchSuccess(res.data.items));
    }).catch(err => AlertCreators.alertError('Failed to load namespaces for cluster'));
  };
};

export default {
  fetchPlans,
  addPlan,
  removePlan,
  fetchNamespacesForCluster,
  runStage,
  runMigration,
};
