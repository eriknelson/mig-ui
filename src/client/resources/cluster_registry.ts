import {
  NamespacedResource,
  IGroupVersionKindPlural,
} from './common';

export class ClusterRegistryResource extends NamespacedResource {
  private _gvk: IGroupVersionKindPlural;
  constructor(kind: ClusterRegistryResource.Kind, namespace: string) {
    super(namespace);

    this._gvk = {
      group: 'clusterregistry.k8s.io',
      version: 'v1alpha1',
      kindPlural: kind,
    };
  }
  gvk(): IGroupVersionKindPlural {
    return this._gvk;
  }
}

export namespace ClusterRegistryResource {
  export enum Kind {
    Cluster = 'clusters',
  }
}
