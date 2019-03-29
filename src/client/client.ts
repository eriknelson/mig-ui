import { IResource } from '../resources/common'
import axios, { AxiosPromise, AxiosInstance } from 'axios';

export default class ClusterClient {
  private token: string;
  private apiRoot: string;
  private requester: AxiosInstance;

  constructor(apiRoot: string, token: string) {
    this.apiRoot = apiRoot;
    this.token = token;
    this.requester = axios.create({
      baseURL: this.apiRoot,
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  public list(resource: IResource): AxiosPromise<any> {
    return this.requester.get(resource.listPath());
  }
  public get(resource: IResource, name: string): AxiosPromise<any> {
    return this.requester.get(resource.namedPath(name));
  }
  public patch(resource: IResource, name: string, patch: Object): AxiosPromise<any> {
    return this.requester.patch(resource.namedPath(name), patch);
  }
  public create(resource: IResource, newObject: Object): AxiosPromise<any> {
    return this.requester.post(resource.listPath(), newObject);
  }
  public delete(resource: IResource, name: string): AxiosPromise<any> {
    return this.requester.delete(resource.namedPath(name));
  }
}

