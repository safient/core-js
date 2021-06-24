import { Client, ThreadID } from '@textile/hub';
import { JWE } from 'did-jwt';

export type Connection = {
  client: Client;
  threadId: ThreadID;
};

export type User = {
  _id: string;
  _mod: number;
  did: string;
  email: string;
  name: string;
  safes: Safe[];
  signUpMode: number;
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
  creator: string;
  guardians: string[];
  recipient: string;
  encSafeKey: Object;
  encSafeData: Object;
  stage: number;
  encSafeKeyShards: Shard[];
};

export type Shard = {
  status: number;
  encShard: JWE;
  decData: null | Record<string, any>;
};
