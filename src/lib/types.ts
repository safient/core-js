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
  guardian: boolean
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
  guardian: boolean
};


export type UserMeta = {
  name: string;
  email: string;
  did: string;
};


export type SafeMeta = {
  safeName: string
  safeId: string;
  type: string;
  decShard: DecShard | null
};

export interface Safe {
  _id: string;
  safeName: string,
  description: string,
  creator: string;
  guardians: string[]; 
  beneficiary: string;
  encSafeKey: JWE;
  encSafeData: Buffer;
  stage: number;
  encSafeKeyShards: Shard[];
  decSafeKeyShards: DecShard[];
  claims: Claim[];
  onChain: boolean;
  claimType: Types.ClaimType;
  signalingPeriod: number,
  dDay: number,
  timeStamp: number,
  proofSubmission: boolean,
  cid: string
};

export type SafeCreation = {
  safeName: string,
  description: string,
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
  dDay: number,
  timeStamp: number,
  proofSubmission: boolean,
  cid: string | null
};


export type Claim = {
  createdBy: string | undefined;
  claimStatus: number;
  disputeId: number;
  timeStamp: number;
}

export type Shard = {
  data: any;
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
}


export type SafeRecovered = {
  status: boolean;
  data: any
}

export type SafeCreationResponse = {
  safeId: string;
  creatorEmail: string;
  beneficiaryEmail: string;
  phoneNo: string;
}

export type ClaimResponse = {
  disputeId: string;
  creatorEmail: string;
  phoneNo: string;
}

export type EventResponse = {
  id: string;
  recepient: Recepient
}

export type Recepient = {
  name: string,
  email: string,
  phone: string,
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

export type GenericError = {
  code: number,
  message: string
}

export type SafeLink = {
  creator: string;
  guardians: string[];
  beneficiary: string;
  encSafeKey: JWE;
  encSafeData: Buffer;
  encSafeKeyShards: Shard[];
  onChain: boolean;
  claimType: Types.ClaimType;
  signalingPeriod: number,
  dDay: number,
  timeStamp: number
}
export type DecShard = {
  share: Buffer,
  secret: string
}

export type CeramicDefintions = {
  definitions: {
    profile: string,
    portfolio:string,
    encryptionKey: string
  },
  schemas: {
    profile: string,
    portfolio: string,
    encryptionKey: string
  }
}
