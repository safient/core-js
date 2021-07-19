import { IDX } from '@ceramicstudio/idx';
import { Client, ThreadID } from '@textile/hub';
import { JWE } from 'did-jwt';

export type Connection = {
  client: Client;
  threadId: ThreadID;
  idx: IDX | null;
};

export type User = {
  _id: string;
  _mod: number;
  did: string;
  email: string;
  name: string;
  safes: Safe[];
  signUpMode: number;
  userAddress: string;
};

export type UserBasic = {
  name: string;
  email: string;
  did: string;
};

export type Users = {
  userArray: UserBasic[];
  caller: UserBasic | string;
};

export type Safe = {
  safeId: string;
  type: string;
};

export type SafeData = {
  _id: string;
  creator: string | undefined;
  guardians: string[];
  recipient: string | undefined;
  encSafeKey: JWE;
  encSafeData: Buffer;
  stage: number;
  encSafeKeyShards: Shard[];
  claims: Claims[];
};

export type SafeCreation = {
  creator: string | undefined;
  guardians: string[];
  recipient: string | undefined;
  encSafeKey: JWE;
  encSafeData: Buffer;
  stage: number;
  encSafeKeyShards: Shard[];
  claims: Claims[];
};


export type Claims = {
  createdBy: string | undefined;
  claimStatus: number;
  disputeId: number
}

export type Shard = {
  status: number;
  encShard: JWE;
  decData: any;
};

export type GuardianSecrets = {
  secret: string;
  address: string;
}

export type RecoveryMessage = {
  guardians: GuardianSecrets[];
  hash: string;
  recoveryMessage: string;
  secrets: string[]
}
