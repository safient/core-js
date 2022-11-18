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

export interface User {
  _id: string;
  did: string;
  email?: string;
  name?: string;
  safes: SafeMeta[];
  userAddress: string;
  guardian: boolean
};


export type UserMeta = {
  name?: string;
  email?: string;
  did: string;
};


export type SafeMeta = {
  safeName?: string
  safeId: string;
  type: string;
  decShard: DecShard | null
};

export interface Safe {
  _id: string;
  safeName?: string,
  description?: string,
  creator: string;
  guardians: string[]; 
  beneficiary: string | null;
  encSafeKey: JWE;
  beneficiaryEncSafeKey: JWE | null;
  encSafeData: Buffer;
  stage: number;
  encSafeKeyShards: Shard[];
  decSafeKeyShards: DecShard[];
  claims: Claim[];
  onChain: boolean;
  claim: { type: Types.ClaimType | null, period: number };
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
  beneficiaryEncKey: JWE | null,
  encryptedData: Buffer,
  shardData: Shard[],
  decSardData: DecShard[],
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
  name?: string,
  email?: string,
  phone?: string,
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
  beneficiary: string | null;
  encSafeKey: JWE;
  encSafeData: Buffer;
  encSafeKeyShards: Shard[];
  onChain: boolean;
  claim: { type: Types.ClaimType | null, period: number };
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
