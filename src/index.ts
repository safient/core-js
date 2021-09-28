import { SafientCore } from './SafientCore';
import { Wallet } from "ethers"

import { Signer } from "./types/types"

export class SafientSDK {
  safientCore: SafientCore;

  constructor(signer: Signer, chainId: number, databaseType: string) {
    this.safientCore = new SafientCore(signer, chainId, databaseType);

  }
}
