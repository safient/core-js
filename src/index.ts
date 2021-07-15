import { JsonRpcSigner } from '@ethersproject/providers';
import { SafientCore } from './SafientCore';
export class SafientSDK {
  safientCore: SafientCore;

  constructor(signer: JsonRpcSigner, chainId: number) {
    this.safientCore = new SafientCore(signer, chainId);
  }
}
