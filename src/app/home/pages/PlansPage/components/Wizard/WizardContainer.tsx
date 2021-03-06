import React from 'react';
import WizardComponent from './WizardComponent';
import { PlanActions } from '../../../../../plan/duck/actions';
import planSelectors from '../../../../../plan/duck/selectors';
import { connect } from 'react-redux';
import { ICurrentPlanStatus } from '../../../../../plan/duck/reducers';
import {
  defaultAddEditStatus,
  createAddEditStatus,
  AddEditState,
  AddEditMode,
  IAddEditStatus,
} from '../../../../../common/add_edit_state';
import { ICluster } from '../../../../../cluster/duck/types';
import {
  PvCopyMethod,
  IPlanPersistentVolume,
  IMigPlan,
  IPersistentVolumeResource,
  ISourceClusterNamespace,
  IPlan,
} from '../../../../../plan/duck/types';
import { IStorage } from '../../../../../storage/duck/types';
import { IReduxState } from '../../../../../../reducers';
import { IToken } from '../../../../../token/duck/types';
import { INameNamespaceRef } from '../../../../../common/duck/types';
import WizardFormik from './WizardFormik';
import { IHook } from '../../../../../../client/resources/conversions';
import { IMigHook } from '../../../HooksPage/types';

export interface IFormValues {
  planName: string;
  sourceCluster: string;
  sourceTokenRef: INameNamespaceRef;
  targetCluster: string;
  targetTokenRef: INameNamespaceRef;
  selectedStorage: string;
  selectedNamespaces: string[];
  persistentVolumes: any[]; // TODO replace this with selections-only version after https://github.com/konveyor/mig-ui/issues/797
  pvStorageClassAssignment: {
    [pvName: string]: {
      name: string;
      provisioner: string;
    };
  };
  pvVerifyFlagAssignment: {
    [pvName: string]: boolean;
  };
  pvCopyMethodAssignment: {
    [pvName: string]: PvCopyMethod;
  };
  indirectImageMigration?: boolean;
  indirectVolumeMigration?: boolean;
}

export interface IOtherProps {
  clusterList: ICluster[];
  planList: IPlan[];
  storageList: IStorage[];
  tokenList: IToken[];
  isFetchingPVList: boolean;
  isPVPolling: boolean;
  isPollingStatus: boolean;
  isPVError: boolean;
  isCheckingPlanStatus: boolean;
  isFetchingPVResources: boolean;
  isFetchingNamespaceList: boolean;
  isOpen: boolean;
  isPollingStorage: boolean;
  isPollingClusters: boolean;
  isPollingPlans: boolean;
  currentPlan: IMigPlan;
  currentPlanStatus: ICurrentPlanStatus;
  startPlanStatusPolling: (planName) => void;
  stopPlanStatusPolling: (planName) => void;
  pvUpdatePollStop: () => void;
  validatePlanRequest: (values) => void;
  pvDiscoveryRequest: (values) => void;
  resetCurrentPlan: () => void;
  setCurrentPlan: (plan) => void;
  fetchNamespacesRequest: (clusterName) => void;
  getPVResourcesRequest: (
    persistentVolumes: IPlanPersistentVolume[],
    sourceClusterName: IFormValues['sourceCluster']
  ) => void;
  fetchPlanHooksRequest: () => void;
  addPlanRequest: (migPlan) => void;
  addAnalyticRequest: (planName: string) => void;
  sourceClusterNamespaces: ISourceClusterNamespace[];
  pvResourceList: IPersistentVolumeResource[];
  onHandleWizardModalClose: () => void;
  editPlanObj?: IMigPlan;
  isEdit: boolean;
  updateCurrentPlanStatus: (currentPlanStatus: ICurrentPlanStatus) => void;
  addHookRequest: (migHook: IHook) => void;
  updateHookRequest: (migHook: IHook) => void;
  removeHookFromPlanRequest: (hookName, migrationStep) => void;
  associateHookToPlan: (hookvalues, migHook) => void;
  currentPlanHooks: IHook[];
  allHooks: IMigHook[];
  isFetchingHookList: boolean;
  isUpdatingGlobalHookList: boolean;
  isAssociatingHookToPlan: boolean;
  watchHookAddEditStatus: () => void;
  hookAddEditStatus: IAddEditStatus;
  cancelAddEditWatch: () => void;
  resetAddEditState: () => void;
  validatePlanPollStop: () => void;
}

export const defaultInitialValues: IFormValues = {
  planName: '',
  sourceCluster: null,
  sourceTokenRef: null,
  targetCluster: null,
  targetTokenRef: null,
  selectedNamespaces: [],
  selectedStorage: null,
  persistentVolumes: [],
  pvStorageClassAssignment: {},
  pvVerifyFlagAssignment: {},
  pvCopyMethodAssignment: {},
};

const WizardContainer: React.FunctionComponent<IOtherProps> = (props: IOtherProps) => {
  const { editPlanObj, isEdit, planList } = props;
  const initialValues = { ...defaultInitialValues };
  if (editPlanObj && isEdit) {
    initialValues.planName = editPlanObj.metadata.name || '';
    initialValues.sourceCluster = editPlanObj.spec.srcMigClusterRef.name || null;
    initialValues.targetCluster = editPlanObj.spec.destMigClusterRef.name || null;
    initialValues.selectedNamespaces = editPlanObj.spec.namespaces || [];
    initialValues.selectedStorage = editPlanObj.spec.migStorageRef.name || null;
    initialValues.targetTokenRef = editPlanObj.spec.destMigTokenRef || null;
    initialValues.sourceTokenRef = editPlanObj.spec.srcMigTokenRef || null;
    // Only set initial plan values for DIM/DVM if property exists on the plan spec.
    // If the value doesn't exist on the spec, this means it was set to false & has disappeared from the spec.
    if (editPlanObj.spec.hasOwnProperty('indirectImageMigration')) {
      initialValues.indirectImageMigration = editPlanObj.spec.indirectImageMigration;
    }
    if (editPlanObj.spec.hasOwnProperty('indirectVolumeMigration')) {
      initialValues.indirectVolumeMigration = editPlanObj.spec.indirectVolumeMigration;
    }

    // TODO need to look into this closer, but it was resetting form values after pv discovery is run & messing with the UI state
    // See https://github.com/konveyor/mig-ui/issues/797
    // initialValues.persistentVolumes = editPlanObj.spec.persistentVolumes || [];
  }
  return (
    <WizardFormik initialValues={initialValues} isEdit={isEdit} planList={planList}>
      <WizardComponent {...props} />
    </WizardFormik>
  );
};

const mapStateToProps = (state: IReduxState) => {
  return {
    planName: '',
    sourceCluster: null,
    targetCluster: null,
    selectedNamespaces: [],
    selectedStorage: '',
    persistentVolumes: [],
    isPVPolling: state.plan.isPVPolling,
    isPollingPlans: state.plan.isPolling,
    isPollingClusters: state.cluster.isPolling,
    isPollingStorage: state.storage.isPolling,
    isPollingStatus: state.plan.isPollingStatus,
    isFetchingNamespaceList: state.plan.isFetchingNamespaceList,
    sourceClusterNamespaces: planSelectors.getFilteredNamespaces(state),
    isFetchingPVResources: state.plan.isFetchingPVResources,
    isPVError: state.plan.isPVError,
    currentPlan: planSelectors.getCurrentPlanWithStatus(state),
    currentPlanStatus: state.plan.currentPlanStatus,
    pvResourceList: state.plan.pvResourceList,
    allHooks: planSelectors.getHooksWithStatus(state),
    currentPlanHooks: state.plan.currentPlanHooks,
    isFetchingHookList: state.plan.isFetchingHookList,
    isUpdatingGlobalHookList: state.plan.isUpdatingGlobalHookList,
    isAssociatingHookToPlan: state.plan.isAssociatingHookToPlan,
    hookAddEditStatus: state.plan.hookAddEditStatus,
    tokenList: state.token.tokenList, // NATODO do we also need to bring in fetch/polling stuff for tokens to the wizard?
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    addPlanRequest: (migPlan) => dispatch(PlanActions.addPlanRequest(migPlan)),
    addAnalyticRequest: (planName) => dispatch(PlanActions.addAnalyticRequest(planName)),
    fetchNamespacesRequest: (clusterName) =>
      dispatch(PlanActions.namespaceFetchRequest(clusterName)),
    getPVResourcesRequest: (pvList, clusterName) =>
      dispatch(PlanActions.getPVResourcesRequest(pvList, clusterName)),
    startPlanStatusPolling: (planName: string) =>
      dispatch(PlanActions.startPlanStatusPolling(planName)),
    stopPlanStatusPolling: (planName: string) =>
      dispatch(PlanActions.stopPlanStatusPolling(planName)),
    addHookRequest: (migHook) => dispatch(PlanActions.addHookRequest(migHook)),
    fetchPlanHooksRequest: () => dispatch(PlanActions.fetchPlanHooksRequest()),
    validatePlanRequest: (values) => dispatch(PlanActions.validatePlanRequest(values)),
    pvDiscoveryRequest: (values) => dispatch(PlanActions.pvDiscoveryRequest(values)),
    resetCurrentPlan: () => dispatch(PlanActions.resetCurrentPlan()),
    setCurrentPlan: (plan) => dispatch(PlanActions.setCurrentPlan(plan)),
    updateCurrentPlanStatus: (status) => dispatch(PlanActions.updateCurrentPlanStatus(status)),
    pvUpdatePollStop: () => dispatch(PlanActions.pvUpdatePollStop()),
    watchHookAddEditStatus: (hookName) => {
      // Push the add edit status into watching state, and start watching
      dispatch(
        PlanActions.setHookAddEditStatus(
          createAddEditStatus(AddEditState.Watching, AddEditMode.Edit)
        )
      );
      dispatch(PlanActions.watchHookAddEditStatus(hookName));
    },
    cancelAddEditWatch: () => dispatch(PlanActions.cancelWatchHookAddEditStatus()),
    resetAddEditState: () => {
      dispatch(PlanActions.setHookAddEditStatus(defaultAddEditStatus()));
    },
    removeHookFromPlanRequest: (name, migrationStep) =>
      dispatch(PlanActions.removeHookFromPlanRequest(name, migrationStep)),
    updateHookRequest: (migHook) => dispatch(PlanActions.updateHookRequest(migHook)),
    associateHookToPlan: (hookValues, migHook) =>
      dispatch(PlanActions.associateHookToPlan(hookValues, migHook)),
    validatePlanPollStop: () => dispatch(PlanActions.validatePlanPollStop()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WizardContainer);
