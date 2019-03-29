import { IResource } from './resources/common';
import axios, { AxiosPromise, AxiosInstance } from 'axios';

export interface IClusterClient {
  list(resource: IResource): Promise<any>;
  get(resource: IResource, name: string): Promise<any>;
  patch(resource: IResource, name: string, patch: object): Promise<any>;
  create(resource: IResource, newObject: object): Promise<any>
  delete(resource: IResource, name: string): Promise<any>;
}

export class ClusterClient {
  private token: string;
  private apiRoot: string;
  private requester: AxiosInstance;

  constructor(apiRoot: string, token: string) {
    this.apiRoot = apiRoot;
    this.token = token;
    this.requester = axios.create({
      baseURL: this.apiRoot,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      responseType: 'json',
    });
  }

  public list(resource: IResource): AxiosPromise<any> {
    return this.requester.get(resource.listPath());
  }
  public get(resource: IResource, name: string): AxiosPromise<any> {
    return this.requester.get(resource.namedPath(name));
  }
  public patch(resource: IResource, name: string, patch: object): AxiosPromise<any> {
    return this.requester.patch(resource.namedPath(name), patch);
  }
  public create(resource: IResource, newObject: object): AxiosPromise<any> {
    return this.requester.post(resource.listPath(), newObject);
  }
  public delete(resource: IResource, name: string): AxiosPromise<any> {
    return this.requester.delete(resource.namedPath(name));
  }
}

