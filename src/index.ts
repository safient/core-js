import { SafientCore } from './SafientCore';
export class SafientSDK {
  safientCore: SafientCore;

  constructor(seed: Uint8Array) {
    this.safientCore = new SafientCore(seed);
  }
}
