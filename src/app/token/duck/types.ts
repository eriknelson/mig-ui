import { INameNamespaceRef } from '../../common/duck/types';

export interface IMigToken {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
  };
  spec: {
    migClusterRef: INameNamespaceRef;
    migrationControllerRef?: INameNamespaceRef;
    secretRef: INameNamespaceRef;
  };
  status: {
    observedDigest: string;
    type: string;
    expiresAt: string;
  };
}

// NATODO: Define the token secret type
// probably needs some shared fields like kind and metadata
// export interface ITokenSecret {
//   data: {
//     token: string;
//   }
// }

export interface IToken {
  MigToken: IMigToken;
  // Secret: ITokenSecret;
  Secret: {
    data: {
      token: string;
    };
  };
}
