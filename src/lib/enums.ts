export enum SafeStages {
    ACTIVE,
    CLAIMING,
    RECOVERING,
    RECOVERED,
    CLAIMED,
  }
  
export const ClaimStages = {
      "ACTIVE": 0,
      "PASSED": 1,
      "FAILED": 2,
      "REJECTED": 3
  }

  export enum NetworkType {
    localhost,
    mainnet,
    devnet,
    testnet
  }
 
  export enum DatabaseType {
    threadDB,
    mongoDB
  }
  