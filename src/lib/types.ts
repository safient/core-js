import { IDX } from '@ceramicstudio/idx';
import { Client, ThreadID } from '@textile/hub';
import { JsonRpcSigner } from '@ethersproject/providers';
import { JWE } from 'did-jwt';
import {Types} from '@safient/contracts'
import { Database } from '../database';
import { Crypto } from '../crypto';
import { Wallet } from 'ethers';
import CeramicClient from '@ceramicnetwork/http-client';


export type Signer = JsonRpcSigner | Wallet

export type Connection = {
  client: Client;
  threadId: ThreadID;
  idx: IDX | null;
};

export type UserSchema = {
  did: string;
  email: string;
  name: string;
  safes: SafeMeta[];
  signUpMode: number;
  userAddress: string;
};

export interface User {
  _id: string;
  _mod: number;
  did: string;
  email: string;
  name: string;
  safes: SafeMeta[];
  signUpMode: number;
  userAddress: string;
};


export type UserMeta = {
  name: string;
  email: string;
  did: string;
};


export type SafeMeta = {
  safeId: string;
  type: string;
};

export interface Safe {
  _id: string;
  creator: string;
  guardians: string[];
  beneficiary: string;
  encSafeKey: JWE;
  encSafeData: Buffer;
  stage: number;
  encSafeKeyShards: Shard[];
  claims: Claim[];
  onChain: boolean;
  claimType: Types.ClaimType;
  signalingPeriod: number,
  dDay: number
};

export type SafeCreation = {
  creator: string | undefined;
  guardians: string[];
  beneficiary: string | undefined;
  encSafeKey: JWE;
  encSafeData: Buffer;
  stage: number;
  encSafeKeyShards: Shard[];
  claims: Claim[];
  onChain: boolean;
  claimType: Types.ClaimType;
  signalingPeriod: number,
  dDay: number
};


export type Claim = {
  createdBy: string | undefined;
  claimStatus: number;
  disputeId: number
}

export type Shard = {
  status: number;
  encShard: any;
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

export type Evidence = {
  fileURI: string;
  fileHash: string;
  fileTypeExtension: string;
  name: string;
  description: string;
}

export type Share = {
  beneficiaryEncKey : JWE;
  message: any;
  signature: any;
}

export type SafeEncrypted = {
  creatorEncKey: JWE,
  beneficiaryEncKey: JWE,
  encryptedData: Buffer,
  shardData: Shard[],
}


export type RegisterStatus = {
  status: boolean;
  user: User;
};

export type Utils = {
  database: Database;
  crypto: Crypto;
}

export type CeramicIdx = {
  ceramic: CeramicClient | null;
  idx: IDX | null
}

export type UserResponse = {
  status: boolean;
  data: User | null;
  idx: IDX | null;
  error: Error | null
}

export type SafeResponse = {
  status: boolean;
  data: Safe | null;
  error: Error | null
}

export type SafeRecovered = {
  status: boolean;
  data: any
}

export type SafeCreationResponse = {
  status: boolean;
  safeId: string | null;
  error: Error | null
}

export type SecretSafe = {
  seedPhrase: string | null,
  privateKey: string | null,
  keyStore: string | null
}

export type Instructions = {
  softwareWallet: string | null,
  hardwareWallet: string | null,
}
export interface CryptoSafe {
   data: SecretSafe | Instructions
}

export interface GenericSafe {
  data: any
}

export type SafeStore = {
  safe: CryptoSafe | GenericSafe
}