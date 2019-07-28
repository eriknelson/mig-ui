
export enum AddEditState {
  Pending = 'pending',
  Watching = 'watching',
  Critical = 'critical',
  Ready = 'ready',
  TimedOut = 'timedout',
}

export enum AddEditMode {
  Add = 'add',
  Edit = 'edit',
}

export interface AddEditStatus {
  mode: AddEditMode;
  state: AddEditState;
  message?: string;
  reason?: string;
}

export const createAddEditStatus = (
  state: AddEditState,
  mode: AddEditMode
): AddEditStatus => {
  return { state, mode };
}

export const createAddEditStatusWithMeta = (
  state: AddEditState,
  mode: AddEditMode,
  message: string,
  reason: string,
): AddEditStatus => {
  return { state, mode, message, reason };
}

export const defaultAddEditStatus = (): AddEditStatus => {
  return {
    state: AddEditState.Pending,
    mode: AddEditMode.Add,
  }
}

export const AddEditConditionCritical = 'Critical';
export const AddEditConditionReady = 'Ready';

const addEditTimeoutSeconds = 20;
export const AddEditWatchTimeout = addEditTimeoutSeconds * 1000;

const addEditPollIntervalSeconds = 4;
export const AddEditWatchTimeoutPollInterval = addEditPollIntervalSeconds * 1000;

export const addEditStatusStr = (componentType: string) => (status: AddEditStatus) => {
  switch(status.state) {
    case AddEditState.Pending: {
      return `Ready to create a ${componentType}`;
    }
    case AddEditState.Critical: {
      return `Connection failed: ${status.message} | ${status.reason}`;
    }
    case AddEditState.Ready: {
      return `Connection successful`;
    }
    case AddEditState.Watching: {
      return `Validating connection...`;
    }
    case AddEditState.TimedOut: {
      return `Validation timed out, double check your inputs and try again?`
    }
    default: {
      return `AddEditStatus fell into an unknown state`;
    }
  }
}
