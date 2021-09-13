import { JsonRpcSigner } from '@ethersproject/providers';
import { SafientCore } from './SafientCore';
export class SafientSDK {
  safientCore: SafientCore;

  constructor(signer: JsonRpcSigner, chainId: number, databaseType: string) {
    this.safientCore = new SafientCore(signer, chainId, databaseType);
  }
}
