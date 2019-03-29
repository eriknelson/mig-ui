import {
  NamespacedResource,
  IGroupVersionKindPlural,
} from './common';

export class MigResource extends NamespacedResource {
  private _gvk: IGroupVersionKindPlural;
  constructor(kind: MigResource.Kind, namespace: string) {
    super(namespace);

    this._gvk = {
      group: 'migration.openshift.io',
      version: 'v1alpha1',
      kindPlural: kind,
    };
  }
  gvk(): IGroupVersionKindPlural {
    return this._gvk;
  }
}

export namespace MigResource {
  export enum Kind {
    MigPlan = 'migplans',
    MigStorage = 'migstorage',
    MigAssetCollection = 'migassetcollections',
    MigStage = 'migstages',
    MigMigration = 'migmigrations',
  }
}
