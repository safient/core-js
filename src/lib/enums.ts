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
   export enum ProofSubmission{
     Not_Submitted,
     Submitted
   }

   
   export enum ClaimType {
    SignalBased = 0,
    ArbitrationBased = 1,
    DDayBased = 2,
    ExpirationBased = 3
   }