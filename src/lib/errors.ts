export const Errors = {
    UserNotFound : {
        code: 10,
        message: "User not found"
    },
    UserAlreadyExists: {
        code: 11,
        message: "User already exists"
    },
    GuardianNotFound: {
        code: 12,
        message: "Guardian not Found"
    },
    SafeNotCreated: {
        code: 201,
        message: "Safe not created"
    },
    SafeNotFound: {
        code: 202,
        message: "Safe not found"
    },
    ClaimNotCreated: {
        code: 203,
        message: "Claim not created"
    },
    GuardianRecoveryFailure: {
        code: 204,
        message: "Guardian Recovery failed"
    },
   CreatorRecoveryFailure: {
        code: 205,
        message: "Guardian Recovery failed"
    },
    BeneficiaryRecoveryFailure: {
        code: 206,
        message: "Guardian Recovery failed"
    },
    StageNotUpdated: {
        code: 207,
        message: "Safe cannot be claimed. No claims or guardian recovery found for this safe!"
    },
    OnChainSafeNotFound: {
        code: 208,
        message: "Error while fetching onChain Safe Data"
    },
    OnChainClaimStatus: {
        code: 209,
        message: "Error while fetching onChain Safe Status"
    },
    SyncStageFailure: {
        code: 211,
        message: "Error while syyncing safes stages"
    },
    RulingFailure:{
        code: 212,
        message: "Error while giving ruling to the safe"
    },
    SignalCreateFailure:{
        code: 213,
        message: "Error while creating a signal for a safe"
    },
    IncentivizationFailure:{
        code: 214,
        message: "Error while incentivizing guardians"
    },
    RewardsAccessFailure:{
        code: 215,
        message: "Error while Fetching rewards"
    },
    RewardsClaimFailure:{
        code: 216,
        message: "Error while claiming rewards"
    },
    DDayUpdateFailure:{
        code: 216,
        message: "Error while updating the D-Day"
    },
    SelfSafeCreation:{
        code: 217,
        message: "Cannot create self safe."
    },
    IncentivizationComplete:{
        code: 218,
        message: "Incentivization already submitted."
    },
    TransactionFailure: {
        code: 31,
        message: "Transaction Failed"
    },
    WalletBalance: {
        code: 32,
        message: "Transaction cannot be created due to low Wallet Balance."
    },
    CommonError: {
        code: 2,
        message: "Something went wrong"
    }
}